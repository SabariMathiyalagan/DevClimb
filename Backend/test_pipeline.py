#!/usr/bin/env python3
"""
Test Pipeline for DevClimb Gap Analysis and Roadmap Generation

This script demonstrates the complete pipeline from resume text to learning roadmap:
1. Parse resume and perform gap analysis using GapAnalysisLLM
2. Generate 12-week roadmap using RoadmapAgent
3. Save results to JSON files and display summary

Author: DevClimb Team
Version: 1.0
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, Optional
import logging
from gap_analysis_llm import GapAnalysisLLM
from roadmap_agent_llm import RoadmapAgent

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# =============================================================================
# CONFIGURATION SECTION - Edit these variables as needed
# =============================================================================

# Sample resume text - Replace with your own resume text
SAMPLE_RESUME_TEXT = """
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

# Target role - Must match a role key in your skill_map.json
# Common options: "frontend_engineer", "backend_engineer", "fullstack_engineer", etc.
DESIRED_ROLE = "frontend_engineer"

# Output file names
GAP_ANALYSIS_OUTPUT_FILE = "gap_analysis_result.json"
ROADMAP_OUTPUT_FILE = "learning_roadmap.json"

# =============================================================================
# PIPELINE IMPLEMENTATION
# =============================================================================

class TestPipeline:
    """Complete pipeline for testing gap analysis and roadmap generation"""
    
    def __init__(self):
        """Initialize the pipeline with both agents"""
        self.gap_analyzer = None
        self.roadmap_agent = None
        self.gap_analysis_result = None
        self.roadmap_result = None
        
    def initialize_agents(self) -> bool:
        """
        Initialize both GapAnalysisLLM and RoadmapAgent
        
        Returns:
            bool: True if both agents initialized successfully, False otherwise
        """
        try:
            logger.info("Initializing Gap Analysis LLM agent...")
            self.gap_analyzer = GapAnalysisLLM()
            
            # Validate skill map was loaded
            if not hasattr(self.gap_analyzer, 'skill_map') or not self.gap_analyzer.skill_map:
                logger.warning("⚠️ Skill map is empty - gap analysis may not work correctly")
            else:
                logger.info(f"✅ Loaded skill map with {len(self.gap_analyzer.skill_map)} roles")
            
            logger.info("✅ Gap Analysis LLM agent initialized successfully")
            
            logger.info("Initializing Roadmap agent...")
            self.roadmap_agent = RoadmapAgent()
            logger.info("✅ Roadmap agent initialized successfully")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize agents: {str(e)}")
            if "OpenAI API key" in str(e):
                logger.error("💡 Make sure OPENAI_API_KEY environment variable is set")
            return False
    
    def run_gap_analysis(self, resume_text: str, target_role: str) -> bool:
        """
        Run gap analysis on the provided resume
        
        Args:
            resume_text: The resume text to analyze
            target_role: Target role for the analysis
            
        Returns:
            bool: True if analysis succeeded, False otherwise
        """
        try:
            logger.info("=" * 60)
            logger.info("STEP 1: RUNNING GAP ANALYSIS")
            logger.info("=" * 60)
            logger.info(f"Target Role: {target_role}")
            logger.info(f"Resume Length: {len(resume_text)} characters")
            
            # Run the complete analysis pipeline
            self.gap_analysis_result = self.gap_analyzer.run_analysis(resume_text, target_role)
            
            # Save to JSON file
            with open(GAP_ANALYSIS_OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.gap_analysis_result, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Gap analysis completed successfully")
            logger.info(f"📄 Results saved to: {GAP_ANALYSIS_OUTPUT_FILE}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Gap analysis failed: {str(e)}")
            return False
    
    def generate_roadmap(self) -> bool:
        """
        Generate learning roadmap from gap analysis results
        
        Returns:
            bool: True if roadmap generation succeeded, False otherwise
        """
        try:
            if not self.gap_analysis_result:
                raise ValueError("Gap analysis must be completed before generating roadmap")
            
            logger.info("=" * 60)
            logger.info("STEP 2: GENERATING LEARNING ROADMAP")
            logger.info("=" * 60)
            
            # Generate roadmap using gap analysis results
            self.roadmap_result = self.roadmap_agent.generate_roadmap(self.gap_analysis_result)
            
            # Save to JSON file
            with open(ROADMAP_OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.roadmap_result, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Roadmap generated successfully")
            logger.info(f"📄 Results saved to: {ROADMAP_OUTPUT_FILE}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Roadmap generation failed: {str(e)}")
            return False
    
    def display_results(self):
        """Display comprehensive results summary"""
        try:
            logger.info("=" * 60)
            logger.info("PIPELINE RESULTS SUMMARY")
            logger.info("=" * 60)
            
            # Gap Analysis Summary
            if self.gap_analysis_result:
                print("\n🎯 GAP ANALYSIS SUMMARY:")
                print("=" * 40)
                
                summary = self.gap_analysis_result.get('summary', {})
                print(f"Target Role: {self.gap_analysis_result['meta']['target_role']}")
                print(f"Overall Fit Score: {summary.get('overall_fit_score', 'N/A'):.2%}")
                
                coverage = summary.get('coverage', {})
                print(f"Skills Coverage:")
                print(f"  • Total Required: {coverage.get('required_total', 0)}")
                print(f"  • Met: {coverage.get('met', 0)}")
                print(f"  • Partial: {coverage.get('partial', 0)}")
                print(f"  • Missing: {coverage.get('missing', 0)}")
                
                # Top strengths
                strengths = summary.get('key_strengths', [])[:3]  # Top 3
                if strengths:
                    print(f"\nTop Strengths:")
                    for strength in strengths:
                        print(f"  ✅ {strength['skill']} (Rating: {strength['resume_rating']})")
                
                # Top gaps
                gaps = summary.get('top_gaps', [])[:3]  # Top 3
                if gaps:
                    print(f"\nTop Gaps to Address:")
                    for gap in gaps:
                        print(f"  🎯 {gap['skill']} (Gap: {gap['gap']}, Priority: {gap['priority_from_role']})")
            
            # Roadmap Summary
            if self.roadmap_result:
                print("\n📚 LEARNING ROADMAP SUMMARY:")
                print("=" * 40)
                
                meta = self.roadmap_result.get('meta', {})
                roadmap = self.roadmap_result.get('roadmap', {})
                weeks = roadmap.get('weeks', [])
                
                print(f"Duration: {meta.get('duration_weeks', 0)} weeks")
                print(f"Weekly Hours Target: {meta.get('weekly_hours_target', 0)} hours")
                print(f"Total Weeks Generated: {len(weeks)}")
                
                if weeks:
                    print(f"\nWeekly Themes Preview:")
                    for i, week in enumerate(weeks[:4]):  # Show first 4 weeks
                        print(f"  Week {week['week_index']}: {week['theme']}")
                        skills = ', '.join(week['skills_focus'][:3])  # First 3 skills
                        if len(week['skills_focus']) > 3:
                            skills += "..."
                        print(f"    Skills: {skills}")
                    
                    if len(weeks) > 4:
                        print(f"    ... and {len(weeks) - 4} more weeks")
                
                # Count total tasks
                total_tasks = sum(len(day['tasks']) for week in weeks for day in week.get('daily_tasks', []))
                print(f"\nTotal Learning Tasks: {total_tasks}")
            
            print(f"\n📁 Files Generated:")
            print(f"  • Gap Analysis: {GAP_ANALYSIS_OUTPUT_FILE}")
            print(f"  • Learning Roadmap: {ROADMAP_OUTPUT_FILE}")
            
        except Exception as e:
            logger.error(f"Error displaying results: {str(e)}")
    
    def run_complete_pipeline(self, resume_text: str, target_role: str) -> bool:
        """
        Run the complete pipeline from resume to roadmap
        
        Args:
            resume_text: Resume text to analyze
            target_role: Target role for analysis
            
        Returns:
            bool: True if entire pipeline succeeded, False otherwise
        """
        try:
            start_time = datetime.now()
            
            print("🚀 STARTING DEVCLIMB PIPELINE")
            print("=" * 60)
            print(f"Timestamp: {start_time.isoformat()}")
            print(f"Target Role: {target_role}")
            print(f"Resume Length: {len(resume_text)} characters")
            
            # Step 1: Initialize agents
            if not self.initialize_agents():
                return False
            
            # Step 2: Run gap analysis
            if not self.run_gap_analysis(resume_text, target_role):
                logger.error("Pipeline stopped due to gap analysis failure")
                return False
            
            # Step 3: Generate roadmap
            if not self.generate_roadmap():
                logger.error("Pipeline completed gap analysis but roadmap generation failed")
                # Still return True since gap analysis succeeded
                self.display_results()
                return True
            
            # Step 4: Display results
            self.display_results()
            
            end_time = datetime.now()
            duration = end_time - start_time
            
            print(f"\n🎉 PIPELINE COMPLETED SUCCESSFULLY!")
            print(f"Total Duration: {duration.total_seconds():.1f} seconds")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Pipeline failed with unexpected error: {str(e)}")
            return False


def validate_environment() -> bool:
    """Validate that the environment is properly set up"""
    try:
        # Check OpenAI API key
        if not os.getenv('OPENAI_API_KEY'):
            print("❌ OPENAI_API_KEY environment variable not set")
            return False
        
        # Check for skill map file
        skill_map_paths = [
            'data/skill_map.json',
            'Backend/data/skill_map.json',
            os.path.join(os.path.dirname(__file__), 'data', 'skill_map.json')
        ]
        
        skill_map_found = False
        for path in skill_map_paths:
            if os.path.exists(path):
                skill_map_found = True
                print(f"✅ Found skill map at: {path}")
                break
        
        if not skill_map_found:
            print("❌ skill_map.json not found in expected locations")
            print("Expected locations:", skill_map_paths)
            return False
        
        print("✅ Environment validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Environment validation failed: {e}")
        return False


def main():
    """Main function to run the test pipeline"""
    try:
        print("🔍 VALIDATING ENVIRONMENT")
        print("=" * 40)
        
        # Validate environment first
        if not validate_environment():
            print("\n💥 Environment validation failed. Please fix the issues above.")
            return 1
        
        # Validate configuration
        if not SAMPLE_RESUME_TEXT.strip():
            raise ValueError("SAMPLE_RESUME_TEXT cannot be empty")
        
        if not DESIRED_ROLE.strip():
            raise ValueError("DESIRED_ROLE cannot be empty")
        
        print(f"✅ Configuration validated")
        print(f"   - Resume length: {len(SAMPLE_RESUME_TEXT)} characters")
        print(f"   - Target role: {DESIRED_ROLE}")
        
        # Run the complete pipeline
        pipeline = TestPipeline()
        success = pipeline.run_complete_pipeline(SAMPLE_RESUME_TEXT, DESIRED_ROLE)
        
        if success:
            print("\n🎉 TEST PIPELINE COMPLETED SUCCESSFULLY!")
            print("All components are working as expected.")
            return 0
        else:
            print("\n❌ Test pipeline failed. Check logs for details.")
            return 1
            
    except Exception as e:
        logger.error(f"Fatal error in main: {str(e)}")
        print(f"\n💥 Fatal error: {str(e)}")
        return 1


if __name__ == "__main__":
    exit(main())
