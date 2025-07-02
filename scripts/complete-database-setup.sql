-- PhD Recruiting Database - Complete Setup Script
-- Run this single script in Supabase SQL Editor

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS publication_authors CASCADE;
DROP TABLE IF EXISTS candidate_research_areas CASCADE;
DROP TABLE IF EXISTS candidate_skills CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS publications CASCADE;
DROP TABLE IF EXISTS conferences CASCADE;
DROP TABLE IF EXISTS research_areas CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;

-- Drop existing functions and views
DROP VIEW IF EXISTS candidate_summary CASCADE;
DROP FUNCTION IF EXISTS get_candidate_details(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create candidates table
CREATE TABLE candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    university VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    graduation_year INTEGER,
    years_experience INTEGER DEFAULT 0,
    phd_university VARCHAR(255), -- NEW: Where they got/are getting their PhD
    phd_graduation_year INTEGER, -- NEW: When they graduated/will graduate with PhD
    phd_department VARCHAR(255), -- NEW: PhD department (may differ from current)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create skills table
CREATE TABLE skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50), -- 'programming', 'framework', 'domain', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create research_areas table
CREATE TABLE research_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    parent_area_id UUID REFERENCES research_areas(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create conferences table for tracking top-tier venues
CREATE TABLE conferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(500),
    field VARCHAR(100), -- 'AI/ML', 'Systems', 'Theory', etc.
    tier VARCHAR(20) DEFAULT 'other', -- 'top-tier', 'mid-tier', 'other'
    acceptance_rate DECIMAL(5,2), -- percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create publications table
CREATE TABLE publications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    conference VARCHAR(255),
    journal VARCHAR(255),
    year INTEGER,
    citations INTEGER DEFAULT 0,
    url TEXT,
    abstract TEXT,
    doi VARCHAR(255),
    venue_type VARCHAR(50), -- 'conference' or 'journal'
    venue_rank VARCHAR(20), -- 'top-tier', 'mid-tier', 'other'
    source VARCHAR(50), -- 'OpenAlex', 'Semantic Scholar', 'CrossRef'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create candidate_skills junction table
CREATE TABLE candidate_skills (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
    PRIMARY KEY (candidate_id, skill_id)
);

-- Create candidate_research_areas junction table
CREATE TABLE candidate_research_areas (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    research_area_id UUID REFERENCES research_areas(id) ON DELETE CASCADE,
    PRIMARY KEY (candidate_id, research_area_id)
);

-- Create internships table
CREATE TABLE internships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    duration VARCHAR(100),
    start_date DATE,
    end_date DATE,
    year INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create publication_authors table for handling multiple authors
CREATE TABLE publication_authors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_order INTEGER, -- 1st author, 2nd author, etc.
    is_corresponding BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX idx_candidates_university ON candidates(university);
CREATE INDEX idx_candidates_graduation_year ON candidates(graduation_year);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_name ON candidates(name);
CREATE INDEX idx_candidates_phd_university ON candidates(phd_university);
CREATE INDEX idx_candidates_phd_graduation_year ON candidates(phd_graduation_year);

CREATE INDEX idx_publications_candidate_id ON publications(candidate_id);
CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_publications_conference ON publications(conference);
CREATE INDEX idx_publications_citations ON publications(citations DESC);
CREATE INDEX idx_publications_venue_rank ON publications(venue_rank);

CREATE INDEX idx_candidate_skills_candidate_id ON candidate_skills(candidate_id);
CREATE INDEX idx_candidate_skills_skill_id ON candidate_skills(skill_id);

CREATE INDEX idx_internships_candidate_id ON internships(candidate_id);
CREATE INDEX idx_internships_company ON internships(company);

-- Create trigger for updated_at on candidates table
CREATE TRIGGER update_candidates_updated_at 
    BEFORE UPDATE ON candidates
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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
CREATE POLICY "Allow all operations on candidates" ON candidates FOR ALL USING (true);
CREATE POLICY "Allow all operations on publications" ON publications FOR ALL USING (true);
CREATE POLICY "Allow all operations on skills" ON skills FOR ALL USING (true);
CREATE POLICY "Allow all operations on candidate_skills" ON candidate_skills FOR ALL USING (true);
CREATE POLICY "Allow all operations on research_areas" ON research_areas FOR ALL USING (true);
CREATE POLICY "Allow all operations on candidate_research_areas" ON candidate_research_areas FOR ALL USING (true);
CREATE POLICY "Allow all operations on internships" ON internships FOR ALL USING (true);
CREATE POLICY "Allow all operations on conferences" ON conferences FOR ALL USING (true);
CREATE POLICY "Allow all operations on publication_authors" ON publication_authors FOR ALL USING (true);

-- Insert top-tier conferences
INSERT INTO conferences (name, full_name, field, tier, acceptance_rate) VALUES
('NeurIPS', 'Conference on Neural Information Processing Systems', 'AI/ML', 'top-tier', 20.0),
('ICML', 'International Conference on Machine Learning', 'AI/ML', 'top-tier', 22.0),
('ICLR', 'International Conference on Learning Representations', 'AI/ML', 'top-tier', 24.0),
('ASPLOS', 'International Conference on Architectural Support for Programming Languages and Operating Systems', 'Systems', 'top-tier', 18.0),
('OSDI', 'USENIX Symposium on Operating Systems Design and Implementation', 'Systems', 'top-tier', 16.0),
('SOSP', 'ACM Symposium on Operating Systems Principles', 'Systems', 'top-tier', 15.0),
('SIGCOMM', 'ACM Special Interest Group on Data Communication', 'Networking', 'top-tier', 17.0),
('STOC', 'ACM Symposium on Theory of Computing', 'Theory', 'top-tier', 25.0),
('FOCS', 'IEEE Symposium on Foundations of Computer Science', 'Theory', 'top-tier', 26.0),
('CRYPTO', 'International Cryptology Conference', 'Security', 'top-tier', 20.0),
('USENIX Security', 'USENIX Security Symposium', 'Security', 'top-tier', 19.0),
('CCS', 'ACM Conference on Computer and Communications Security', 'Security', 'top-tier', 18.0),
('ICRA', 'IEEE International Conference on Robotics and Automation', 'Robotics', 'top-tier', 45.0),
('RSS', 'Robotics: Science and Systems', 'Robotics', 'top-tier', 28.0),
('IROS', 'IEEE/RSJ International Conference on Intelligent Robots and Systems', 'Robotics', 'top-tier', 47.0);

-- Insert common skills
INSERT INTO skills (name, category) VALUES
-- Programming Languages
('Python', 'programming'),
('C++', 'programming'),
('Java', 'programming'),
('JavaScript', 'programming'),
('Go', 'programming'),
('Rust', 'programming'),
('R', 'programming'),
('MATLAB', 'programming'),
('SQL', 'programming'),
('Scala', 'programming'),

-- AI/ML Frameworks
('TensorFlow', 'framework'),
('PyTorch', 'framework'),
('Keras', 'framework'),
('Scikit-learn', 'framework'),
('Hugging Face', 'framework'),
('JAX', 'framework'),
('XGBoost', 'framework'),

-- Systems & Infrastructure
('Docker', 'infrastructure'),
('Kubernetes', 'infrastructure'),
('AWS', 'cloud'),
('GCP', 'cloud'),
('Azure', 'cloud'),
('Linux', 'systems'),
('Git', 'tools'),

-- Specialized Technologies
('CUDA', 'parallel-computing'),
('OpenMP', 'parallel-computing'),
('MPI', 'parallel-computing'),
('ROS', 'robotics'),
('Qiskit', 'quantum'),
('Cirq', 'quantum'),

-- Domain Areas
('Machine Learning', 'domain'),
('Deep Learning', 'domain'),
('Computer Vision', 'domain'),
('Natural Language Processing', 'domain'),
('Robotics', 'domain'),
('Quantum Computing', 'domain'),
('Distributed Systems', 'domain'),
('Computer Graphics', 'domain'),
('Human-Computer Interaction', 'domain'),
('Cybersecurity', 'domain'),
('Bioinformatics', 'domain'),
('Data Mining', 'domain');

-- Insert research areas (top-level first)
INSERT INTO research_areas (name, parent_area_id) VALUES
('Artificial Intelligence', NULL),
('Computer Systems', NULL),
('Theory of Computation', NULL),
('Human-Computer Interaction', NULL),
('Computer Graphics', NULL),
('Cybersecurity', NULL),
('Bioinformatics', NULL);

-- Insert sub-areas (using subqueries to get parent IDs)
INSERT INTO research_areas (name, parent_area_id) VALUES
-- AI sub-areas
('Machine Learning', (SELECT id FROM research_areas WHERE name = 'Artificial Intelligence')),
('Computer Vision', (SELECT id FROM research_areas WHERE name = 'Artificial Intelligence')),
('Natural Language Processing', (SELECT id FROM research_areas WHERE name = 'Artificial Intelligence')),
('Robotics', (SELECT id FROM research_areas WHERE name = 'Artificial Intelligence')),
('Knowledge Representation', (SELECT id FROM research_areas WHERE name = 'Artificial Intelligence')),

-- ML sub-areas
('Deep Learning', (SELECT id FROM research_areas WHERE name = 'Machine Learning')),
('Reinforcement Learning', (SELECT id FROM research_areas WHERE name = 'Machine Learning')),
('Generative Models', (SELECT id FROM research_areas WHERE name = 'Machine Learning')),
('Meta-Learning', (SELECT id FROM research_areas WHERE name = 'Machine Learning')),
('Federated Learning', (SELECT id FROM research_areas WHERE name = 'Machine Learning')),

-- Systems sub-areas
('Operating Systems', (SELECT id FROM research_areas WHERE name = 'Computer Systems')),
('Distributed Systems', (SELECT id FROM research_areas WHERE name = 'Computer Systems')),
('Database Systems', (SELECT id FROM research_areas WHERE name = 'Computer Systems')),
('Computer Networks', (SELECT id FROM research_areas WHERE name = 'Computer Systems')),
('Computer Architecture', (SELECT id FROM research_areas WHERE name = 'Computer Systems')),

-- Theory sub-areas
('Algorithms', (SELECT id FROM research_areas WHERE name = 'Theory of Computation')),
('Complexity Theory', (SELECT id FROM research_areas WHERE name = 'Theory of Computation')),
('Cryptography', (SELECT id FROM research_areas WHERE name = 'Theory of Computation')),
('Quantum Computing', (SELECT id FROM research_areas WHERE name = 'Theory of Computation')),
('Game Theory', (SELECT id FROM research_areas WHERE name = 'Theory of Computation'));

-- Insert sample candidates
INSERT INTO candidates (name, email, phone, university, department, graduation_year, years_experience) VALUES
('Dr. Sarah Chen', 'sarah.chen@stanford.edu', '+1 (650) 555-0123', 'Stanford University', 'Computer Science', 2024, 4),
('Alex Rodriguez', 'alex.rodriguez@mit.edu', '+1 (617) 555-0456', 'MIT', 'Electrical Engineering and Computer Science', 2024, 5),
('Dr. Priya Patel', 'priya.patel@cmu.edu', NULL, 'Carnegie Mellon University', 'Machine Learning Department', 2024, 3),
('Michael Zhang', 'michael.zhang@berkeley.edu', NULL, 'UC Berkeley', 'Computer Science', 2025, 3),
('Dr. Emily Johnson', 'emily.johnson@caltech.edu', NULL, 'Caltech', 'Computing and Mathematical Sciences', 2024, 4);

-- Insert publications for Sarah Chen
INSERT INTO publications (candidate_id, title, conference, year, citations, url, venue_type, venue_rank, source) VALUES
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), 'Efficient Vision Transformers for Real-time Object Detection', 'NeurIPS', 2023, 127, 'https://example.com/paper1', 'conference', 'top-tier', 'manual'),
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), 'Self-Supervised Learning for Medical Image Analysis', 'ICML', 2023, 89, 'https://example.com/paper2', 'conference', 'top-tier', 'manual'),
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), 'Attention Mechanisms in Multi-Modal Fusion', 'ICLR', 2022, 203, 'https://example.com/paper3', 'conference', 'top-tier', 'manual');

