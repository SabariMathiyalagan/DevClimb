"""
pipeline.py
------------
Product Requirements Document (PRD) + scaffolding for the Career Roadmap AI Pipeline.

Goal:
-----
Given a user resume + desired role, generate a personalized 12-week career roadmap
with weekly themes, daily tasks, measurable deliverables, and coaching tips.
The pipeline should balance deterministic rules (role taxonomy, resource bank)
with personalization powered by LLM agents.

Core Components:
----------------
1. Resume Ingest → UserProfile
2. RoleGraph (curated JSON per role)
3. Planner Agent (Gap Analysis + Plan Generation)
4. Critic Agent (Evaluation + Feedback)
5. Constraint Oracle (Hard Guardrails)
6. Finalizer (Tone, Tips, Personalization)
"""

import json
import re
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, validator
import openai
import time
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =====================================================
# Data Models (schemas are contracts between agents)
# =====================================================

class UserProfile(BaseModel):
    user_id: str
    years_total: float
    skills: Dict[str, int] = Field(description="Skill name to proficiency level (1-5)")
    projects: List[str] = []
    certifications: List[str] = []
    repos: List[str] = []
    time_budget_hours_per_week: int = Field(ge=5, le=40, description="Weekly time budget in hours")
    learning_style: Optional[str] = Field(default="mixed", regex="^(project|reading|video|mixed)$")

    @validator('skills')
    def validate_skills(cls, v):
        for skill, level in v.items():
            if not 1 <= level <= 5:
                raise ValueError(f"Skill level for {skill} must be between 1-5")
        return v


class Gap(BaseModel):
    skill: str
    have: int = Field(ge=0, le=5)
    need: int = Field(ge=1, le=5)
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: List[str] = []
    effort_hours: int = Field(ge=1, le=100)
    prereqs: List[str] = []

    @validator('need')
    def need_greater_than_have(cls, v, values):
        if 'have' in values and v <= values['have']:
            raise ValueError("Need level must be greater than have level")
        return v


class DailyTask(BaseModel):
    title: str = Field(min_length=5, max_length=100)
    minutes: int = Field(ge=15, le=240, description="Task duration in minutes")
    verify: str = Field(min_length=10, description="How to verify task completion")
    resources: List[str] = Field(min_items=1, description="Resource IDs from resource bank")


class WeeklyPlan(BaseModel):
    week: int = Field(ge=1, le=12)
    theme: str = Field(min_length=5, max_length=50)
    goals: List[str] = Field(min_items=1, max_items=3)
    deliverable: str = Field(min_length=10, max_length=200)
    daily: List[DailyTask] = Field(min_items=5, max_items=7, description="5-7 daily tasks per week")


class LearningPlan(BaseModel):
    role: str
    weeks: List[WeeklyPlan] = Field(min_items=12, max_items=12)
    coaching_tips: List[str] = Field(min_items=3, max_items=10)
    checkpoints: Dict[int, str] = Field(description="Week number to milestone description")

    @validator('checkpoints')
    def validate_checkpoints(cls, v):
        required_checkpoints = {4, 8, 12}
        if not required_checkpoints.issubset(set(v.keys())):
            raise ValueError("Must have checkpoints at weeks 4, 8, and 12")
        return v


# =====================================================
# LLM Client with Schema Enforcement
# =====================================================

