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
            You are an expert resume parser specializing in technical skill assessment. Parse the given resume text and extract information into a structured JSON format.
            
            ## SKILL RATING METHODOLOGY ##
            
            Rate skills based on evidence from experience, projects, and context:
            
            **Rating Scale (1.0-5.0, decimals allowed):**
            - 5.0: Expert/Architect level - Leading teams, making architectural decisions, deep specialization
            - 4.0-4.9: Advanced level - Complex implementations, mentoring others, significant experience (3+ years)
            - 3.0-3.9: Intermediate level - Solid working knowledge, independent work, some experience (1-3 years)
            - 2.0-2.9: Basic level - Guided work, learning phase, limited experience (<1 year)
            - 1.0-1.9: Beginner level - Minimal exposure, just started learning
            
            **Rating Evidence Indicators:**
            - Years of experience with the technology
            - Complexity of projects using the skill
            - Leadership/mentoring roles involving the skill
            - Certifications or formal training
            - Specific achievements or optimizations
            - Context words: "lead", "architect", "optimize", "mentor", "expert", "advanced"
            
            **Examples:**
            - "Lead React developer for 3 years" → React: 4.5
            - "Built complex React applications with hooks and context" → React: 4.0
            - "Developed responsive websites using React" → React: 3.5
            - "Learning React fundamentals" → React: 2.0
            - "Basic React experience" → React: 2.5
            
            Extract the following information:
            1. Work Experience: company name, role/title, and skills used with precise ratings
            2. Projects: project name, description, and skills used with evidence-based ratings
            3. Certifications: certification names
            4. Overall Skills: consolidated list with weighted average ratings based on recency and depth
            
            Return ONLY valid JSON in this exact format:"
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
            You are an expert career analyst with deep understanding of skill dependencies in software development. 
            Perform a comprehensive gap analysis comparing a candidate's resume against target role requirements.
            
            ## CRITICAL SKILL DEPENDENCY ANALYSIS ##
            
            The role requirements include "depends_on" arrays showing skill dependencies. Use this intelligence:
            
            **Dependency Inference Rules:**
            1. If a candidate is proficient in a higher-level skill, they likely possess competency in its dependencies
            2. Infer dependency skill levels as 90% of the dependent skill's level
            3. Never downgrade explicitly mentioned skills - always use the higher of explicit vs inferred ratings
            4. Apply transitive dependencies (if A depends on B, and B depends on C, then A implies C knowledge)
            
            **Examples:**
            - React (rating 4.5) depends on ["JavaScript", "HTML5", "CSS3"]
            - Infer: JavaScript ≈ 4.0, HTML5 ≈ 4.0, CSS3 ≈ 4.0 (unless explicitly higher)
            - Vue.js (rating 3.0) + React (rating 4.5) both depend on JavaScript
            - Infer: JavaScript ≈ 4.0 (take higher inference)
            
            ## TARGET ROLE ANALYSIS ##
            
            Target Role: {target_role}
            Role Requirements with Dependencies: {json.dumps(role_requirements, indent=2)}
            
            ## ANALYSIS REQUIREMENTS ##
            
            1. **Smart Skill Assessment**: Apply dependency inference before calculating gaps
            2. **Realistic Gap Calculation**: Gap = target_level - (max(explicit_rating, inferred_rating))
            3. **Intelligent Status Mapping**: 
               - "met": gap <= 1.0 (candidate meets or nearly meets requirement)
               - "partial": gap >= 1.1 and <= 3.9 (significant learning needed but foundation exists)
               - "missing": gap >= 4.0 (substantial skill development required)
            4. **Priority-Based Target Levels**: 
               - "High" priority skills: target level 4-5
               - "Medium" priority skills: target level 3
            5. **Accurate Fit Score**: Weight by priority and consider dependency relationships
            
            ## OUTPUT REQUIREMENTS ##
            
            CRITICAL: Return ONLY pure JSON - NO markdown, NO code blocks, NO ```json wrapper, NO explanations.
            Return ONLY valid JSON in this exact format:
            {{
              "meta": {{
                "target_role": "{target_role}",
                "generated_at": "{datetime.utcnow().isoformat()}Z"
              }},
              "summary": {{
                "overall_fit_score": "0.0",
                "coverage": {{
                  "required_total": "0",
                  "met": "0",
                  "partial": "0",
                  "missing": "0"
                }}
              }},
              "categories": [
                {{
                  "name": "category_name",
                  "skills": [
                    {{
                      "skill": "Skill Name",
                      "priority_from_role": "High/Medium",
                      "resume_rating": "0.0",
                      "target_level": "1-5",
                      "gap": "0.0",
                      "status": "met/partial/missing"
                    }}
                  ]
                }}
              ]
            }}
            
            **CRITICAL FORMATTING REQUIREMENTS**:
            - Return ONLY the JSON object above
            - NO markdown formatting (```json)
            - NO code blocks
            - NO explanations or additional text
            - Start response with {{ and end with }}
            
            **IMPORTANT**: Use dependency inference to provide realistic, intelligent gap analysis that avoids recommending basic skills when advanced skills are already mastered.
            """
            
            # Create detailed human prompt with analysis guidance
            human_prompt = f"""
            ## CANDIDATE RESUME DATA ##
            {json.dumps(parsed_resume, indent=2)}
            
            ## ANALYSIS INSTRUCTIONS ##
            
            Please perform the gap analysis following these steps:
            
            1. **Extract Explicit Skills**: Identify all skills explicitly mentioned in the resume with their ratings
            
            2. **Apply Dependency Inference**: 
               - For each high-level skill the candidate possesses, infer competency in its dependencies
               - Use 80-90% of the parent skill's rating for dependencies
               - Take the maximum of explicit and inferred ratings for each skill
            
            3. **Calculate Intelligent Gaps**:
               - Compare inferred skill levels against role requirements
               - Factor in skill priorities from the role requirements
               - Use realistic gap thresholds for status determination
            
            4. **Generate Comprehensive Analysis**:
               - Provide accurate fit score considering dependency relationships
               - Count coverage metrics based on intelligent skill assessment
               - Ensure no redundant learning recommendations for dependency skills
            
            Focus on creating a realistic assessment that recognizes skill transfer and dependencies.
            
            RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT OR FORMATTING.
            """
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=human_prompt)
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
        target_role = "full_stack_engineer"
        
        # Load sample resume from file if available, otherwise use embedded sample
        try:
            with open('sample_resume.txt', 'r', encoding='utf-8') as f:
                resume_text = f.read()
        except FileNotFoundError:
            resume_text = """
            Education