-- Insert publications for Alex Rodriguez
INSERT INTO publications (candidate_id, title, conference, year, citations, url, venue_type, venue_rank, source) VALUES
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), 'Scalable Memory Management in Modern Operating Systems', 'ASPLOS', 2023, 156, 'https://example.com/paper4', 'conference', 'top-tier', 'manual'),
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), 'High-Performance Networking for Cloud Computing', 'SIGCOMM', 2023, 98, 'https://example.com/paper5', 'conference', 'top-tier', 'manual'),
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), 'Container Orchestration at Scale', 'OSDI', 2022, 234, 'https://example.com/paper6', 'conference', 'top-tier', 'manual');

-- Insert publications for Priya Patel
INSERT INTO publications (candidate_id, title, journal, year, citations, url, venue_type, venue_rank, source) VALUES
((SELECT id FROM candidates WHERE email = 'priya.patel@cmu.edu'), 'Quantum Advantage in Machine Learning Tasks', 'Nature Quantum Information', 2023, 312, 'https://example.com/paper7', 'journal', 'top-tier', 'manual'),
((SELECT id FROM candidates WHERE email = 'priya.patel@cmu.edu'), 'Variational Quantum Algorithms for Optimization', 'Physical Review A', 2023, 178, 'https://example.com/paper8', 'journal', 'top-tier', 'manual'),
((SELECT id FROM candidates WHERE email = 'priya.patel@cmu.edu'), 'Noise-Resilient Quantum Machine Learning', 'Quantum Science and Technology', 2022, 145, 'https://example.com/paper9', 'journal', 'mid-tier', 'manual');

