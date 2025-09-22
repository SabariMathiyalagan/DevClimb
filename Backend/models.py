#!/usr/bin/env python3
"""
Pydantic models for DevClimb API requests and responses
Simple and efficient data validation for roadmap management.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date

# Request Models
class GenerateAndSaveRoadmapRequest(BaseModel):
    """Request for generating and saving roadmap to database"""
    resume_text: str = Field(..., description="Resume text content")
    target_role: str = Field(..., description="Target job role")
    role_id: int = Field(..., description="Role ID from roles table")

class TaskCompletionRequest(BaseModel):
    """Request for marking task completion"""
    completed: bool = Field(..., description="Task completion status")

# Response Models
class DailyTaskResponse(BaseModel):
    """Daily task response model"""
    task_id: int
    day_number: int
    task_description: str
    date: date
    completed: bool

class WeekDetailsResponse(BaseModel):
    """Week details with daily tasks"""
    week_index: int
    theme: str
    skills_focus: List[str]
    weekly_task: str
    daily_tasks: List[DailyTaskResponse]
    completion_rate: float

class RoadmapSummaryResponse(BaseModel):
    """Roadmap summary for dashboard"""
    roadmap_id: int
    target_role: str
    duration_weeks: int
    weekly_hours_target: int
    progress_percentage: float
    current_week: int
    generated_at: datetime

class RoadmapDetailsResponse(BaseModel):
    """Roadmap metadata response"""
    roadmap_id: int
    user_id: int
    target_role: str
    duration_weeks: int
    weekly_hours_target: int
    generated_at: datetime

class ProgressResponse(BaseModel):
    """Progress tracking response"""
    overall_progress: float
    completed_tasks: int
    total_tasks: int
    current_week: int

class TaskCompletionResponse(BaseModel):
    """Task completion response"""
    success: bool
    message: str

class RoadmapCreationResponse(BaseModel):
    """Response for roadmap creation"""
    roadmap_id: int
    message: str
    success: bool

# Standard API Response Models
class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = True
    message: str

class ErrorResponse(BaseModel):
    """Generic error response"""
    success: bool = False
    error: str
    detail: Optional[str] = None