Carleton University Ottawa, ON
Bachelor of Engineering in Software Engineering (CO-OP) 2023 - 2028 (Expected)
• Courses: Algorithms and Data Structures, Object Oriented Software Development, Computation and Programming,
Data Management, Foundation of Imperative Programming, Computer Organization and Architecture
• GPA: 3.9/4.0
• Admission Scholarship of $4,000/Year
Certifications
AWS Solutions Architect Associate Amazon Web Services, 2025
Experience
Fullstack Developer Inten May 2025 – August 2025
JAZZ Solar Solutions Inc Ottawa, ON
• Built a cross-platform mobile application with 10+ production-ready screens using React Native, improving user
experience and enabling scalable feature expansion
• Transformed the legacy backend into a fully AWS serverless architecture (Lambda, SNS, API Gateway,
DynamoDB), resulting in a 95% reduction in cloud infrastructure costs and near-zero downtime.
• Developed an AI-powered LangChain chatbot with Retrieval-Augmented Generation (RAG) and function calling
to live APIs, enabling real-time responses and improving query accuracy by 40% in testing
Fullstack Developer Intern May 2024 – August 2024
Gnowit Inc Ottawa, ON
• Built and managed the CRM’s entire frontend architecture, developing 50+ React components to improve user
accessibility with intuitive data presentation and navigation
• Improved backend features for adding and managing artifacts (e.g., organizations, contacts, tasks, etc.) in a
MongoDB database using Node.js, allowing real-time updates and effective data handling
• Implemented Google Calendar, Outlook Calendar, Gmail, and Outlook integration through Azure and Google
Cloud for API connection and IMAP to streamline communication and improve scheduling functionality
OBOTZ Robotics Instructor June 2022 – Present
Obotz Robotics and Coding Ottawa, ON
• Educated children aged 9-15 on robotics concepts and applications using microcontrollers and Embedded C
programming to foster hands-on learning and build functional robotic systems
• Effectively managed classrooms of 8+ students, ensuring an engaging and productive learning environment
Projects
Resume Assistant AI Source Code | React, Flask, SQLite3, Transformers, Git November 2024 - January 2025
• Fine-tuned a LLaMA 3.2 LLM using supervised learning through the Hugging Face Transformers library on
a resume and job description dataset, achieving a 93% accuracy in classifying resumes
• Deployed the trained model on AWS using Hugging Face Inference Endpoints, ensuring scalable and efficient
hosting, achieved a response time of under 1 second for real-time resume classification
• Enhanced a Gen AI model (Microsoft Phi 3.5 Instruct) through prompt engineering, via Hugging Face’s
serverless inference API, to deliver detailed and tailored resume feedback
• Implemented REST API practices to allow users to add and delete resumes linked to their accounts
Evently App | Co- Founder, React Native, Node.js, PostgreSQL April 2024 - Present
• Developed the frontend with 5+ interactive screens in React Native, delivering a responsive and seamless interface
• Implemented React Context to manage global state and created a custom schedule provider with an
interactive event calendar component to allow users to dynamically store, view, and manage multiple schedules
• Integrated Google Maps API to provide users with real-time location tracking and route calculations
Technical Skills
Languages: Python, Javascript, C/C++, Java, Embedded C, Kotlin
Frameworks/Libraries: React, React Native, Node.js, Flask, Transformers, NumPy, Pandas, MongoDB, SQL
Developer Tools: GitHub/Git, Android Studio, Firebase, PostgreSQL, Azure, Google Cloud

            """
        
        # Run analysis
        result = analyzer.run_analysis(resume_text, target_role)
        
        # Save result to file
        with open('gap_analysis_result.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print("✅ Gap analysis completed successfully!")
        print(f"📊 Target Role: {result['meta']['target_role']}")
        print(f"📈 Overall Fit Score: {result['summary']['overall_fit_score']:.2f}")
        print(f"📝 Results saved to: gap_analysis_result.json")
        
        # Print summary
        coverage = result['summary']['coverage']
        print(f"\n📋 Coverage Summary:")
        print(f"   Total Required: {coverage['required_total']}")
        print(f"   ✅ Met: {coverage['met']}")
        print(f"   🟡 Partial: {coverage['partial']}")
        print(f"   ❌ Missing: {coverage['missing']}")

            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        logger.error(f"Error in main: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())