class LLMClient:
    """
    OpenAI client with JSON schema enforcement and retries.
    """
    
    def __init__(self, api_key: str, model: str = "gpt-4-1106-preview", max_retries: int = 3):
        openai.api_key = api_key
        self.model = model
        self.max_retries = max_retries
    
    def call_with_schema(self, prompt: str, schema_class: BaseModel, **kwargs) -> BaseModel:
        """
        Call LLM with JSON schema enforcement and automatic retries.
        """
        schema_json = schema_class.schema()
        
        system_prompt = f"""
        You are a precise AI assistant that responds ONLY with valid JSON.
        Your response must conform exactly to this JSON schema:
        {json.dumps(schema_json, indent=2)}
        
        Do not include any text outside the JSON response.
        Ensure all required fields are present and valid.
        """
        
        for attempt in range(self.max_retries):
            try:
                response = openai.ChatCompletion.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=kwargs.get('temperature', 0.7),
                    max_tokens=kwargs.get('max_tokens', 4000)
                )
                
                content = response.choices[0].message.content.strip()
                
                # Try to parse JSON
                try:
                    json_data = json.loads(content)
                    return schema_class(**json_data)
                except json.JSONDecodeError as e:
                    logger.warning(f"JSON decode error on attempt {attempt + 1}: {e}")
                    if attempt == self.max_retries - 1:
                        raise
                    continue
                except Exception as e:
                    logger.warning(f"Schema validation error on attempt {attempt + 1}: {e}")
                    if attempt == self.max_retries - 1:
                        raise
                    continue
                    
            except Exception as e:
                logger.error(f"LLM call failed on attempt {attempt + 1}: {e}")
                if attempt == self.max_retries - 1:
                    raise
                time.sleep(2 ** attempt)  # Exponential backoff
        
        raise Exception("All LLM attempts failed")


# =====================================================
# Role Graph Repository
# =====================================================

class RoleGraphRepository:
    """
    Curated role definitions with skills, prerequisites, and assessments.
    """
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.roles = self._load_roles()
    
    def _load_roles(self) -> Dict[str, Dict]:
        """Load role definitions from JSON files."""
        roles = {}
        roles_file = self.data_dir / "roles.json"
        
        if roles_file.exists():
            with open(roles_file, 'r') as f:
                roles = json.load(f)
        else:
            # Default role definitions
            roles = {
                "Frontend Developer": {
                    "skills": {
                        "HTML": 4,
                        "CSS": 4,
                        "JavaScript": 5,
                        "React": 4,
                        "TypeScript": 3,
                        "Git": 3,
                        "Responsive Design": 4,
                        "Testing": 3,
                        "Performance Optimization": 3,
                        "Build Tools": 3
                    },
                    "prerequisites": ["HTML", "CSS", "JavaScript"],
                    "assessments": ["Portfolio Website", "React App", "API Integration"],
                    "career_paths": ["Senior Frontend", "Full Stack", "UI/UX Engineer"]
                },
                "Backend Developer": {
                    "skills": {
                        "Python": 4,
                        "SQL": 4,
                        "REST APIs": 5,
                        "Database Design": 4,
                        "Authentication": 4,
                        "Testing": 4,
                        "Docker": 3,
                        "Cloud Platforms": 3,
                        "System Design": 3,
                        "Security": 3
                    },
                    "prerequisites": ["Programming Fundamentals", "SQL"],
                    "assessments": ["REST API", "Database Schema", "Deployed Application"],
                    "career_paths": ["Senior Backend", "Full Stack", "DevOps Engineer"]
                },
                "Full Stack Developer": {
                    "skills": {
                        "JavaScript": 4,
                        "React": 4,
                        "Node.js": 4,
                        "SQL": 4,
                        "REST APIs": 4,
                        "Git": 3,
                        "Testing": 3,
                        "Docker": 3,
                        "Cloud Platforms": 3,
                        "System Design": 3
                    },
                    "prerequisites": ["HTML", "CSS", "JavaScript"],
                    "assessments": ["Full Stack App", "API Design", "Database Integration"],
                    "career_paths": ["Senior Full Stack", "Tech Lead", "Solution Architect"]
                }
            }
            
            # Save default roles
            self.data_dir.mkdir(exist_ok=True)
            with open(roles_file, 'w') as f:
                json.dump(roles, f, indent=2)
        
        return roles
    
    def get_role(self, role_name: str) -> Optional[Dict]:
        """Get role definition by name."""
        return self.roles.get(role_name)
    
    def list_roles(self) -> List[str]:
        """List all available roles."""
        return list(self.roles.keys())


# =====================================================
# Resource Bank
# =====================================================

