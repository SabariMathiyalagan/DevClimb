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
class Task(BaseModel):
    """Individual task within a day"""
    id: str = Field(..., description="Unique task identifier in format W{week}D{day}-T{task}")
    skill: str = Field(..., description="Skill being practiced")
    activity_type: str = Field(..., description="Type of activity (practice, reading, project, etc.)")
    description: str = Field(..., description="Detailed task description")
    est_time_minutes: int = Field(..., ge=1, le=480, description="Estimated time in minutes")
    acceptance_criteria: List[str] = Field(..., min_items=1, description="List of completion criteria")


class DailyTask(BaseModel):
    """Daily tasks container"""
    day_index: int = Field(..., ge=1, le=7, description="Day of the week (1-7)")
    tasks: List[Task] = Field(..., min_items=1, description="List of tasks for the day")


class WeeklyAssessment(BaseModel):
    """Weekly assessment details"""
    type: str = Field(..., pattern="^(project|challenge|quiz)$", description="Assessment type")
    instructions: str = Field(..., description="Assessment instructions")
    est_time_hours: float = Field(..., ge=0.5, le=8.0, description="Estimated time in hours")


class Week(BaseModel):
    """Weekly roadmap structure"""
    week_index: int = Field(..., ge=1, le=12, description="Week number (1-12)")
    theme: str = Field(..., description="Weekly theme/focus area")
    skills_focus: List[str] = Field(..., min_items=1, description="Skills to focus on this week")
    time_budget_hours: int = Field(..., ge=1, le=20, description="Total hours allocated for the week")
    weekly_outcomes: List[str] = Field(..., min_items=1, description="Expected learning outcomes")
    weekly_assessment: WeeklyAssessment = Field(..., description="End-of-week assessment")
    daily_tasks: List[DailyTask] = Field(..., min_items=5, max_items=5, description="Daily task breakdown (weekdays only)")


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
        return """Generate a 12-week learning roadmap JSON. Be concise but comprehensive.

REQUIREMENTS:
- EXACTLY 12 weeks
- 5 daily task sets per week (weekdays only)
- 2-3 tasks per day maximum
- Task IDs: W{week}D{day}-T{task} (e.g., W1D1-T1)
- Focus on skills with "missing" or "partial" status
- Task time: 30-240 minutes each
- Assessment time: 0.5-8.0 hours each

ACTIVITY TYPES: reading, practice, project, challenge, video, research
ASSESSMENT TYPES: project, challenge, quiz

RESPONSE FORMAT - ONLY THIS JSON STRUCTURE:
{
  "meta": {
    "target_role": "role_name",
    "duration_weeks": 12,
    "weekly_hours_target": 8,
    "generated_at": "2025-01-01T00:00:00Z"
  },
  "roadmap": {
    "weeks": [
      {
        "week_index": 1,
        "theme": "Theme Name",
        "skills_focus": ["Skill1", "Skill2"],
        "time_budget_hours": 8,
        "weekly_outcomes": ["Outcome1", "Outcome2"],
        "weekly_assessment": {
          "type": "project",
          "instructions": "Build X using Y",
          "est_time_hours": 2.0
        },
        "daily_tasks": [
          {
            "day_index": 1,
            "tasks": [
              {
                "id": "W1D1-T1",
                "skill": "SkillName",
                "activity_type": "practice",
                "description": "Short task description",
                "est_time_minutes": 90,
                "acceptance_criteria": ["Complete X", "Pass Y"]
              }
            ]
          }
        ]
      }
    ]
  }
}

Generate ALL 12 weeks. Keep descriptions concise. Return ONLY valid JSON."""

    def _create_human_prompt(self, gap_analysis: Dict[str, Any]) -> str:
        """Create the human prompt with gap analysis data"""
        return f"""Based on this gap analysis, generate a comprehensive 12-week learning roadmap:

GAP ANALYSIS DATA:
{json.dumps(gap_analysis, indent=2)}

ROADMAP REQUIREMENTS:
- Target Role: {gap_analysis['meta']['target_role']}
- Duration: 12 weeks exactly
- Weekly Hours: {gap_analysis['roadmap_seed']['weekly_hours_target']} hours
- Follow the theme sequence from roadmap_seed.themes
- Address all skills in categories with appropriate difficulty based on status
- Include practical projects and assessments
- Ensure daily tasks are specific, measurable, and achievable

Generate the complete roadmap JSON now."""

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
            required_fields = ['meta', 'roadmap_seed', 'categories']
            for field in required_fields:
                if field not in gap_analysis:
                    raise ValueError(f"Missing required field in gap_analysis: {field}")
            
            logger.info(f"Generating roadmap for role: {gap_analysis['meta']['target_role']}")
            
            # Create messages
            system_message = SystemMessage(content=self.system_prompt)
            human_message = HumanMessage(content=self._create_human_prompt(gap_analysis))
            
            # Generate roadmap
            logger.info("Calling LLM to generate roadmap...")
            response = self.llm.invoke([system_message, human_message])
            
            # Parse response
            try:
                roadmap_data = json.loads(response.content)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM response as JSON: {e}")
                logger.error(f"Response length: {len(response.content)} characters")
                logger.error(f"Raw response start: {response.content[:500]}...")
                logger.error(f"Raw response end: ...{response.content[-200:]}")
                
                # Try to fix truncated JSON
                if "Unterminated string" in str(e) or response.content.count('"') % 2 != 0:
                    logger.info("Attempting to fix truncated JSON response...")
                    # Try to close unclosed strings and objects
                    fixed_content = self._attempt_json_fix(response.content)
                    if fixed_content:
                        try:
                            roadmap_data = json.loads(fixed_content)
                            logger.info("Successfully fixed truncated JSON!")
                        except json.JSONDecodeError:
                            raise Exception("LLM response was truncated and could not be fixed")
                    else:
                        raise Exception("LLM response was truncated and could not be fixed")
                else:
                    raise Exception("LLM response was not valid JSON")
            
            # Add generated timestamp if not present
            if 'meta' in roadmap_data and 'generated_at' not in roadmap_data['meta']:
                roadmap_data['meta']['generated_at'] = datetime.now(timezone.utc).isoformat()
            
            # Validate against Pydantic schema
            try:
                validated_roadmap = RoadmapResponse(**roadmap_data)
                result = validated_roadmap.dict()
                logger.info("Roadmap generated and validated successfully")
                return result
            except Exception as e:
                logger.error(f"Roadmap validation failed: {e}")
                logger.error(f"Generated data keys: {list(roadmap_data.keys())}")
                
                # Try to fix common issues
                roadmap_data = self._fix_common_issues(roadmap_data, gap_analysis)
                validated_roadmap = RoadmapResponse(**roadmap_data)
                result = validated_roadmap.dict()
                logger.info("Roadmap generated and validated successfully after fixes")
                return result
                
        except Exception as e:
            logger.error(f"Failed to generate roadmap: {str(e)}")
            raise
    
    def _fix_common_issues(self, roadmap_data: Dict[str, Any], gap_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Fix common issues in generated roadmap data"""
        logger.info("Attempting to fix roadmap data structure issues...")
        
        # If the LLM returned the wrong top-level structure, try to fix it
        if 'roadmap' in roadmap_data and 'meta' not in roadmap_data:
            # LLM put everything under 'roadmap' key, need to restructure
            inner_roadmap = roadmap_data['roadmap']
            
            # Extract meta information if it exists in the wrong place
            meta_info = {}
            if 'target_role' in inner_roadmap:
                meta_info['target_role'] = inner_roadmap.pop('target_role')
            else:
                meta_info['target_role'] = gap_analysis['meta']['target_role']
                
            if 'duration' in inner_roadmap:
                meta_info['duration_weeks'] = inner_roadmap.pop('duration')
            else:
                meta_info['duration_weeks'] = 12
                
            if 'weekly_hours' in inner_roadmap:
                meta_info['weekly_hours_target'] = inner_roadmap.pop('weekly_hours')
            else:
                meta_info['weekly_hours_target'] = gap_analysis['roadmap_seed']['weekly_hours_target']
            
            meta_info['generated_at'] = datetime.now(timezone.utc).isoformat()
            
            # Restructure the data
            roadmap_data = {
                'meta': meta_info,
                'roadmap': {
                    'weeks': inner_roadmap.get('weeks', [])
                }
            }
        
        # Ensure meta section exists and has required fields
        if 'meta' not in roadmap_data:
            roadmap_data['meta'] = {}
        
        meta = roadmap_data['meta']
        if 'target_role' not in meta:
            meta['target_role'] = gap_analysis['meta']['target_role']
        if 'duration_weeks' not in meta:
            meta['duration_weeks'] = 12
        if 'weekly_hours_target' not in meta:
            meta['weekly_hours_target'] = gap_analysis['roadmap_seed']['weekly_hours_target']
        if 'generated_at' not in meta:
            meta['generated_at'] = datetime.now(timezone.utc).isoformat()
        
        # Ensure roadmap section exists
        if 'roadmap' not in roadmap_data:
            roadmap_data['roadmap'] = {'weeks': []}
        
        # Ensure roadmap has weeks
        if 'weeks' not in roadmap_data['roadmap']:
            roadmap_data['roadmap']['weeks'] = []
        
        # Ensure we have exactly 12 weeks
        weeks = roadmap_data['roadmap']['weeks']
        if len(weeks) != 12:
            logger.warning(f"Expected 12 weeks, got {len(weeks)}. This may cause validation errors.")
        
        # Fix validation constraint violations
        for week in weeks:
            # Fix weekly assessment time constraints
            if 'weekly_assessment' in week and 'est_time_hours' in week['weekly_assessment']:
                hours = week['weekly_assessment']['est_time_hours']
                if hours > 8.0:
                    logger.warning(f"Week {week.get('week_index', '?')} assessment time {hours}h exceeded limit, capping at 8.0h")
                    week['weekly_assessment']['est_time_hours'] = 8.0
                elif hours < 0.5:
                    logger.warning(f"Week {week.get('week_index', '?')} assessment time {hours}h below minimum, setting to 0.5h")
                    week['weekly_assessment']['est_time_hours'] = 0.5
            
            # Fix daily task time constraints
            if 'daily_tasks' in week:
                for day in week['daily_tasks']:
                    if 'tasks' in day:
                        for task in day['tasks']:
                            if 'est_time_minutes' in task:
                                minutes = task['est_time_minutes']
                                if minutes > 480:  # 8 hours
                                    logger.warning(f"Task {task.get('id', '?')} time {minutes}min exceeded limit, capping at 480min")
                                    task['est_time_minutes'] = 480
                                elif minutes < 1:
                                    logger.warning(f"Task {task.get('id', '?')} time {minutes}min below minimum, setting to 1min")
                                    task['est_time_minutes'] = 1
        
        logger.info(f"Fixed roadmap structure - Meta keys: {list(meta.keys())}, Weeks: {len(weeks)}")
        return roadmap_data

    def _attempt_json_fix(self, content: str) -> Optional[str]:
        """Attempt to fix truncated JSON content"""
        try:
            # Count unclosed braces and brackets
            open_braces = content.count('{') - content.count('}')
            open_brackets = content.count('[') - content.count(']')
            
            # If content ends abruptly, try to close it
            fixed_content = content.strip()
            
            # Close unclosed strings if needed
            if fixed_content.count('"') % 2 != 0:
                fixed_content += '"'
            
            # Close unclosed arrays
            for _ in range(open_brackets):
                fixed_content += ']'
            
            # Close unclosed objects
            for _ in range(open_braces):
                fixed_content += '}'
            
            # Try to parse the fixed content
            json.loads(fixed_content)
            return fixed_content
            
        except Exception as e:
            logger.error(f"Could not fix JSON: {e}")
            return None

   

def main():
    """Example usage of RoadmapAgent"""
    try:
        # Initialize agent
        agent = RoadmapAgent()
        
        # Load sample gap analysis (you can replace this with actual file)
        gap_analysis_sample = {
        "meta": { "target_role": "frontend_engineer", "generated_at": "2025-09-06T14:00:00Z" },
        "summary": {
            "overall_fit_score": 0.62,
            "coverage": { "required_total": 9, "met": 3, "partial": 3, "missing": 3 },
            "key_strengths": [ { "skill": "HTML5", "priority_from_role": "High", "resume_rating": 4 } ],
            "top_gaps": [
            { "skill": "React", "gap": 3, "priority_from_role": "High" },
            { "skill": "SASS/SCSS", "gap": 2, "priority_from_role": "Medium" }
            ]
        },
        "categories": [
            {
            "name": "frontend_skills",
            "coverage": { "required": 6, "met": 2, "partial": 2, "missing": 2 },
            "skills": [
                { "skill": "JavaScript", "priority_from_role": "High", "resume_rating": 3, "target_level": 4, "gap": 1, "status": "partial" },
                { "skill": "React", "priority_from_role": "High", "resume_rating": 1, "target_level": 4, "gap": 3, "status": "partial" },
                { "skill": "HTML5", "priority_from_role": "High", "resume_rating": 4, "target_level": 4, "gap": 0, "status": "met" },
                { "skill": "CSS3", "priority_from_role": "High", "resume_rating": 3, "target_level": 4, "gap": 1, "status": "partial" },
                { "skill": "Vue.js", "priority_from_role": "Medium", "resume_rating": 0, "target_level": 3, "gap": 3, "status": "missing" },
                { "skill": "SASS/SCSS", "priority_from_role": "Medium", "resume_rating": 1, "target_level": 3, "gap": 2, "status": "partial" }
            ]
            },
            {
            "name": "devtools",
            "coverage": { "required": 3, "met": 1, "partial": 1, "missing": 1 },
            "skills": [
                { "skill": "Git", "priority_from_role": "High", "resume_rating": 4, "target_level": 4, "gap": 0, "status": "met" },
                { "skill": "Webpack", "priority_from_role": "Medium", "resume_rating": 2, "target_level": 3, "gap": 1, "status": "partial" },
                { "skill": "Babel", "priority_from_role": "Medium", "resume_rating": 0, "target_level": 3, "gap": 3, "status": "missing" }
            ]
            }
        ],
        "roadmap_seed": {
            "duration_weeks": 12,
            "weekly_hours_target": 8,
            "themes": [
            { "name": "JS + Tooling", "skills": ["JavaScript", "Webpack", "Babel"], "sequence": 1 },
            { "name": "React Foundations", "skills": ["React", "CSS3"], "sequence": 2 },
            { "name": "Styling & Alt Framework", "skills": ["SASS/SCSS", "Vue.js"], "sequence": 3 }
            ],
            "milestone_cadence": "biweekly"
        }
        }
        
        # Generate roadmap
        roadmap = agent.generate_roadmap(gap_analysis_sample)
        
       
        
        
        print("Roadmap:", roadmap)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        logger.error(f"Main execution failed: {str(e)}")


if __name__ == "__main__":
    main()