-- Insert skills for Sarah Chen (AI/ML skills)
INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level) VALUES
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), (SELECT id FROM skills WHERE name = 'Machine Learning'), 'expert'),
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), (SELECT id FROM skills WHERE name = 'Deep Learning'), 'expert'),
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), (SELECT id FROM skills WHERE name = 'Computer Vision'), 'expert'),
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), (SELECT id FROM skills WHERE name = 'PyTorch'), 'expert'),
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), (SELECT id FROM skills WHERE name = 'TensorFlow'), 'advanced'),
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), (SELECT id FROM skills WHERE name = 'Python'), 'expert'),
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), (SELECT id FROM skills WHERE name = 'CUDA'), 'advanced');

-- Insert skills for Alex Rodriguez (Systems skills)
INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level) VALUES
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), (SELECT id FROM skills WHERE name = 'Distributed Systems'), 'expert'),
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), (SELECT id FROM skills WHERE name = 'C++'), 'expert'),
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), (SELECT id FROM skills WHERE name = 'Rust'), 'advanced'),
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), (SELECT id FROM skills WHERE name = 'Go'), 'advanced'),
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), (SELECT id FROM skills WHERE name = 'Kubernetes'), 'expert'),
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), (SELECT id FROM skills WHERE name = 'Linux'), 'expert'),
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), (SELECT id FROM skills WHERE name = 'Docker'), 'expert');

