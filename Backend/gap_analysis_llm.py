#!/usr/bin/env python3
"""
Gap Analysis LLM Script

This script leverages Langchain and OpenAI API (GPT-4.1 mini) to perform gap analysis
based on resume data and target job descriptions. It provides comprehensive analysis
including fit scores, strengths, gaps, and improvement roadmaps.

Author: DevClimb Team
Version: 1.0
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SkillRating(BaseModel):
    """Pydantic model for skill ratings"""
    skill: str
    rating: int


class WorkExperience(BaseModel):
    """Pydantic model for work experience"""
    company: str
    role: str
    skills_used: List[SkillRating]


class Project(BaseModel):
    """Pydantic model for projects"""
    name: str
    description: str
    skills_used: List[SkillRating]


class Certification(BaseModel):
    """Pydantic model for certifications"""
    name: str


class ParsedResume(BaseModel):
    """Pydantic model for parsed resume data"""
    work_experience: List[WorkExperience]
    projects: List[Project]
    certifications: List[Certification]
    skills_used: List[SkillRating]


class GapAnalysisLLM:
    """
    Main class for performing gap analysis using LLM
    """
    
    def __init__(self):
        """
        Initialize the GapAnalysisLLM with OpenAI API key
        
        Args:
            api_key: OpenAI API key. If None, will use OPENAI_API_KEY env variable
        """
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass api_key parameter.")
        
        self.llm = ChatOpenAI(
            model="gpt-4.1-mini",  # GPT-4.1 mini equivalent
            temperature=0.1,
            api_key=self.api_key
        )
        
        # Load skill map and roles data
        self.skill_map = self._load_skill_map()

    
    def _load_skill_map(self) -> Dict[str, Any]:
        """Load skill map from JSON file"""
        try:
            with open('data/skill_map.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error("skill_map.json not found in data/ directory")
            return {}
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing skill_map.json: {e}")
            return {}
    

    
    def parse_resume(self, resume_text: str) -> Dict[str, Any]:
        """
        Parse resume text into structured JSON format using OpenAI API
        
        Args:
            resume_text: Free text format of the resume
            
        Returns:
            Dict containing parsed resume data in structured format
        """
        try:
            system_prompt = """
            You are an expert resume parser. Parse the given resume text and extract information into a structured JSON format.
            
            Extract the following information:
            1. Work Experience: company name, role/title, and skills used with ratings (1-5 scale)
            2. Projects: project name, description, and skills used with ratings (1-5 scale)  
            3. Certifications: certification names
            4. Overall Skills: consolidated list of all skills with average/overall ratings
            
            Rate skills based on:
            - 5: Expert level, extensive experience, leadership in this skill
            - 4: Advanced level, significant experience, can mentor others
            - 3: Intermediate level, solid working knowledge
            - 2: Basic level, some experience but needs guidance
            - 1: Beginner level, minimal exposure
            
            Return ONLY valid JSON in this exact format:
            {
              "work_experience": [
                {
                  "company": "Company Name",
                  "role": "Job Title",
                  "skills_used": [
                    {
                      "skill": "Skill Name",
                      "rating": 1-5
                    }
                  ]
                }
              ],
              "projects": [
                {
                  "name": "Project Name",
                  "description": "Project description and achievements",
                  "skills_used": [
                    {
                      "skill": "Skill Name", 
                      "rating": 1-5
                    }
                  ]
                }
              ],
              "certifications": [
                {
                  "name": "Certification Name"
                }
              ],
              "skills_used": [
                {
                  "skill": "Skill Name",
                  "rating": 1-5
                }
              ]
            }
            """
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Parse this resume:\n\n{resume_text}")
            ]
            
            response = self.llm.invoke(messages)
            
            # Parse the JSON response
            try:
                parsed_data = json.loads(response.content)
                logger.info("Successfully parsed resume")
                logger.info(f"Parsed data: {parsed_data}")
                return parsed_data
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing LLM response as JSON: {e}")
                logger.error(f"LLM Response: {response.content}")
                raise ValueError("Failed to parse resume - invalid JSON response from LLM")
                
        except Exception as e:
            logger.error(f"Error in parse_resume: {e}")
            raise
    
    def perform_gap_analysis(self, parsed_resume: Dict[str, Any], target_role: str) -> Dict[str, Any]:
        """
        Perform gap analysis comparing parsed resume with target role requirements
        
        Args:
            parsed_resume: Structured resume data from parse_resume()
            target_role: Target role key (e.g., "frontend_engineer", "backend_engineer")
            
        Returns:
            Dict containing comprehensive gap analysis report
        """
        try:
            # Get target role requirements
            role_requirements = self._get_role_requirements(target_role)
            if not role_requirements:
                raise ValueError(f"Target role '{target_role}' not found in skill map")
            
            system_prompt = f"""
            You are an expert career analyst. Perform a comprehensive gap analysis comparing a candidate's resume 
            against target role requirements.
            
            Target Role: {target_role}
            Target Role Requirements: {json.dumps(role_requirements, indent=2)}
            
            Analyze the candidate's skills against the role requirements and provide:
            1. Overall fit score (0.0 to 1.0)
            2. Coverage metrics (required, met, partial, missing counts)
            3. Key strengths (skills that meet or exceed requirements)
            4. Top skill gaps (prioritized by role importance and gap size)
            5. Category-wise breakdown
            6. Learning roadmap with themes and sequencing
            
            Rating Guidelines:
            - Gap = target_level - resume_rating
            - Status: "met" (gap ≤ 0), "partial" (gap 1-2), "missing" (gap ≥ 3)
            - Priority mapping: "High" = target level 4-5, "Medium" = target level 3
            
            Return ONLY valid JSON in this exact format:
            {{
              "meta": {{
                "target_role": "{target_role}",
                "generated_at": "{datetime.utcnow().isoformat()}Z"
              }},
              "summary": {{
                "overall_fit_score": 0.0,
                "coverage": {{
                  "required_total": 0,
                  "met": 0,
                  "partial": 0,
                  "missing": 0
                }},
                "key_strengths": [
                  {{
                    "skill": "Skill Name",
                    "priority_from_role": "High/Medium",
                    "resume_rating": 1-5
                  }}
                ],
                "top_gaps": [
                  {{
                    "skill": "Skill Name",
                    "gap": 1-5,
                    "priority_from_role": "High/Medium"
                  }}
                ]
              }},
              "categories": [
                {{
                  "name": "category_name",
                  "coverage": {{
                    "required": 0,
                    "met": 0,
                    "partial": 0,
                    "missing": 0
                  }},
                  "skills": [
                    {{
                      "skill": "Skill Name",
                      "priority_from_role": "High/Medium",
                      "resume_rating": 0-5,
                      "target_level": 1-5,
                      "gap": 0-5,
                      "status": "met/partial/missing"
                    }}
                  ]
                }}
              ],
              "roadmap_seed": {{
                "duration_weeks": 12,
                "weekly_hours_target": 8,
                "themes": [
                  {{
                    "name": "Theme Name",
                    "skills": ["Skill1", "Skill2"],
                    "sequence": 1
                  }}
                ],
                "milestone_cadence": "biweekly"
              }}
            }}
            """
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Candidate Resume Data:\n{json.dumps(parsed_resume, indent=2)}")
            ]
            
            response = self.llm.invoke(messages)
            logger.info(f"Response: {response}")
            # Parse the JSON response
            try:
                gap_analysis = json.loads(response.content)
                logger.info("Successfully performed gap analysis")
                return gap_analysis
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing gap analysis response as JSON: {e}")
                logger.error(f"LLM Response: {response.content}")
                raise ValueError("Failed to perform gap analysis - invalid JSON response from LLM")
                
        except Exception as e:
            logger.error(f"Error in perform_gap_analysis: {e}")
            raise
    
    def _get_role_requirements(self, target_role: str) -> Optional[Dict[str, Any]]:
        """
        Get role requirements from skill map data
        
        Args:
            target_role: Target role key
            
        Returns:
            Dict containing role requirements or None if not found
        """
        # First check skill_map.json
        if target_role in self.skill_map:
            return self.skill_map[target_role]
        
        else:
            logger.error(f"Target role '{target_role}' not found in skill map")
        return None
    
    
    def run_analysis(self, resume_text: str, target_role: str) -> Dict[str, Any]:
        """
        Run complete analysis pipeline: parse resume and perform gap analysis
        
        Args:
            resume_text: Free text format of the resume
            target_role: Target role key
            
        Returns:
            Dict containing complete gap analysis report
        """
        try:
            logger.info("Starting gap analysis pipeline")
            
            # Step 1: Parse resume
            logger.info("Parsing resume...")
            parsed_resume = self.parse_resume(resume_text)
            
            # Step 2: Perform gap analysis
            logger.info("Performing gap analysis...")
            gap_analysis = self.perform_gap_analysis(parsed_resume, target_role)
            
            logger.info("Gap analysis completed successfully")
            return gap_analysis
            
        except Exception as e:
            logger.error(f"Error in run_analysis: {e}")
            raise


def main():
    """
    Main function for command line usage
    """
    try:
        # Initialize analyzer
        analyzer = GapAnalysisLLM()
        target_role = "frontend_engineer"
        resume_text = """
        Alex Rodriguez
