-- PhD Recruiting Database Schema
-- Run this script first to create all tables

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    university VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    graduation_year INTEGER,
    years_experience INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50), -- 'programming', 'framework', 'domain', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create research_areas table
CREATE TABLE IF NOT EXISTS research_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    parent_area_id UUID REFERENCES research_areas(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create conferences table for tracking top-tier venues
CREATE TABLE IF NOT EXISTS conferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(500),
    field VARCHAR(100), -- 'AI/ML', 'Systems', 'Theory', etc.
    tier VARCHAR(20) DEFAULT 'other', -- 'top-tier', 'mid-tier', 'other'
    acceptance_rate DECIMAL(5,2), -- percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create publications table
CREATE TABLE IF NOT EXISTS publications (
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
CREATE TABLE IF NOT EXISTS candidate_skills (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
    PRIMARY KEY (candidate_id, skill_id)
);

-- Create candidate_research_areas junction table
CREATE TABLE IF NOT EXISTS candidate_research_areas (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    research_area_id UUID REFERENCES research_areas(id) ON DELETE CASCADE,
    PRIMARY KEY (candidate_id, research_area_id)
);

-- Create internships table
CREATE TABLE IF NOT EXISTS internships (
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
CREATE TABLE IF NOT EXISTS publication_authors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_order INTEGER, -- 1st author, 2nd author, etc.
    is_corresponding BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_candidates_university ON candidates(university);
CREATE INDEX IF NOT EXISTS idx_candidates_graduation_year ON candidates(graduation_year);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_name ON candidates(name);

CREATE INDEX IF NOT EXISTS idx_publications_candidate_id ON publications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_publications_year ON publications(year);
CREATE INDEX IF NOT EXISTS idx_publications_conference ON publications(conference);
CREATE INDEX IF NOT EXISTS idx_publications_citations ON publications(citations DESC);
CREATE INDEX IF NOT EXISTS idx_publications_venue_rank ON publications(venue_rank);

CREATE INDEX IF NOT EXISTS idx_candidate_skills_candidate_id ON candidate_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_skill_id ON candidate_skills(skill_id);

CREATE INDEX IF NOT EXISTS idx_internships_candidate_id ON internships(candidate_id);
CREATE INDEX IF NOT EXISTS idx_internships_company ON internships(company);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at on candidates table
CREATE TRIGGER update_candidates_updated_at 
    BEFORE UPDATE ON candidates
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