-- Insert research areas for Sarah Chen
INSERT INTO candidate_research_areas (candidate_id, research_area_id) VALUES
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), (SELECT id FROM research_areas WHERE name = 'Computer Vision')),
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), (SELECT id FROM research_areas WHERE name = 'Deep Learning')),
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), (SELECT id FROM research_areas WHERE name = 'Generative Models'));

-- Insert research areas for Alex Rodriguez
INSERT INTO candidate_research_areas (candidate_id, research_area_id) VALUES
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), (SELECT id FROM research_areas WHERE name = 'Computer Systems')),
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), (SELECT id FROM research_areas WHERE name = 'Operating Systems')),
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), (SELECT id FROM research_areas WHERE name = 'Distributed Systems'));

-- Insert internships
INSERT INTO internships (candidate_id, company, role, duration, year, description) VALUES
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), 'Google Research', 'Research Intern', '3 months', 2023, 'Worked on computer vision models for autonomous systems'),
((SELECT id FROM candidates WHERE email = 'sarah.chen@stanford.edu'), 'Meta AI', 'ML Research Intern', '4 months', 2022, 'Developed multimodal learning algorithms'),
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), 'Microsoft Research', 'Systems Research Intern', '4 months', 2023, 'Optimized distributed computing frameworks'),
((SELECT id FROM candidates WHERE email = 'alex.rodriguez@mit.edu'), 'Amazon Web Services', 'Principal Engineer Intern', '3 months', 2022, 'Built scalable cloud infrastructure solutions');

-- Create a comprehensive view for easy candidate data retrieval
CREATE VIEW candidate_summary AS
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
LEFT JOIN candidate_research_areas cra ON c.id = cra.research_area_id
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

-- Success message
SELECT 'Database setup completed successfully! You now have:' as message
UNION ALL
SELECT '- ' || COUNT(*) || ' candidates' FROM candidates
UNION ALL
SELECT '- ' || COUNT(*) || ' publications' FROM publications
UNION ALL
SELECT '- ' || COUNT(*) || ' skills' FROM skills
UNION ALL
SELECT '- ' || COUNT(*) || ' research areas' FROM research_areas
UNION ALL
SELECT '- ' || COUNT(*) || ' conferences' FROM conferences;
