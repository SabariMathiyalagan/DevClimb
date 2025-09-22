#!/usr/bin/env python3
"""
Roadmap Agent LLM Script

This module defines an LLM-powered agent called RoadmapAgent that generates
12-week learning roadmaps from gap analysis data using LangChain and OpenAI.

Author: DevClimb Team
Version: 1.0
"""

import json
import os
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
import logging
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
# Removed unused imports
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Pydantic Models for Roadmap Schema
class DailyTask(BaseModel):
    """Daily task structure"""
    day: int = Field(..., ge=1, le=7, description="Day of the week (1-7)")
    tasks: List[str] = Field(..., min_items=1, description="List of tasks for the day")


class Week(BaseModel):
    """Weekly roadmap structure with daily tasks"""
    week_index: int = Field(..., ge=1, le=12, description="Week number (1-12)")
    theme: str = Field(..., description="Weekly theme/focus area")
    skills_focus: List[str] = Field(..., min_items=1, description="Skills to focus on this week")
    weekly_task: str = Field(..., description="Weekly objective or main task")
    daily_tasks: List[DailyTask] = Field(..., min_items=5, max_items=7, description="Daily tasks for the week")


class RoadmapMeta(BaseModel):
    """Roadmap metadata"""
    target_role: str = Field(..., description="Target job role")
    duration_weeks: int = Field(12, description="Total roadmap duration in weeks")
    weekly_hours_target: int = Field(..., ge=1, le=20, description="Target hours per week")
    generated_at: str = Field(..., description="ISO timestamp of generation")


class Roadmap(BaseModel):
    """Complete roadmap structure"""
    weeks: List[Week] = Field(..., min_items=12, max_items=12, description="12-week roadmap")


class RoadmapResponse(BaseModel):
    """Complete roadmap response"""
    meta: RoadmapMeta = Field(..., description="Roadmap metadata")
    roadmap: Roadmap = Field(..., description="12-week roadmap structure")


