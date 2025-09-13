#!/usr/bin/env python3
"""
FastAPI Server for DevClimb Roadmap Generation

This FastAPI application provides an endpoint to generate learning roadmaps
by integrating gap analysis and roadmap generation agents.

Author: DevClimb Team
Version: 1.0
"""

import logging
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import our custom agents
from gap_analysis_llm import GapAnalysisLLM
from roadmap_agent_llm import RoadmapAgent

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="DevClimb Roadmap API",
    description="Generate personalized learning roadmaps based on resume analysis",
    version="1.0.0"
)

# Pydantic models for request/response
class RoadmapRequest(BaseModel):
    """Request model for roadmap generation"""
    resume_text: str = Field(..., description="Resume text content")
    target_role: str = Field(..., description="Target job role (e.g., 'full_stack_engineer')")

class RoadmapResponse(BaseModel):
    """Response model for roadmap generation"""
    success: bool = Field(..., description="Whether the operation was successful")
    gap_analysis: Dict[str, Any] = Field(..., description="Gap analysis results")
    roadmap: Dict[str, Any] = Field(..., description="Generated learning roadmap")
    message: str = Field(..., description="Status message")

# Initialize agents globally (for efficiency)
try:
    gap_analyzer = GapAnalysisLLM()
    roadmap_agent = RoadmapAgent()
    logger.info("Agents initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize agents: {e}")
    gap_analyzer = None
    roadmap_agent = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "DevClimb Roadmap API is running", "status": "healthy"}

@app.post("/generate-roadmap", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest):
    """
    Generate a personalized learning roadmap based on resume and target role.
    
    This endpoint:
    1. Performs gap analysis on the provided resume
    2. Generates a 12-week learning roadmap with daily tasks
    3. Returns both the gap analysis and roadmap
    
    Args:
        request: RoadmapRequest containing resume_text and target_role
        
    Returns:
        RoadmapResponse with gap analysis and generated roadmap
        
    Raises:
        HTTPException: If agents are not initialized or processing fails
    """
    try:
        # Check if agents are initialized
        if gap_analyzer is None or roadmap_agent is None:
            raise HTTPException(
                status_code=500,
                detail="Agents not properly initialized. Check OpenAI API key and dependencies."
            )
        
        logger.info(f"Processing roadmap request for role: {request.target_role}")
        
        # Step 1: Perform gap analysis
        logger.info("Running gap analysis...")
        gap_analysis = gap_analyzer.run_analysis(request.resume_text, request.target_role)
        
        # Step 2: Generate roadmap from gap analysis
        logger.info("Generating roadmap...")
        roadmap = roadmap_agent.generate_roadmap(gap_analysis)
        
        # Step 3: Return combined results
        logger.info("Roadmap generation completed successfully")
        
        return RoadmapResponse(
            success=True,
            gap_analysis=gap_analysis,
            roadmap=roadmap,
            message=f"Successfully generated roadmap for {request.target_role}"
        )
        
    except Exception as e:
        logger.error(f"Error generating roadmap: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate roadmap: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "agents_initialized": gap_analyzer is not None and roadmap_agent is not None,
        "gap_analyzer": gap_analyzer is not None,
        "roadmap_agent": roadmap_agent is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
