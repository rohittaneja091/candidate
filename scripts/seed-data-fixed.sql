-- Seed data for PhD Recruiting Database
-- Run this AFTER create-database.sql

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
('IROS', 'IEEE/RSJ International Conference on Intelligent Robots and Systems', 'Robotics', 'top-tier', 47.0)
ON CONFLICT (name) DO NOTHING;

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
('Data Mining', 'domain')
ON CONFLICT (name) DO NOTHING;

-- Insert research areas
INSERT INTO research_areas (name, parent_area_id) VALUES
-- Top-level areas
('Artificial Intelligence', NULL),
('Computer Systems', NULL),
('Theory of Computation', NULL),
('Human-Computer Interaction', NULL),
('Computer Graphics', NULL),
('Cybersecurity', NULL),
('Bioinformatics', NULL)
ON CONFLICT (name) DO NOTHING;

-- Get IDs for parent areas to insert sub-areas
DO $$
DECLARE
    ai_id UUID;
    systems_id UUID;
    theory_id UUID;
BEGIN
    SELECT id INTO ai_id FROM research_areas WHERE name = 'Artificial Intelligence';
    SELECT id INTO systems_id FROM research_areas WHERE name = 'Computer Systems';
    SELECT id INTO theory_id FROM research_areas WHERE name = 'Theory of Computation';
    
    -- AI sub-areas
    INSERT INTO research_areas (name, parent_area_id) VALUES
    ('Machine Learning', ai_id),
    ('Computer Vision', ai_id),
    ('Natural Language Processing', ai_id),
    ('Robotics', ai_id),
    ('Knowledge Representation', ai_id)
    ON CONFLICT (name) DO NOTHING;
    
    -- Systems sub-areas
    INSERT INTO research_areas (name, parent_area_id) VALUES
    ('Operating Systems', systems_id),
    ('Distributed Systems', systems_id),
    ('Database Systems', systems_id),
    ('Computer Networks', systems_id),
    ('Computer Architecture', systems_id)
    ON CONFLICT (name) DO NOTHING;
    
    -- Theory sub-areas
    INSERT INTO research_areas (name, parent_area_id) VALUES
    ('Algorithms', theory_id),
    ('Complexity Theory', theory_id),
    ('Cryptography', theory_id),
    ('Quantum Computing', theory_id),
    ('Game Theory', theory_id)
    ON CONFLICT (name) DO NOTHING;
END $$;

-- Insert sample candidates
INSERT INTO candidates (name, email, phone, university, department, graduation_year, years_experience) VALUES
('Dr. Sarah Chen', 'sarah.chen@stanford.edu', '+1 (650) 555-0123', 'Stanford University', 'Computer Science', 2024, 4),
('Alex Rodriguez', 'alex.rodriguez@mit.edu', '+1 (617) 555-0456', 'MIT', 'Electrical Engineering and Computer Science', 2024, 5),
('Dr. Priya Patel', 'priya.patel@cmu.edu', NULL, 'Carnegie Mellon University', 'Machine Learning Department', 2024, 3),
('Michael Zhang', 'michael.zhang@berkeley.edu', NULL, 'UC Berkeley', 'Computer Science', 2025, 3),
('Dr. Emily Johnson', 'emily.johnson@caltech.edu', NULL, 'Caltech', 'Computing and Mathematical Sciences', 2024, 4)
ON CONFLICT (email) DO NOTHING;

-- Insert publications for sample candidates
DO $$
DECLARE
    sarah_id UUID;
    alex_id UUID;
    priya_id UUID;
