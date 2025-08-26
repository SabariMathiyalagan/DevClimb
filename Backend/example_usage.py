"""
example_usage.py
---------------
Example usage and testing script for the Career Roadmap AI Pipeline.
"""

import os
import json
from typing import Dict, Any
from pipeline import create_pipeline, UserProfile, LearningPlan

# Sample resume data for testing
SAMPLE_RESUMES = {
    "junior_frontend": """
    Sarah Johnson
    Junior Frontend Developer
    
    Experience:
    - 1 year as Frontend Developer at StartupCorp
    - Internship at WebAgency (6 months)
    - Built 5+ responsive websites using HTML, CSS, JavaScript
    - Experience with React and basic TypeScript
    - Familiar with Git and GitHub
    
    Projects:
    - Personal portfolio website (HTML, CSS, JavaScript)
    - Todo app with React and local storage
    - Restaurant website with responsive design
    
    Education:
    - Bootcamp Graduate - Full Stack Web Development
    - BS Marketing, Community College
    
    Skills:
    - HTML/CSS (advanced)
    - JavaScript (intermediate)
    - React (beginner-intermediate)
    - Git (basic)
    - Responsive Design (intermediate)
    """,
    
    "career_changer": """
    Michael Chen
    Marketing Manager → Aspiring Backend Developer
    
    Experience:
    - 5 years as Marketing Manager at Fortune 500 company
    - Self-taught programming in evenings (6 months)
    - Completed online Python course
    - Built 2 small web scrapers for work automation
    - Basic SQL knowledge from marketing analytics
    
    Projects:
    - Web scraper for competitor analysis (Python, BeautifulSoup)
    - Personal expense tracker (Python, SQLite)
    - Marketing dashboard (Python, Pandas, basic Flask)
    
    Education:
    - MBA Marketing, State University
    - Various online programming courses (Coursera, Udemy)
    
    Skills:
    - Python (beginner-intermediate)
    - SQL (basic)
    - Project Management (advanced)
    - Data Analysis (intermediate)
    - Problem Solving (advanced)
    """,
    
    "experienced_developer": """
    Alex Rodriguez
    Senior Frontend Developer → Full Stack Transition
    
    Experience:
    - 6 years as Frontend Developer (React, Angular, Vue)
    - Led frontend team of 4 developers
    - Built 20+ production applications
    - Strong TypeScript, testing, and performance optimization
    - Some exposure to Node.js and databases
    
    Projects:
    - E-commerce platform frontend (React, TypeScript, Redux)
    - Component library used across organization
    - Performance optimization reducing load times by 40%
    - Mentored 10+ junior developers
    
    Education:
    - BS Computer Science, Tech University
    - Multiple frontend conferences and workshops
    
    Skills:
    - JavaScript/TypeScript (expert)
    - React (expert)
    - HTML/CSS (expert)
    - Testing (advanced)
    - Git (advanced)
    - Node.js (basic)
    - Databases (basic)
    """
}

def print_roadmap_summary(roadmap: LearningPlan) -> None:
    """
    Print a formatted summary of the learning roadmap.
    """
    print(f"\n{'='*60}")
    print(f"🎯 CAREER ROADMAP: {roadmap.role.upper()}")
    print(f"{'='*60}")
    
    print(f"\n📅 DURATION: {len(roadmap.weeks)} weeks")
    print(f"🎯 CHECKPOINTS: Week {', Week '.join(map(str, roadmap.checkpoints.keys()))}")
    
    print(f"\n📋 WEEKLY BREAKDOWN:")
    for i, week in enumerate(roadmap.weeks):
        if i < 3 or i >= len(roadmap.weeks) - 2:  # Show first 3 and last 2
            total_minutes = sum(task.minutes for task in week.daily)
            hours = total_minutes / 60
            print(f"  Week {week.week:2d}: {week.theme}")
            print(f"           📦 {week.deliverable}")
            print(f"           ⏱️  {hours:.1f} hours ({len(week.daily)} tasks)")
        elif i == 3:
            print(f"  ... (weeks 4-{len(roadmap.weeks)-2}) ...")
    
    print(f"\n💡 COACHING TIPS ({len(roadmap.coaching_tips)} total):")
    for i, tip in enumerate(roadmap.coaching_tips[:3]):
        print(f"  {i+1}. {tip}")
    if len(roadmap.coaching_tips) > 3:
        print(f"  ... and {len(roadmap.coaching_tips) - 3} more tips")
    
    print(f"\n🎯 KEY MILESTONES:")
    for week, milestone in roadmap.checkpoints.items():
        print(f"  Week {week:2d}: {milestone}")


def save_roadmap_json(roadmap: LearningPlan, filename: str) -> None:
    """
    Save roadmap to JSON file for further processing.
    """
    roadmap_dict = roadmap.dict()
    with open(filename, 'w') as f:
        json.dump(roadmap_dict, f, indent=2)
    print(f"\n💾 Roadmap saved to: {filename}")


def test_pipeline_with_sample(resume_key: str, target_role: str) -> LearningPlan:
    """
    Test the pipeline with a sample resume.
    """
    # Get API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Please set OPENAI_API_KEY environment variable")
        print("   Example: export OPENAI_API_KEY='your-key-here'")
        return None
    
    # Create pipeline
    print(f"🚀 Initializing pipeline...")
    pipeline = create_pipeline(api_key)
    
    # Get sample resume
    if resume_key not in SAMPLE_RESUMES:
        print(f"❌ Resume key '{resume_key}' not found")
        print(f"   Available keys: {list(SAMPLE_RESUMES.keys())}")
        return None
    
    resume_text = SAMPLE_RESUMES[resume_key]
    
    print(f"📄 Using sample resume: {resume_key}")
    print(f"🎯 Target role: {target_role}")
    print(f"⚡ Generating roadmap...")
    
    try:
        # Generate roadmap
        roadmap = pipeline.run(resume_text, target_role)
        
        # Display results
        print_roadmap_summary(roadmap)
        
        # Save to file
        filename = f"roadmap_{resume_key}_{target_role.lower().replace(' ', '_')}.json"
        save_roadmap_json(roadmap, filename)
        
        return roadmap
        
    except Exception as e:
        print(f"❌ Pipeline failed: {e}")
        return None


