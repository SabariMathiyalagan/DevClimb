#!/usr/bin/env python3
"""
Example usage of RoadmapAgent for generating learning roadmaps.

This script demonstrates how to use the RoadmapAgent to generate 
a 12-week learning roadmap from gap analysis data.
"""

import json
import os
from roadmap_agent_llm import RoadmapAgent

def main():
    """Example usage of RoadmapAgent"""
    
    # Example gap analysis data (replace with your actual data)
    gap_analysis = {
        "meta": {
            "target_role": "frontend_engineer",
            "generated_at": "2025-09-08T16:08:37.180283Z"
        },
        "roadmap_seed": {
            "duration_weeks": 12,
            "weekly_hours_target": 8,
            "themes": [
                {"name": "Core Frontend Foundations", "skills": ["JavaScript", "HTML5", "CSS3"], "sequence": 1},
                {"name": "Advanced React and Ecosystem", "skills": ["React"], "sequence": 2},
                {"name": "Version Control Mastery", "skills": ["Git"], "sequence": 3}
            ]
        },
        "categories": [
            {
                "name": "frontend_skills",
                "skills": [
                    {"skill": "JavaScript", "status": "partial", "gap": 1},
                    {"skill": "React", "status": "met", "gap": 0.3},
                    {"skill": "HTML5", "status": "partial", "gap": 1}
                ]
            }
        ]
    }
    
    try:
        # Initialize the agent
        print("🚀 Initializing RoadmapAgent...")
        agent = RoadmapAgent()  # Uses OPENAI_API_KEY from environment
        
        # Generate roadmap
        print("🧠 Generating 12-week learning roadmap...")
        roadmap = agent.generate_roadmap(gap_analysis)
        
        # Save to file
        output_file = "generated_roadmap.json"
        with open(output_file, "w") as f:
            json.dump(roadmap, f, indent=2)
        
        # Print summary
        print(f"✅ Roadmap generated successfully!")
        print(f"📄 Saved to: {output_file}")
        print(f"🎯 Target Role: {roadmap['meta']['target_role']}")
        print(f"⏱️  Duration: {roadmap['meta']['duration_weeks']} weeks")
        print(f"📚 Weekly Hours: {roadmap['meta']['weekly_hours_target']} hours")
        print(f"📊 Total Weeks: {len(roadmap['roadmap']['weeks'])}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("💡 Make sure your OPENAI_API_KEY environment variable is set")

if __name__ == "__main__":
    main()