BEGIN
    SELECT id INTO sarah_id FROM candidates WHERE email = 'sarah.chen@stanford.edu';
    SELECT id INTO alex_id FROM candidates WHERE email = 'alex.rodriguez@mit.edu';
    SELECT id INTO priya_id FROM candidates WHERE email = 'priya.patel@cmu.edu';
    
    -- Publications for Sarah Chen
    IF sarah_id IS NOT NULL THEN
        INSERT INTO publications (candidate_id, title, conference, year, citations, url, venue_type, venue_rank, source) VALUES
        (sarah_id, 'Efficient Vision Transformers for Real-time Object Detection', 'NeurIPS', 2023, 127, 'https://example.com/paper1', 'conference', 'top-tier', 'manual'),
        (sarah_id, 'Self-Supervised Learning for Medical Image Analysis', 'ICML', 2023, 89, 'https://example.com/paper2', 'conference', 'top-tier', 'manual'),
        (sarah_id, 'Attention Mechanisms in Multi-Modal Fusion', 'ICLR', 2022, 203, 'https://example.com/paper3', 'conference', 'top-tier', 'manual');
    END IF;
    
    -- Publications for Alex Rodriguez
    IF alex_id IS NOT NULL THEN
        INSERT INTO publications (candidate_id, title, conference, year, citations, url, venue_type, venue_rank, source) VALUES
        (alex_id, 'Scalable Memory Management in Modern Operating Systems', 'ASPLOS', 2023, 156, 'https://example.com/paper4', 'conference', 'top-tier', 'manual'),
        (alex_id, 'High-Performance Networking for Cloud Computing', 'SIGCOMM', 2023, 98, 'https://example.com/paper5', 'conference', 'top-tier', 'manual'),
        (alex_id, 'Container Orchestration at Scale', 'OSDI', 2022, 234, 'https://example.com/paper6', 'conference', 'top-tier', 'manual');
    END IF;
    
    -- Publications for Priya Patel
    IF priya_id IS NOT NULL THEN
        INSERT INTO publications (candidate_id, title, journal, year, citations, url, venue_type, venue_rank, source) VALUES
        (priya_id, 'Quantum Advantage in Machine Learning Tasks', 'Nature Quantum Information', 2023, 312, 'https://example.com/paper7', 'journal', 'top-tier', 'manual'),
        (priya_id, 'Variational Quantum Algorithms for Optimization', 'Physical Review A', 2023, 178, 'https://example.com/paper8', 'journal', 'top-tier', 'manual'),
        (priya_id, 'Noise-Resilient Quantum Machine Learning', 'Quantum Science and Technology', 2022, 145, 'https://example.com/paper9', 'journal', 'mid-tier', 'manual');
    END IF;
END $$;

-- Insert skills for sample candidates
DO $$
DECLARE
    sarah_id UUID;
    alex_id UUID;
    ml_skill_id UUID;
    dl_skill_id UUID;
    cv_skill_id UUID;
    pytorch_skill_id UUID;
    python_skill_id UUID;
    cpp_skill_id UUID;
    systems_skill_id UUID;
BEGIN
    SELECT id INTO sarah_id FROM candidates WHERE email = 'sarah.chen@stanford.edu';
    SELECT id INTO alex_id FROM candidates WHERE email = 'alex.rodriguez@mit.edu';
    
    SELECT id INTO ml_skill_id FROM skills WHERE name = 'Machine Learning';
    SELECT id INTO dl_skill_id FROM skills WHERE name = 'Deep Learning';
    SELECT id INTO cv_skill_id FROM skills WHERE name = 'Computer Vision';
    SELECT id INTO pytorch_skill_id FROM skills WHERE name = 'PyTorch';
    SELECT id INTO python_skill_id FROM skills WHERE name = 'Python';
    SELECT id INTO cpp_skill_id FROM skills WHERE name = 'C++';
    SELECT id INTO systems_skill_id FROM skills WHERE name = 'Distributed Systems';
    
    -- Skills for Sarah Chen
    IF sarah_id IS NOT NULL THEN
        INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level) VALUES
        (sarah_id, ml_skill_id, 'expert'),
        (sarah_id, dl_skill_id, 'expert'),
        (sarah_id, cv_skill_id, 'expert'),
        (sarah_id, pytorch_skill_id, 'expert'),
        (sarah_id, python_skill_id, 'expert')
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Skills for Alex Rodriguez
    IF alex_id IS NOT NULL THEN
        INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level) VALUES
        (alex_id, systems_skill_id, 'expert'),
        (alex_id, cpp_skill_id, 'expert'),
        (alex_id, python_skill_id, 'advanced')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert internships for sample candidates
DO $$
DECLARE
    sarah_id UUID;
    alex_id UUID;
BEGIN
    SELECT id INTO sarah_id FROM candidates WHERE email = 'sarah.chen@stanford.edu';
    SELECT id INTO alex_id FROM candidates WHERE email = 'alex.rodriguez@mit.edu';
    
    -- Internships for Sarah Chen
    IF sarah_id IS NOT NULL THEN
        INSERT INTO internships (candidate_id, company, role, duration, year, description) VALUES
        (sarah_id, 'Google Research', 'Research Intern', '3 months', 2023, 'Worked on computer vision models for autonomous systems'),
        (sarah_id, 'Meta AI', 'ML Research Intern', '4 months', 2022, 'Developed multimodal learning algorithms');
    END IF;
    
    -- Internships for Alex Rodriguez
    IF alex_id IS NOT NULL THEN
        INSERT INTO internships (candidate_id, company, role, duration, year, description) VALUES
        (alex_id, 'Microsoft Research', 'Systems Research Intern', '4 months', 2023, 'Optimized distributed computing frameworks'),
        (alex_id, 'Amazon Web Services', 'Principal Engineer Intern', '3 months', 2022, 'Built scalable cloud infrastructure solutions');
    END IF;
END $$;
