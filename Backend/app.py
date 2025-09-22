#!/usr/bin/env python3
"""
FastAPI Server for DevClimb Roadmap Generation

This FastAPI application provides an endpoint to generate learning roadmaps
by integrating gap analysis and roadmap generation agents.

Author: DevClimb Team
Version: 1.0
"""

import logging
import uuid
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import our custom agents
from gap_analysis_llm import GapAnalysisLLM
from roadmap_agent_llm import RoadmapAgent
from rds_client import PostgreSQLRDSClient, RoadmapOperations, JobTrackingOperations
from models import (
    GenerateAndSaveRoadmapRequest, TaskCompletionRequest,
    RoadmapSummaryResponse, WeekDetailsResponse, ProgressResponse,
    TaskCompletionResponse, RoadmapCreationResponse, SuccessResponse, ErrorResponse
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Note: DynamoDB removed - using PostgreSQL for all data storage

# Initialize FastAPI app
app = FastAPI(
    title="DevClimb Roadmap API",
    description="Generate personalized learning roadmaps based on resume analysis",
    version="1.0.0"
)

# Pydantic models for request/response
# Legacy models removed - using new database-integrated models from models.py

# Legacy DynamoDB functions removed - using PostgreSQL for all data storage

# Initialize agents and database clients globally (for efficiency)
try:
    gap_analyzer = GapAnalysisLLM()
    roadmap_agent = RoadmapAgent()
    rds_client = PostgreSQLRDSClient()
    roadmap_ops = RoadmapOperations(rds_client)
    job_ops = JobTrackingOperations(rds_client)
    logger.info("Agents and database clients initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize agents or database: {e}")
    gap_analyzer = None
    roadmap_agent = None
    rds_client = None
    roadmap_ops = None
    job_ops = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "DevClimb Roadmap API is running", "status": "healthy"}

# Legacy DynamoDB endpoints removed

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "agents_initialized": gap_analyzer is not None and roadmap_agent is not None,
        "gap_analyzer": gap_analyzer is not None,
        "roadmap_agent": roadmap_agent is not None,
        "rds_initialized": rds_client is not None,
        "roadmap_ops_initialized": roadmap_ops is not None,
        "job_ops_initialized": job_ops is not None
    }

# ==================== NEW DATABASE-INTEGRATED ENDPOINTS ====================