class ResourceBank:
    """
    Curated learning resources with IDs, preventing hallucinations.
    """
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.resources = self._load_resources()
    
    def _load_resources(self) -> Dict[str, Dict]:
        """Load resources from JSON file."""
        resources_file = self.data_dir / "resources.json"
        
        if resources_file.exists():
            with open(resources_file, 'r') as f:
                return json.load(f)
        else:
            # Default resources
            resources = {
                "html_mdn": {
                    "title": "MDN HTML Documentation",
                    "url": "https://developer.mozilla.org/en-US/docs/Web/HTML",
                    "type": "documentation",
                    "skills": ["HTML"],
                    "difficulty": 1,
                    "estimated_hours": 10
                },
                "css_grid_guide": {
                    "title": "CSS Grid Complete Guide",
                    "url": "https://css-tricks.com/snippets/css/complete-guide-grid/",
                    "type": "tutorial",
                    "skills": ["CSS", "Responsive Design"],
                    "difficulty": 2,
                    "estimated_hours": 4
                },
                "react_docs": {
                    "title": "React Official Documentation",
                    "url": "https://react.dev/",
                    "type": "documentation",
                    "skills": ["React", "JavaScript"],
                    "difficulty": 3,
                    "estimated_hours": 20
                },
                "typescript_handbook": {
                    "title": "TypeScript Handbook",
                    "url": "https://www.typescriptlang.org/docs/",
                    "type": "documentation",
                    "skills": ["TypeScript", "JavaScript"],
                    "difficulty": 3,
                    "estimated_hours": 15
                },
                "python_official_tutorial": {
                    "title": "Python Official Tutorial",
                    "url": "https://docs.python.org/3/tutorial/",
                    "type": "tutorial",
                    "skills": ["Python"],
                    "difficulty": 2,
                    "estimated_hours": 20
                },
                "sql_w3schools": {
                    "title": "SQL Tutorial - W3Schools",
                    "url": "https://www.w3schools.com/sql/",
                    "type": "tutorial",
                    "skills": ["SQL"],
                    "difficulty": 2,
                    "estimated_hours": 12
                },
                "rest_api_design": {
                    "title": "REST API Design Best Practices",
                    "url": "https://restfulapi.net/",
                    "type": "guide",
                    "skills": ["REST APIs", "Backend Development"],
                    "difficulty": 3,
                    "estimated_hours": 8
                },
                "git_pro_book": {
                    "title": "Pro Git Book",
                    "url": "https://git-scm.com/book",
                    "type": "book",
                    "skills": ["Git"],
                    "difficulty": 2,
                    "estimated_hours": 15
                },
                "docker_get_started": {
                    "title": "Docker Get Started Guide",
                    "url": "https://docs.docker.com/get-started/",
                    "type": "tutorial",
                    "skills": ["Docker"],
                    "difficulty": 3,
                    "estimated_hours": 10
                },
                "testing_js_guide": {
                    "title": "JavaScript Testing Best Practices",
                    "url": "https://github.com/goldbergyoni/javascript-testing-best-practices",
                    "type": "guide",
                    "skills": ["Testing", "JavaScript"],
                    "difficulty": 3,
                    "estimated_hours": 12
                }
            }
            
            # Save default resources
            self.data_dir.mkdir(exist_ok=True)
            with open(resources_file, 'w') as f:
                json.dump(resources, f, indent=2)
            
            return resources
    
    def search(self, skill: str, difficulty: Optional[int] = None) -> List[str]:
        """Search for resources by skill and optional difficulty."""
        matching_resources = []
        
        for resource_id, resource in self.resources.items():
            if skill.lower() in [s.lower() for s in resource.get("skills", [])]:
                if difficulty is None or resource.get("difficulty") == difficulty:
                    matching_resources.append(resource_id)
        
        return matching_resources
    
    def get_resource(self, resource_id: str) -> Optional[Dict]:
        """Get resource by ID."""
        return self.resources.get(resource_id)


# =====================================================
# Pipeline Implementation
# =====================================================