def interactive_demo():
    """
    Interactive demo for testing the pipeline.
    """
    print("🎓 Career Roadmap AI Pipeline - Interactive Demo")
    print("=" * 50)
    
    # Show available samples
    print("\n📋 Available Sample Resumes:")
    for key, resume in SAMPLE_RESUMES.items():
        first_line = resume.strip().split('\n')[0].strip()
        print(f"  {key}: {first_line}")
    
    # Show available roles
    print("\n🎯 Available Target Roles:")
    roles = ["Frontend Developer", "Backend Developer", "Full Stack Developer"]
    for i, role in enumerate(roles, 1):
        print(f"  {i}. {role}")
    
    # Get user input
    print("\n" + "-" * 30)
    resume_key = input("Enter resume key (or 'quit' to exit): ").strip()
    
    if resume_key.lower() == 'quit':
        return
    
    if resume_key not in SAMPLE_RESUMES:
        print(f"❌ Invalid resume key. Available: {list(SAMPLE_RESUMES.keys())}")
        return
    
    target_role = input("Enter target role: ").strip()
    
    if not target_role:
        print("❌ Target role is required")
        return
    
    # Run pipeline
    roadmap = test_pipeline_with_sample(resume_key, target_role)
    
    if roadmap:
        print("\n✅ Pipeline completed successfully!")
        
        # Ask if user wants detailed output
        detail = input("\nShow detailed week breakdown? (y/n): ").strip().lower()
        if detail == 'y':
            print_detailed_roadmap(roadmap)


def print_detailed_roadmap(roadmap: LearningPlan) -> None:
    """
    Print detailed week-by-week breakdown.
    """
    print(f"\n{'='*80}")
    print(f"DETAILED ROADMAP: {roadmap.role}")
    print(f"{'='*80}")
    
    for week in roadmap.weeks:
        total_minutes = sum(task.minutes for task in week.daily)
        hours = total_minutes / 60
        
        print(f"\n📅 WEEK {week.week}: {week.theme}")
        print(f"   Time Commitment: {hours:.1f} hours")
        print(f"   📦 Deliverable: {week.deliverable}")
        
        print(f"   🎯 Goals:")
        for goal in week.goals:
            print(f"     • {goal}")
        
        print(f"   📚 Daily Tasks:")
        for i, task in enumerate(week.daily, 1):
            print(f"     Day {i}: {task.title} ({task.minutes}min)")
            print(f"            ✅ Verify: {task.verify}")
            print(f"            📖 Resources: {', '.join(task.resources)}")


def benchmark_pipeline():
    """
    Benchmark the pipeline with different resume types and roles.
    """
    print("🔬 Benchmarking Pipeline Performance")
    print("=" * 40)
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Please set OPENAI_API_KEY environment variable")
        return
    
    pipeline = create_pipeline(api_key)
    
    test_cases = [
        ("junior_frontend", "Frontend Developer"),
        ("career_changer", "Backend Developer"),
        ("experienced_developer", "Full Stack Developer")
    ]
    
    results = []
    
    for resume_key, role in test_cases:
        print(f"\n🧪 Testing: {resume_key} → {role}")
        
        try:
            import time
            start_time = time.time()
            
            roadmap = pipeline.run(SAMPLE_RESUMES[resume_key], role)
            
            end_time = time.time()
            duration = end_time - start_time
            
            results.append({
                "resume_type": resume_key,
                "target_role": role,
                "duration_seconds": duration,
                "weeks_generated": len(roadmap.weeks),
                "total_tasks": sum(len(week.daily) for week in roadmap.weeks),
                "coaching_tips": len(roadmap.coaching_tips),
                "success": True
            })
            
            print(f"   ✅ Success in {duration:.1f}s")
            
        except Exception as e:
            print(f"   ❌ Failed: {e}")
            results.append({
                "resume_type": resume_key,
                "target_role": role,
                "success": False,
                "error": str(e)
            })
    
    # Print benchmark results
    print(f"\n📊 BENCHMARK RESULTS")
    print("-" * 40)
    
    for result in results:
        if result["success"]:
            print(f"{result['resume_type']} → {result['target_role']}")
            print(f"  ⏱️  Duration: {result['duration_seconds']:.1f}s")
            print(f"  📅 Weeks: {result['weeks_generated']}")
            print(f"  📚 Tasks: {result['total_tasks']}")
            print(f"  💡 Tips: {result['coaching_tips']}")
        else:
            print(f"{result['resume_type']} → {result['target_role']}: ❌ FAILED")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "demo":
            interactive_demo()
        elif command == "benchmark":
            benchmark_pipeline()
        elif command == "test" and len(sys.argv) >= 4:
            resume_key = sys.argv[2]
            target_role = " ".join(sys.argv[3:])
            test_pipeline_with_sample(resume_key, target_role)
        else:
            print("Usage:")
            print("  python example_usage.py demo        # Interactive demo")
            print("  python example_usage.py benchmark   # Run benchmarks")
            print("  python example_usage.py test <resume_key> <target_role>")
            print(f"  Available resume keys: {list(SAMPLE_RESUMES.keys())}")
    else:
        interactive_demo()