@app.post("/generate-roadmap-and-save", response_model=RoadmapCreationResponse)
async def generate_roadmap_and_save_to_db(request: GenerateAndSaveRoadmapRequest, background_tasks: BackgroundTasks):
    """
    Generate roadmap and save to PostgreSQL database with job tracking
    """
    try:
        if not roadmap_ops or not job_ops:
            raise HTTPException(status_code=500, detail="Database not properly initialized")
        
        # Generate unique job ID
        job_id = int(str(uuid.uuid4().int)[:8])  # Use first 8 digits of UUID as int
        logger.info(f"Generated job ID {job_id} for role: {request.target_role}")
        
        # Create job record with "in progress" status
        success = job_ops.create_job(job_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to create job record")
        
        # Start background processing
        background_tasks.add_task(
            process_roadmap_and_save_to_db,
            job_id,
            request.resume_text,
            request.target_role,
            request.role_id
        )
        
        return RoadmapCreationResponse(
            roadmap_id=job_id,  # Return job_id for polling
            message=f"Roadmap generation started for {request.target_role}. Use job ID {job_id} to check status.",
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting roadmap generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start roadmap generation: {str(e)}")

@app.get("/job/{job_id}")
async def get_job_status(job_id: int):
    """
    Get the status of a roadmap generation job
    """
    try:
        if not job_ops:
            raise HTTPException(status_code=500, detail="Database not properly initialized")
        
        job_status = job_ops.get_job_status(job_id)
        if not job_status:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        return {
            "job_id": job_status['job_id'],
            "status": job_status['status'],
            "roadmap_id": job_status['roadmap_id'],
            "message": f"Job {job_id} is {job_status['status']}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving job status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve job status: {str(e)}")

@app.get("/users/{user_id}/roadmaps", response_model=List[RoadmapSummaryResponse])
async def get_user_roadmaps(user_id: int = 1):  # Default to user_id=1 as requested
    """Get all roadmaps for a user with progress summary"""
    try:
        if not roadmap_ops:
            raise HTTPException(status_code=500, detail="Database not properly initialized")
        
        roadmaps = roadmap_ops.get_user_roadmaps_summary(user_id)
        return [RoadmapSummaryResponse(**roadmap) for roadmap in roadmaps]
        
    except Exception as e:
        logger.error(f"Error fetching user roadmaps: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch roadmaps: {str(e)}")

@app.get("/roadmaps/{roadmap_id}/weeks/{week_index}", response_model=WeekDetailsResponse)
async def get_week_details(roadmap_id: int, week_index: int):
    """Get detailed information for a specific week"""
    try:
        if not roadmap_ops:
            raise HTTPException(status_code=500, detail="Database not properly initialized")
        
        week_details = roadmap_ops.get_week_details(roadmap_id, week_index)
        if not week_details:
            raise HTTPException(status_code=404, detail=f"Week {week_index} not found for roadmap {roadmap_id}")
        
        return WeekDetailsResponse(**week_details)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching week details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch week details: {str(e)}")

@app.get("/roadmaps/{roadmap_id}/progress", response_model=ProgressResponse)
async def get_roadmap_progress(roadmap_id: int):
    """Get overall progress for a roadmap"""
    try:
        if not roadmap_ops:
            raise HTTPException(status_code=500, detail="Database not properly initialized")
        
        progress = roadmap_ops.get_roadmap_progress(roadmap_id)
        return ProgressResponse(**progress)
        
    except Exception as e:
        logger.error(f"Error fetching roadmap progress: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch progress: {str(e)}")

@app.put("/tasks/{task_id}/complete", response_model=TaskCompletionResponse)
async def mark_task_complete(task_id: int, request: TaskCompletionRequest):
    """Mark a task as complete or incomplete"""
    try:
        if not roadmap_ops:
            raise HTTPException(status_code=500, detail="Database not properly initialized")
        
        success = roadmap_ops.mark_task_complete(task_id, request.completed)
        if not success:
            raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
        
        return TaskCompletionResponse(
            success=True,
            message=f"Task {task_id} marked as {'completed' if request.completed else 'incomplete'}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")

@app.delete("/roadmaps/{roadmap_id}", response_model=SuccessResponse)
async def delete_roadmap(roadmap_id: int):
    """Delete a roadmap and all associated data"""
    try:
        if not roadmap_ops:
            raise HTTPException(status_code=500, detail="Database not properly initialized")
        
        success = roadmap_ops.delete_roadmap(roadmap_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Roadmap {roadmap_id} not found")
        
        return SuccessResponse(message=f"Roadmap {roadmap_id} deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting roadmap: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete roadmap: {str(e)}")

# ==================== BACKGROUND TASK FOR DATABASE INTEGRATION ====================

async def process_roadmap_and_save_to_db(job_id: int, resume_text: str, target_role: str, role_id: int):
    """Background task that generates roadmap and saves to PostgreSQL with job tracking"""
    import threading
    
    def process_sync():
        try:
            logger.info(f"Starting background processing for job {job_id}, role: {target_role}")
            
            # Check if agents are initialized
            if gap_analyzer is None or roadmap_agent is None or roadmap_ops is None or job_ops is None:
                logger.error(f"Agents not initialized for job {job_id}")
                return
            
            # Step 1: Perform gap analysis
            logger.info(f"Running gap analysis for job {job_id}...")
            gap_analysis = gap_analyzer.run_analysis(resume_text, target_role)
            
            # Step 2: Generate roadmap from gap analysis
            logger.info(f"Generating roadmap for job {job_id}...")
            roadmap = roadmap_agent.generate_roadmap(gap_analysis)
            
            # Step 3: Save to PostgreSQL
            logger.info(f"Saving roadmap to PostgreSQL for job {job_id}...")
            roadmap_id = roadmap_ops.populate_roadmap_from_json(roadmap, 1, role_id)  # user_id=1 as requested
            
            # Step 4: Update job status to complete
            logger.info(f"Updating job {job_id} status to complete...")
            success = job_ops.update_job_completion(job_id, roadmap_id)
            
            if success:
                logger.info(f"Successfully completed job {job_id} with roadmap_id {roadmap_id}")
            else:
                logger.error(f"Failed to update job {job_id} status to complete")
                
        except Exception as e:
            logger.error(f"Error processing job {job_id}: {str(e)}")
            # Note: In production, you might want to update job status to "failed" here
    
    # Run the synchronous processing in a separate thread
    thread = threading.Thread(target=process_sync)
    thread.daemon = True
    thread.start()
    logger.info(f"Background thread started for job {job_id}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)