class Pipeline:
    """
    The orchestrator that wires together Profile extraction, Planner agent,
    Critic agent, Constraint oracle, and Finalizer.
    """

    def __init__(self, llm_client: LLMClient, role_graph_repo: RoleGraphRepository, resource_bank: ResourceBank):
        self.llm = llm_client
        self.roles = role_graph_repo
        self.resources = resource_bank

    # -------- Step 1: Resume Ingest --------
    def build_profile(self, resume_text: str, user_id: str = "user_001") -> UserProfile:
        """
        Use a lightweight LLM prompt to normalize resume text into a UserProfile.
        Deterministic enrichment:
          - Parse years of exp
          - Extract projects/certs/repos if explicit
        """
        prompt = f"""
        Analyze this resume and extract a structured user profile.
        
        Resume:
        {resume_text}
        
        Extract:
        - Years of total experience (estimate if not explicit)
        - Skills with proficiency levels (1=beginner, 2=novice, 3=intermediate, 4=advanced, 5=expert)
        - Projects mentioned
        - Certifications
        - GitHub/repository links
        - Estimate weekly time budget for learning (default: 10 hours)
        - Learning style preference (project/reading/video/mixed, default: mixed)
        
        Be conservative with skill levels. Most people are 2-3 level.
        """
        
        try:
            # Create a temporary schema for the LLM response
            class ProfileExtraction(BaseModel):
                years_total: float
                skills: Dict[str, int]
                projects: List[str]
                certifications: List[str]
                repos: List[str]
                time_budget_hours_per_week: int
                learning_style: str
            
            extraction = self.llm.call_with_schema(prompt, ProfileExtraction)
            
            return UserProfile(
                user_id=user_id,
                years_total=extraction.years_total,
                skills=extraction.skills,
                projects=extraction.projects,
                certifications=extraction.certifications,
                repos=extraction.repos,
                time_budget_hours_per_week=extraction.time_budget_hours_per_week,
                learning_style=extraction.learning_style
            )
        except Exception as e:
            logger.error(f"Error building profile: {e}")
            # Return a basic profile as fallback
            return UserProfile(
                user_id=user_id,
                years_total=1.0,
                skills={"Programming": 2},
                time_budget_hours_per_week=10
            )

    # -------- Step 2: Gap Analysis --------
    def analyze_gaps(self, profile: UserProfile, role: str) -> List[Gap]:
        """
        Planner Agent call #1:
          Input: RoleGraph + UserProfile
          Output: List[Gap] with confidence, effort hours, prereqs.
        Personalized by:
          - Years of experience
          - Adjacent skills
          - Learning style
        """
        role_definition = self.roles.get_role(role)
        if not role_definition:
            raise ValueError(f"Role '{role}' not found in role graph")
        
        required_skills = role_definition["skills"]
        user_skills = profile.skills
        
        prompt = f"""
        Analyze skill gaps for a user transitioning to: {role}
        
        User Profile:
        - Years of experience: {profile.years_total}
        - Current skills: {json.dumps(user_skills, indent=2)}
        - Learning style: {profile.learning_style}
        - Time budget: {profile.time_budget_hours_per_week} hours/week
        
        Required Skills for {role}:
        {json.dumps(required_skills, indent=2)}
        
        For each skill where the user's level is below the required level, create a Gap analysis.
        
        Guidelines:
        - Confidence should reflect how certain you are about the gap (0.0-1.0)
        - Effort hours should be realistic estimates for bridging the gap
        - Include evidence from user's background
        - List prerequisites that should be learned first
        - Consider adjacent skills the user already has
        """
        
        class GapAnalysis(BaseModel):
            gaps: List[Gap]
        
        analysis = self.llm.call_with_schema(prompt, GapAnalysis)
        return analysis.gaps

    # -------- Step 3: Generate Plans --------
    def generate_plans(self, profile: UserProfile, role: str, gaps: List[Gap]) -> List[LearningPlan]:
        """
        Planner Agent call #2:
          - Sample 2–3 plan variants (e.g. fundamentals-first vs project-first)
          - Each plan includes 12 WeeklyPlans, daily tasks, deliverables
          - Use resource_bank.search(skill) to fill resources (no hallucinations)
        """
        # Get available resources for each skill
        skill_resources = {}
        for gap in gaps:
            skill_resources[gap.skill] = self.resources.search(gap.skill)
        
        available_resources = list(self.resources.resources.keys())
        
        plans = []
        
        # Generate 2-3 different plan approaches
        approaches = [
            "fundamentals_first",
            "project_driven", 
            "balanced"
        ]
        
        for approach in approaches[:2]:  # Generate 2 plans for now
            prompt = f"""
            Create a 12-week learning plan for transitioning to: {role}
            
            Approach: {approach}
            - fundamentals_first: Start with theory and basics, build up gradually
            - project_driven: Learn through building projects, theory as needed
            - balanced: Mix of theory and practical application
            
            User Profile:
            - Years of experience: {profile.years_total}
            - Current skills: {json.dumps(profile.skills, indent=2)}
            - Time budget: {profile.time_budget_hours_per_week} hours/week
            - Learning style: {profile.learning_style}
            
            Skill Gaps to Address:
            {json.dumps([{"skill": g.skill, "have": g.have, "need": g.need, "effort_hours": g.effort_hours} for g in gaps], indent=2)}
            
            Available Resources (use ONLY these IDs):
            {json.dumps(available_resources)}
            
            Requirements:
            - Exactly 12 weekly plans
            - Each week has 5-7 daily tasks (15-240 minutes each)
            - Tasks must reference available resources
            - Include measurable deliverables
            - Progressive difficulty
            - Checkpoints at weeks 4, 8, and 12
            - 3-10 coaching tips
            
            Focus on the {approach} approach while ensuring comprehensive coverage.
            """
            
            try:
                plan = self.llm.call_with_schema(prompt, LearningPlan)
                plans.append(plan)
            except Exception as e:
                logger.error(f"Error generating {approach} plan: {e}")
                continue
        
        return plans if plans else [self._create_fallback_plan(role, gaps)]

    def _create_fallback_plan(self, role: str, gaps: List[Gap]) -> LearningPlan:
        """Create a basic fallback plan if LLM generation fails."""
        weeks = []
        for i in range(1, 13):
            week = WeeklyPlan(
                week=i,
                theme=f"Week {i} - Learning Fundamentals",
                goals=[f"Learn basic concepts for week {i}"],
                deliverable=f"Complete week {i} exercises",
                daily=[
                    DailyTask(
                        title=f"Day {j+1} - Study Session",
                        minutes=60,
                        verify="Complete exercises and take notes",
                        resources=["html_mdn"]  # Use a safe default resource
                    ) for j in range(5)
                ]
            )
            weeks.append(week)
        
        return LearningPlan(
            role=role,
            weeks=weeks,
            coaching_tips=["Stay consistent", "Practice daily", "Build projects"],
            checkpoints={4: "First milestone", 8: "Midpoint check", 12: "Final assessment"}
        )

    # -------- Step 4: Critic Agent --------
    def evaluate_plans(self, plans: List[LearningPlan], profile: UserProfile) -> LearningPlan:
        """
        Critic Agent evaluates each plan on rubric:
          - Coverage of gaps
          - Feasibility within time_budget
          - Measurability of outputs
          - Portfolio impact
          - Fit with learning_style
        Returns the best plan (may also suggest edits).
        """
        if not plans:
            raise ValueError("No plans to evaluate")
        
        if len(plans) == 1:
            return plans[0]
        
        prompt = f"""
        Evaluate these learning plans and select the best one based on:
        
        Evaluation Criteria (score 1-5 each):
        1. Coverage: Does it address all necessary skills?
        2. Feasibility: Realistic within {profile.time_budget_hours_per_week} hours/week?
        3. Measurability: Clear deliverables and verification methods?
        4. Portfolio Impact: Will it create impressive portfolio pieces?
        5. Learning Style Fit: Matches user's "{profile.learning_style}" preference?
        
        User Context:
        - Experience: {profile.years_total} years
        - Time budget: {profile.time_budget_hours_per_week} hours/week
        - Learning style: {profile.learning_style}
        
        Plans to evaluate:
        {json.dumps([{"role": p.role, "weeks": len(p.weeks), "coaching_tips": len(p.coaching_tips)} for p in plans], indent=2)}
        
        Return the index (0-based) of the best plan and brief reasoning.
        """
        
        class PlanEvaluation(BaseModel):
            best_plan_index: int
            reasoning: str
            scores: Dict[int, Dict[str, int]]  # plan_index -> criterion -> score
        
        try:
            evaluation = self.llm.call_with_schema(prompt, PlanEvaluation)
            if 0 <= evaluation.best_plan_index < len(plans):
                return plans[evaluation.best_plan_index]
        except Exception as e:
            logger.error(f"Error evaluating plans: {e}")
        
        # Fallback: return first plan
        return plans[0]

    # -------- Step 5: Constraint Oracle --------
    def enforce_constraints(self, plan: LearningPlan, profile: UserProfile) -> LearningPlan:
        """
        Deterministic guardrails:
          - No >1 long-session/day
          - Respect time_budget_hours_per_week
          - No tasks without verification
          - Only whitelisted resources
        Auto-fix small violations, else re-prompt Planner.
        """
        violations = []
        
        for week in plan.weeks:
            weekly_minutes = 0
            long_sessions_count = 0
            
            for day_idx, daily_task in enumerate(week.daily):
                # Check task duration
                if daily_task.minutes > 120:  # >2 hours = long session
                    long_sessions_count += 1
                
                # Check verification
                if not daily_task.verify or len(daily_task.verify.strip()) < 5:
                    violations.append(f"Week {week.week}, Day {day_idx+1}: Missing proper verification")
                
                # Check resources exist
                for resource_id in daily_task.resources:
                    if not self.resources.get_resource(resource_id):
                        violations.append(f"Week {week.week}, Day {day_idx+1}: Invalid resource '{resource_id}'")
                
                weekly_minutes += daily_task.minutes
            
            # Check weekly time budget
            weekly_hours = weekly_minutes / 60
            if weekly_hours > profile.time_budget_hours_per_week * 1.2:  # 20% buffer
                violations.append(f"Week {week.week}: Exceeds time budget ({weekly_hours:.1f}h > {profile.time_budget_hours_per_week}h)")
            
            # Check long sessions per week
            if long_sessions_count > 2:  # Max 2 long sessions per week
                violations.append(f"Week {week.week}: Too many long sessions ({long_sessions_count})")
        
        # Auto-fix minor violations
        if violations:
            logger.warning(f"Constraint violations found: {violations}")
            # For now, just log and return the plan
            # In production, implement auto-fixes or re-generation
        
        return plan

    # -------- Step 6: Finalizer --------
    def personalize_tips(self, plan: LearningPlan, profile: UserProfile) -> LearningPlan:
        """
        LLM pass to add motivational coaching tips, tone adjustment, and
        reflection prompts, referencing the actual tasks in plan.
        """
        prompt = f"""
        Enhance this learning plan with personalized coaching tips and motivational content.
        
        User Context:
        - Experience level: {profile.years_total} years
        - Learning style: {profile.learning_style}
        - Time commitment: {profile.time_budget_hours_per_week} hours/week
        
        Current Plan Summary:
        - Role: {plan.role}
        - Weeks: {len(plan.weeks)}
        - Current tips: {len(plan.coaching_tips)}
        
        Add 5-8 personalized coaching tips that:
        1. Reference specific weeks/tasks in the plan
        2. Address common challenges for this transition
        3. Provide motivation and mindset guidance
        4. Include reflection prompts
        5. Are encouraging but realistic
        
        Keep existing tips and add new ones. Make them specific to this user's journey.
        """
        
        class CoachingEnhancement(BaseModel):
            additional_coaching_tips: List[str]
        
        try:
            enhancement = self.llm.call_with_schema(prompt, CoachingEnhancement)
            
            # Add new tips to existing ones
            enhanced_tips = plan.coaching_tips + enhancement.additional_coaching_tips
            
            # Create new plan with enhanced tips
            return LearningPlan(
                role=plan.role,
                weeks=plan.weeks,
                coaching_tips=enhanced_tips,
                checkpoints=plan.checkpoints
            )
        except Exception as e:
            logger.error(f"Error personalizing tips: {e}")
            return plan

    # -------- End-to-End --------
    def run(self, resume_text: str, role: str, user_id: str = "user_001") -> LearningPlan:
        """
        End-to-end pipeline execution.
        """
        logger.info(f"Starting pipeline for role: {role}")
        
        try:
            # Step 1: Build user profile
            logger.info("Step 1: Building user profile...")
            profile = self.build_profile(resume_text, user_id)
            logger.info(f"Profile created for user with {profile.years_total} years experience")
            
            # Step 2: Analyze gaps
            logger.info("Step 2: Analyzing skill gaps...")
            gaps = self.analyze_gaps(profile, role)
            logger.info(f"Found {len(gaps)} skill gaps to address")
            
            # Step 3: Generate candidate plans
            logger.info("Step 3: Generating learning plans...")
            candidates = self.generate_plans(profile, role, gaps)
            logger.info(f"Generated {len(candidates)} candidate plans")
            
            # Step 4: Evaluate and select best plan
            logger.info("Step 4: Evaluating plans...")
            best = self.evaluate_plans(candidates, profile)
            logger.info("Selected best plan based on evaluation criteria")
            
            # Step 5: Enforce constraints
            logger.info("Step 5: Enforcing constraints...")
            constrained = self.enforce_constraints(best, profile)
            logger.info("Applied constraint validation")
            
            # Step 6: Personalize with coaching tips
            logger.info("Step 6: Adding personalized coaching...")
            final = self.personalize_tips(constrained, profile)
            logger.info("Added personalized coaching tips")
            
            logger.info("Pipeline completed successfully!")
            return final
            
        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            raise