class RoadmapAgent:
    """LLM-powered agent for generating learning roadmaps from gap analysis"""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        """
        Initialize the RoadmapAgent with OpenAI API key.
        
        Args:
            openai_api_key: OpenAI API key. If None, will try to get from environment.
        """
        api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key must be provided or set in OPENAI_API_KEY environment variable")
        
        self.llm = ChatOpenAI(
            model="gpt-4.1-mini",
            temperature=0.7,
            api_key=api_key,
            max_tokens=8000
        )
        
        self.system_prompt = self._create_system_prompt()
        logger.info("RoadmapAgent initialized successfully")
    
    def _create_system_prompt(self) -> str:
        """Create the system prompt for roadmap generation"""
        return """Generate a comprehensive 12-week learning roadmap JSON with daily actionable tasks.

REQUIREMENTS:
- EXACTLY 12 weeks
- Focus on skills with "missing" or "partial" status
- Each week should have a clear theme and weekly objective
- Skills should progress logically from basic to advanced
- Each week must include 5-7 daily tasks with specific actionable items
- Daily tasks should be practical, measurable, and build upon each other
 CRITICAL: Return ONLY pure JSON - NO markdown, NO code blocks, NO ```json wrapper, NO explanations.
RESPONSE FORMAT - ONLY THIS JSON STRUCTURE:
{
  "meta": {
    "target_role": "role_name",
    "duration_weeks": "12",
    "weekly_hours_target": "8",
    "generated_at": "2025-01-01T00:00:00Z"
  },
  "roadmap": {
    "weeks": [
      {
        "week_index": "1",
        "theme": "Theme Name",
        "skills_focus": ["Skill1", "Skill2"],
        "weekly_task": "Weekly Objective",
        "daily_tasks": [
          {
            "day": "1",
            "tasks": [
              "Specific actionable task 1",
              "Specific actionable task 2"
            ]
          },
          {
            "day": "2",
            "tasks": [
              "Specific actionable task 1",
              "Specific actionable task 2"
            ]
          }
        ]
      }
    ]
  }
}

Generate ALL 12 weeks with meaningful themes, objectives, and daily tasks. Each daily task should be specific and actionable. Return ONLY valid JSON."""

    def _create_human_prompt(self, gap_analysis: Dict[str, Any]) -> str:
        """Create the human prompt with gap analysis data"""
        return f"""Based on this gap analysis, generate a comprehensive 12-week learning roadmap with daily actionable tasks:

GAP ANALYSIS DATA:
{json.dumps(gap_analysis, indent=2)}

ROADMAP REQUIREMENTS:
- Target Role: {gap_analysis['meta']['target_role']}
- Duration: 12 weeks exactly
- Address all skills in categories with appropriate difficulty based on status
- Include practical projects and assessments
- Each week must have 5-7 daily tasks that are specific and actionable
- Daily tasks should build upon each other and lead to the weekly objective
- Tasks should include hands-on coding, reading, practice exercises, and small projects

Generate the complete roadmap JSON with daily tasks now."""

    def generate_roadmap(self, gap_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a 12-week learning roadmap from gap analysis data.
        
        Args:
            gap_analysis: Gap analysis JSON data as dictionary
            
        Returns:
            Dictionary containing the complete roadmap JSON
            
        Raises:
            ValueError: If gap_analysis is invalid or missing required fields
            Exception: If LLM generation fails
        """
        try:
            # Validate input has required fields
            required_fields = ['meta', 'categories']
            for field in required_fields:
                if field not in gap_analysis:
                    raise ValueError(f"Missing required field in gap_analysis: {field}")
            
            logger.info(f"Generating roadmap for role: {gap_analysis['meta']['target_role']}")
            
            # Create messages
            system_message = SystemMessage(content=self.system_prompt)
            human_message = HumanMessage(content=self._create_human_prompt(gap_analysis))
            
            # Generate roadmap
            logger.info("Calling LLM to generate roadmap...")
            logger.info(f"System message: {system_message}")
            logger.info(f"Human message: {human_message}")
            response = self.llm.invoke([system_message, human_message])
            
            # Parse response
            try:
                roadmap_data = json.loads(response.content)
                logger.info("Successfully generated and parsed roadmap")
                
                # Validate the structure
                roadmap_response = RoadmapResponse(**roadmap_data)
                logger.info("Roadmap validation successful")
                
                return roadmap_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM response as JSON: {e}")
                logger.error(f"Response length: {len(response.content)} characters")
                logger.error(f"Raw response start: {response.content[:500]}...")
                logger.error(f"Raw response end: ...{response.content[-200:]}")
                raise
                
            except Exception as e:
                logger.error(f"Roadmap validation failed: {e}")
                logger.error(f"Generated data keys: {list(roadmap_data.keys()) if 'roadmap_data' in locals() else 'N/A'}")
                raise
        
        except Exception as e:
            logger.error(f"Failed to generate roadmap: {str(e)}")
            raise
    
    

    

def main():
    """Example usage of RoadmapAgent"""
    try:
        # Initialize agent
        agent = RoadmapAgent()
        
        # Load sample gap analysis (you can replace this with actual file)
        gap_analysis_sample = {
  "meta": {
    "target_role": "full_stack_engineer",
    "generated_at": "2025-09-09T20:18:23.166437Z"
  },
  "summary": {
    "overall_fit_score": 4.33,
    "coverage": {
      "required_total": 17,
      "met": 13,
      "partial": 3,
      "missing": 1
    }
  },
  "categories": [
    {
      "name": "frontend_skills",
      "skills": [
        {
          "skill": "JavaScript",
          "priority_from_role": "High",
          "resume_rating": 4.0,
          "target_level": 4,
          "gap": 0.0,
          "status": "met"
        },
        {
          "skill": "React",
          "priority_from_role": "High",
          "resume_rating": 4.5,
          "target_level": 5,
          "gap": 0.5,
          "status": "met"
        },
        {
          "skill": "HTML5",
          "priority_from_role": "High",
          "resume_rating": 4.05,
          "target_level": 4,
          "gap": 0.0,
          "status": "met"
        },
        {
          "skill": "CSS3",
          "priority_from_role": "High",
          "resume_rating": 4.05,
          "target_level": 4,
          "gap": 0.0,
          "status": "met"
        },
        {
          "skill": "Vue.js",
          "priority_from_role": "Medium",
          "resume_rating": 0.0,
          "target_level": 3,
          "gap": 3.0,
          "status": "missing"
        },
        {
          "skill": "SASS/SCSS",
          "priority_from_role": "Medium",
          "resume_rating": 0.0,
          "target_level": 3,
          "gap": 3.0,
          "status": "missing"
        }
      ]
    },
    {
      "name": "backend_skills",
      "skills": [
        {
          "skill": "Node.js",
          "priority_from_role": "High",
          "resume_rating": 4.3,
          "target_level": 4,
          "gap": 0.0,
          "status": "met"
        },
        {
          "skill": "Express.js",
          "priority_from_role": "High",
          "resume_rating": 4.0,
          "target_level": 4,
          "gap": 0.0,
          "status": "met"
        },
        {
          "skill": "Ruby on Rails",
          "priority_from_role": "Medium",
          "resume_rating": 0.0,
          "target_level": 3,
          "gap": 3.0,
          "status": "missing"
        },
        {
          "skill": "Python",
          "priority_from_role": "Medium",
          "resume_rating": 0.0,
          "target_level": 3,
          "gap": 3.0,
          "status": "missing"
        }
      ]
    },
    {
      "name": "database_skills",
      "skills": [
        {
          "skill": "MongoDB",
          "priority_from_role": "High",
          "resume_rating": 3.5,
          "target_level": 4,
          "gap": 0.5,
          "status": "met"
        },
        {
          "skill": "PostgreSQL",
          "priority_from_role": "High",
          "resume_rating": 3.5,
          "target_level": 4,
          "gap": 0.5,
          "status": "met"
        },
        {
          "skill": "MySQL",
          "priority_from_role": "Medium",
          "resume_rating": 0.0,
          "target_level": 3,
          "gap": 3.0,
          "status": "missing"
        }
      ]
    },
    {
      "name": "devtools",
      "skills": [
        {
          "skill": "Git",
          "priority_from_role": "High",
          "resume_rating": 4.0,
          "target_level": 4,
          "gap": 0.0,
          "status": "met"
        },
        {
          "skill": "Webpack",
          "priority_from_role": "Medium",
          "resume_rating": 0.0,
          "target_level": 3,
          "gap": 3.0,
          "status": "missing"
        },
        {
          "skill": "Babel",
          "priority_from_role": "Medium",
          "resume_rating": 0.0,
          "target_level": 3,
          "gap": 3.0,
          "status": "missing"
        }
      ]
    }
  ]
}
        # Generate roadmap
        roadmap = agent.generate_roadmap(gap_analysis_sample)
        
      
        
        print("✅ Roadmap generated successfully!")
        print(f"📋 Target Role: {roadmap['meta']['target_role']}")
        print(f"📅 Duration: {roadmap['meta']['duration_weeks']} weeks")
        print(f"⏰ Weekly Hours: {roadmap['meta']['weekly_hours_target']} hours")
        print(f"📝 Roadmap saved to: learning_roadmap.json")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        logger.error(f"Main execution failed: {str(e)}")


if __name__ == "__main__":
    main()
