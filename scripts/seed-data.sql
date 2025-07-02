-- Seed data for PhD Recruiting Database

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

-- Insert research areas
INSERT INTO research_areas (name, parent_area_id) VALUES
-- Top-level areas
('Artificial Intelligence', NULL),
('Computer Systems', NULL),
('Theory of Computation', NULL),
('Human-Computer Interaction', NULL),
('Computer Graphics', NULL),
('Cybersecurity', NULL),
('Bioinformatics', NULL),

-- AI sub-areas
('Machine Learning', 1),
('Computer Vision', 1),
('Natural Language Processing', 1),
('Robotics', 1),
('Knowledge Representation', 1),

-- ML sub-areas
('Deep Learning', 8),
('Reinforcement Learning', 8),
('Generative Models', 8),
('Meta-Learning', 8),
('Federated Learning', 8),

-- Systems sub-areas
('Operating Systems', 2),
('Distributed Systems', 2),
('Database Systems', 2),
('Computer Networks', 2),
('Computer Architecture', 2),

-- Theory sub-areas
('Algorithms', 3),
('Complexity Theory', 3),
('Cryptography', 3),
('Quantum Computing', 3),
('Game Theory', 3);

-- Insert sample candidates
INSERT INTO candidates (name, email, phone, university, department, graduation_year, years_experience) VALUES
('Dr. Sarah Chen', 'sarah.chen@stanford.edu', '+1 (650) 555-0123', 'Stanford University', 'Computer Science', 2024, 4),
('Alex Rodriguez', 'alex.rodriguez@mit.edu', '+1 (617) 555-0456', 'MIT', 'Electrical Engineering and Computer Science', 2024, 5),
('Dr. Priya Patel', 'priya.patel@cmu.edu', NULL, 'Carnegie Mellon University', 'Machine Learning Department', 2024, 3),
('Michael Zhang', 'michael.zhang@berkeley.edu', NULL, 'UC Berkeley', 'Computer Science', 2025, 3),
('Dr. Emily Johnson', 'emily.johnson@caltech.edu', NULL, 'Caltech', 'Computing and Mathematical Sciences', 2024, 4);

-- Insert publications for Sarah Chen (candidate_id = 1)
INSERT INTO publications (candidate_id, title, conference, year, citations, url, venue_type, venue_rank) VALUES
(1, 'Efficient Vision Transformers for Real-time Object Detection', 'NeurIPS', 2023, 127, 'https://example.com/paper1', 'conference', 'top-tier'),
(1, 'Self-Supervised Learning for Medical Image Analysis', 'ICML', 2023, 89, 'https://example.com/paper2', 'conference', 'top-tier'),
(1, 'Attention Mechanisms in Multi-Modal Fusion', 'ICLR', 2022, 203, 'https://example.com/paper3', 'conference', 'top-tier');

-- Insert publications for Alex Rodriguez (candidate_id = 2)
INSERT INTO publications (candidate_id, title, conference, year, citations, url, venue_type, venue_rank) VALUES
(2, 'Scalable Memory Management in Modern Operating Systems', 'ASPLOS', 2023, 156, 'https://example.com/paper4', 'conference', 'top-tier'),
(2, 'High-Performance Networking for Cloud Computing', 'SIGCOMM', 2023, 98, 'https://example.com/paper5', 'conference', 'top-tier'),
(2, 'Container Orchestration at Scale', 'OSDI', 2022, 234, 'https://example.com/paper6', 'conference', 'top-tier');

-- Insert skills for candidates
-- Sarah Chen - AI/ML skills
INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level) VALUES
(1, (SELECT id FROM skills WHERE name = 'Machine Learning'), 'expert'),
(1, (SELECT id FROM skills WHERE name = 'Deep Learning'), 'expert'),
(1, (SELECT id FROM skills WHERE name = 'Computer Vision'), 'expert'),
(1, (SELECT id FROM skills WHERE name = 'PyTorch'), 'expert'),
(1, (SELECT id FROM skills WHERE name = 'TensorFlow'), 'advanced'),
(1, (SELECT id FROM skills WHERE name = 'Python'), 'expert'),
(1, (SELECT id FROM skills WHERE name = 'CUDA'), 'advanced');

-- Alex Rodriguez - Systems skills
INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level) VALUES
(2, (SELECT id FROM skills WHERE name = 'Distributed Systems'), 'expert'),
(2, (SELECT id FROM skills WHERE name = 'C++'), 'expert'),
(2, (SELECT id FROM skills WHERE name = 'Rust'), 'advanced'),
(2, (SELECT id FROM skills WHERE name = 'Go'), 'advanced'),
(2, (SELECT id FROM skills WHERE name = 'Kubernetes'), 'expert'),
(2, (SELECT id FROM skills WHERE name = 'Linux'), 'expert'),
(2, (SELECT id FROM skills WHERE name = 'Docker'), 'expert');

-- Insert research areas for candidates
-- Sarah Chen
INSERT INTO candidate_research_areas (candidate_id, research_area_id) VALUES
(1, (SELECT id FROM research_areas WHERE name = 'Computer Vision')),
(1, (SELECT id FROM research_areas WHERE name = 'Deep Learning')),
(1, (SELECT id FROM research_areas WHERE name = 'Generative Models'));

-- Alex Rodriguez
INSERT INTO candidate_research_areas (candidate_id, research_area_id) VALUES
(2, (SELECT id FROM research_areas WHERE name = 'Computer Systems')),
(2, (SELECT id FROM research_areas WHERE name = 'Operating Systems')),
(2, (SELECT id FROM research_areas WHERE name = 'Distributed Systems'));

-- Insert internships
INSERT INTO internships (candidate_id, company, role, duration, year, description) VALUES
(1, 'Google Research', 'Research Intern', '3 months', 2023, 'Worked on computer vision models for autonomous systems'),
(1, 'Meta AI', 'ML Research Intern', '4 months', 2022, 'Developed multimodal learning algorithms'),
(2, 'Microsoft Research', 'Systems Research Intern', '4 months', 2023, 'Optimized distributed computing frameworks'),
(2, 'Amazon Web Services', 'Principal Engineer Intern', '3 months', 2022, 'Built scalable cloud infrastructure solutions');