# =====================================================
# Factory Function
# =====================================================

def create_pipeline(openai_api_key: str, data_dir: str = "data") -> Pipeline:
    """
    Factory function to create a fully configured pipeline.
    """
    llm_client = LLMClient(openai_api_key)
    role_graph = RoleGraphRepository(data_dir)
    resource_bank = ResourceBank(data_dir)
    
    return Pipeline(llm_client, role_graph, resource_bank)


# =====================================================
# Example Usage
# =====================================================

if __name__ == "__main__":
    # Example usage (requires OpenAI API key)
    import os
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Please set OPENAI_API_KEY environment variable")
        exit(1)
    
    # Create pipeline
    pipeline = create_pipeline(api_key)
    
    # Example resume
    sample_resume = """
    John Doe
    Software Developer
    
    Experience:
    - 2 years as Junior Developer at TechCorp
    - Worked with HTML, CSS, JavaScript
    - Built 3 web applications using React
    - Basic knowledge of Node.js and MongoDB
    
    Projects:
    - E-commerce website with React and Node.js
    - Portfolio website with responsive design
    
    Education:
    - BS Computer Science, State University
    
    Skills:
    - JavaScript (intermediate)
    - React (intermediate) 
    - HTML/CSS (advanced)
    - Git (basic)
    """
    
    try:
        # Generate roadmap
        roadmap = pipeline.run(sample_resume, "Full Stack Developer")
        
        # Print summary
        print(f"\n🎯 Career Roadmap: {roadmap.role}")
        print(f"📅 Duration: {len(roadmap.weeks)} weeks")
        print(f"🎯 Checkpoints: {list(roadmap.checkpoints.keys())}")
        print(f"💡 Coaching Tips: {len(roadmap.coaching_tips)}")
        
        print("\n📋 Weekly Themes:")
        for week in roadmap.weeks[:3]:  # Show first 3 weeks
            print(f"  Week {week.week}: {week.theme}")
            print(f"    📦 Deliverable: {week.deliverable}")
            print(f"    📚 Daily Tasks: {len(week.daily)}")
        
        print(f"\n... and {len(roadmap.weeks) - 3} more weeks")
        
    except Exception as e:
        print(f"Error running pipeline: {e}")