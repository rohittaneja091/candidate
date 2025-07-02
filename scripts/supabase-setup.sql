-- Run this in your Supabase SQL editor to set up the database

-- Enable Row Level Security (RLS)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_research_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_authors ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your authentication needs)
-- For development/demo purposes, allowing all operations
-- In production, you should restrict these based on user roles

CREATE POLICY "Allow all operations on candidates" ON candidates FOR ALL USING (true);
CREATE POLICY "Allow all operations on publications" ON publications FOR ALL USING (true);
CREATE POLICY "Allow all operations on skills" ON skills FOR ALL USING (true);
CREATE POLICY "Allow all operations on candidate_skills" ON candidate_skills FOR ALL USING (true);
CREATE POLICY "Allow all operations on research_areas" ON research_areas FOR ALL USING (true);
CREATE POLICY "Allow all operations on candidate_research_areas" ON candidate_research_areas FOR ALL USING (true);
CREATE POLICY "Allow all operations on internships" ON internships FOR ALL USING (true);
CREATE POLICY "Allow all operations on conferences" ON conferences FOR ALL USING (true);
CREATE POLICY "Allow all operations on publication_authors" ON publication_authors FOR ALL USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_publications_citations ON publications(citations DESC);
CREATE INDEX IF NOT EXISTS idx_publications_venue_rank ON publications(venue_rank);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_name ON candidates(name);

-- Create a comprehensive view for easy candidate data retrieval
CREATE OR REPLACE VIEW candidate_summary AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.university,
    c.department,
    c.graduation_year,
    c.years_experience,
    c.created_at,
    c.updated_at,
    COUNT(DISTINCT p.id) as publication_count,
    COALESCE(SUM(p.citations), 0) as total_citations,
    COUNT(DISTINCT CASE WHEN p.venue_rank = 'top-tier' THEN p.id END) as top_tier_publications,
    ARRAY_AGG(DISTINCT s.name ORDER BY s.name) FILTER (WHERE s.name IS NOT NULL) as skills,
    ARRAY_AGG(DISTINCT ra.name ORDER BY ra.name) FILTER (WHERE ra.name IS NOT NULL) as research_areas,
    ARRAY_AGG(DISTINCT i.company ORDER BY i.company) FILTER (WHERE i.company IS NOT NULL) as companies,
    ARRAY_AGG(DISTINCT i.role ORDER BY i.role) FILTER (WHERE i.role IS NOT NULL) as roles
FROM candidates c
LEFT JOIN publications p ON c.id = p.candidate_id
LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
LEFT JOIN skills s ON cs.skill_id = s.id
LEFT JOIN candidate_research_areas cra ON c.id = cra.candidate_id
LEFT JOIN research_areas ra ON cra.research_area_id = ra.id
LEFT JOIN internships i ON c.id = i.candidate_id
GROUP BY c.id, c.name, c.email, c.phone, c.university, c.department, c.graduation_year, c.years_experience, c.created_at, c.updated_at;

-- Create a function to get candidate details with all related data
CREATE OR REPLACE FUNCTION get_candidate_details(candidate_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'candidate', row_to_json(c),
        'publications', COALESCE(pub_array.publications, '[]'::json),
        'skills', COALESCE(skills_array.skills, '[]'::json),
        'research_areas', COALESCE(research_array.research_areas, '[]'::json),
        'internships', COALESCE(intern_array.internships, '[]'::json)
    ) INTO result
    FROM candidates c
    LEFT JOIN (
        SELECT 
            candidate_id,
            json_agg(json_build_object(
                'id', id,
                'title', title,
                'conference', conference,
                'journal', journal,
                'year', year,
                'citations', citations,
                'url', url,
                'venue_rank', venue_rank
            )) as publications
        FROM publications 
        WHERE candidate_id = candidate_uuid
        GROUP BY candidate_id
    ) pub_array ON c.id = pub_array.candidate_id
    LEFT JOIN (
        SELECT 
            cs.candidate_id,
            json_agg(json_build_object(
                'name', s.name,
                'category', s.category,
                'proficiency_level', cs.proficiency_level
            )) as skills
        FROM candidate_skills cs
        JOIN skills s ON cs.skill_id = s.id
        WHERE cs.candidate_id = candidate_uuid
        GROUP BY cs.candidate_id
    ) skills_array ON c.id = skills_array.candidate_id
    LEFT JOIN (
        SELECT 
            cra.candidate_id,
            json_agg(ra.name) as research_areas
        FROM candidate_research_areas cra
        JOIN research_areas ra ON cra.research_area_id = ra.id
        WHERE cra.candidate_id = candidate_uuid
        GROUP BY cra.candidate_id
    ) research_array ON c.id = research_array.candidate_id
    LEFT JOIN (
        SELECT 
            candidate_id,
            json_agg(json_build_object(
                'company', company,
                'role', role,
                'duration', duration,
                'year', year,
                'description', description
            )) as internships
        FROM internships 
        WHERE candidate_id = candidate_uuid
        GROUP BY candidate_id
    ) intern_array ON c.id = intern_array.candidate_id
    WHERE c.id = candidate_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