Software Engineer

CONTACT:
Email: alex.rodriguez@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/alexrodriguez
GitHub: github.com/alexrodriguez

SUMMARY:
Passionate software engineer with 4+ years of experience in full-stack web development. 
Skilled in JavaScript, React, Node.js, and cloud technologies. Strong background in 
building scalable web applications and collaborating in agile development environments.

EXPERIENCE:

Senior Software Engineer | CloudTech Solutions | Jan 2022 - Present
• Lead development of customer-facing web applications using React, TypeScript, and Next.js
• Built RESTful APIs with Node.js and Express, serving 10,000+ daily active users
• Implemented CI/CD pipelines using Docker and AWS services (EC2, S3, RDS)
• Mentored 2 junior developers and conducted regular code reviews
• Collaborated with product managers and designers in agile sprints
• Optimized application performance, reducing load times by 35%

Software Engineer | StartupHub | Jun 2020 - Dec 2021
• Developed responsive web applications using React, HTML5, CSS3, and JavaScript
• Created backend services with Node.js and integrated with PostgreSQL databases
• Implemented user authentication and authorization using JWT tokens
• Built automated testing suites using Jest and Cypress
• Participated in daily standups and sprint planning sessions
• Used Git for version control and collaborated through GitHub

Junior Developer | WebCraft Agency | Aug 2019 - May 2020
• Built client websites using HTML, CSS, JavaScript, and WordPress
• Learned React fundamentals and modern JavaScript ES6+ features
• Assisted in debugging and maintaining existing web applications
• Gained experience with responsive design and cross-browser compatibility
• Used basic Git commands for version control

PROJECTS:

E-Commerce Platform (2023)
• Full-stack e-commerce application with user authentication, product catalog, and payment processing
• Technologies: React, TypeScript, Node.js, Express, MongoDB, Stripe API, AWS deployment
• Features: Shopping cart, order management, admin dashboard, email notifications
• Implemented search functionality and product filtering

Task Management SaaS (2022)
• Multi-tenant task management application with real-time collaboration
• Technologies: React, Socket.io, Node.js, PostgreSQL, Redis for caching
• Features: Project workspaces, team collaboration, file attachments, notifications
• Built REST API with comprehensive error handling and input validation

Weather Dashboard (2021)
• Weather tracking application with location-based forecasts and historical data
• Technologies: React, Chart.js, OpenWeather API, CSS Grid, responsive design
• Features: 7-day forecasts, interactive charts, favorite locations, dark mode

Personal Portfolio (2020)
• Professional portfolio website showcasing projects and skills
• Technologies: HTML5, CSS3, JavaScript, responsive design, deployed on Netlify
• Features: Project gallery, contact form, smooth animations, mobile-first design

CERTIFICATIONS:
• AWS Certified Solutions Architect Associate (2023)
• Meta React Developer Professional Certificate (2022)
• FreeCodeCamp Full Stack Web Development (2021)

EDUCATION:
Bachelor of Science in Computer Science
State University | Graduated May 2019
Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering

TECHNICAL SKILLS:

Programming Languages:
• JavaScript (ES6+), TypeScript, Python, HTML5, CSS3, SQL

Frontend Technologies:
• React, Next.js, Vue.js (basic), Redux, Context API, CSS Grid, Flexbox, Sass/SCSS

Backend Technologies:
• Node.js, Express.js, RESTful APIs, GraphQL (basic), JWT Authentication

Databases:
• PostgreSQL, MongoDB, Redis, MySQL (basic)

Cloud & DevOps:
• AWS (EC2, S3, RDS, Lambda), Docker, CI/CD, GitHub Actions, Netlify, Vercel

Tools & Others:
• Git, GitHub, VS Code, Postman, Jest, Cypress, Figma (basic), Agile/Scrum

ACHIEVEMENTS:
• Reduced application load times by 35% through performance optimization
• Successfully mentored 2 junior developers who were promoted within 6 months
• Led migration of legacy PHP application to modern React/Node.js stack
• Contributed to open-source projects with 500+ GitHub stars combined
        
        """
        
        # Run analysis
        result = analyzer.run_analysis(resume_text, target_role)
        logger.info(f"Result: {result}")

            
    except Exception as e:
        logger.error(f"Error in main: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())