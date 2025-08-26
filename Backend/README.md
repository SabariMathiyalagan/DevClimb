# Career Roadmap AI Pipeline

A comprehensive AI-powered system that generates personalized 12-week career roadmaps based on user resumes and target roles. The pipeline combines deterministic rules with LLM-powered personalization to create actionable learning plans.

## 🎯 Features

- **Resume Analysis**: Automatically extracts skills, experience, and learning preferences
- **Gap Analysis**: Identifies skill gaps between current profile and target role
- **Multi-Plan Generation**: Creates multiple learning approaches (fundamentals-first, project-driven, balanced)
- **Intelligent Evaluation**: Uses critic agent to select the optimal plan
- **Constraint Enforcement**: Ensures realistic time commitments and resource availability
- **Personalized Coaching**: Adds motivational tips and reflection prompts

## 🏗️ Architecture

```
Resume → UserProfile → Gap Analysis → Plan Generation → Evaluation → Constraints → Personalization → Final Roadmap
```

### Core Components

1. **Resume Ingest**: Converts resume text to structured `UserProfile`
2. **RoleGraph**: Curated role definitions with required skills
3. **Planner Agent**: Performs gap analysis and generates learning plans
4. **Critic Agent**: Evaluates plans on coverage, feasibility, and learning style fit
5. **Constraint Oracle**: Enforces time budgets and resource availability
6. **Finalizer**: Adds personalized coaching tips and motivation

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
cd Backend

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### Basic Usage

```python
from pipeline import create_pipeline

# Initialize pipeline
api_key = "your-openai-api-key"
pipeline = create_pipeline(api_key)

# Sample resume
resume_text = """
John Doe
Software Developer
- 2 years experience with JavaScript and React
- Built 3 web applications
- Basic knowledge of Node.js
"""

# Generate roadmap
roadmap = pipeline.run(resume_text, "Full Stack Developer")

print(f"Generated {len(roadmap.weeks)}-week roadmap for {roadmap.role}")
```

### Interactive Demo

```bash
# Run interactive demo
python example_usage.py demo

# Run specific test case
python example_usage.py test junior_frontend "Frontend Developer"

# Benchmark performance
python example_usage.py benchmark
```

## 📊 Data Models

### UserProfile
- `user_id`: Unique identifier
- `years_total`: Total years of experience
- `skills`: Dict of skill → proficiency level (1-5)
- `time_budget_hours_per_week`: Available learning time
- `learning_style`: Preferred learning approach

### LearningPlan
- `role`: Target role
- `weeks`: 12 weekly plans with themes, goals, and daily tasks
- `coaching_tips`: Personalized motivation and guidance
- `checkpoints`: Milestone assessments at weeks 4, 8, 12

### WeeklyPlan
- `theme`: Weekly focus area
- `goals`: Learning objectives
- `deliverable`: Concrete output to create
- `daily`: 5-7 daily tasks with verification methods

## 🛠️ Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
OPENAI_MODEL=gpt-4-1106-preview
MAX_WEEKS=12
MAX_DAILY_MINUTES=240
MIN_DAILY_MINUTES=15
DATA_DIR=data
```

### Role Definitions

Roles are defined in `data/roles.json`:

```json
{
  "Frontend Developer": {
    "skills": {
      "HTML": 4,
      "CSS": 4,
      "JavaScript": 5,
      "React": 4
    },
    "prerequisites": ["HTML", "CSS", "JavaScript"],
    "assessments": ["Portfolio Website", "React App"]
  }
}
```

### Resource Bank

Learning resources in `data/resources.json`:

```json
{
  "react_docs": {
    "title": "React Official Documentation",
    "url": "https://react.dev/",
    "type": "documentation",
    "skills": ["React", "JavaScript"],
    "difficulty": 3,
    "estimated_hours": 20
  }
}
```

## 🔧 Advanced Usage

### Custom Pipeline Configuration

```python
from pipeline import Pipeline, LLMClient, RoleGraphRepository, ResourceBank

# Custom configuration
llm_client = LLMClient(
    api_key="your-key",
    model="gpt-4-1106-preview",
    max_retries=5
)

role_graph = RoleGraphRepository("custom_data_dir")
resource_bank = ResourceBank("custom_data_dir")

pipeline = Pipeline(llm_client, role_graph, resource_bank)
```

### Adding Custom Roles

```python
# Add new role to roles.json
new_role = {
  "DevOps Engineer": {
    "skills": {
      "Docker": 4,
      "Kubernetes": 4,
      "AWS": 4,
      "CI/CD": 4,
      "Linux": 4
    },
    "prerequisites": ["Linux", "Networking"],
    "assessments": ["Infrastructure as Code", "CI/CD Pipeline"]
  }
}
```

### Constraint Customization

The constraint oracle enforces:
- Maximum 2 long sessions (>2 hours) per week
- Respect user's weekly time budget
- Only use whitelisted resources
- Require verification methods for all tasks

## 🧪 Testing

### Sample Resumes

Three sample personas are included:

1. **junior_frontend**: 1-year frontend developer
2. **career_changer**: Marketing manager transitioning to backend
3. **experienced_developer**: Senior frontend moving to full-stack

### Running Tests

```bash
# Test specific combination
python example_usage.py test junior_frontend "Frontend Developer"

# Run full benchmark
python example_usage.py benchmark

# Interactive testing
python example_usage.py demo
```

## 📈 Performance

Typical generation times:
- Simple roadmap: 30-60 seconds
- Complex roadmap: 60-120 seconds
- Full pipeline with multiple plans: 2-5 minutes

## 🔒 Security & Privacy

- No resume data is stored permanently
- All LLM calls use OpenAI's API with standard privacy policies
- Resource bank prevents hallucinated or malicious links
- Constraint oracle enforces safe learning practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Adding New Agents

```python
class CustomAgent:
    def __init__(self, llm_client):
        self.llm = llm_client
    
    def process(self, plan: LearningPlan) -> LearningPlan:
        # Your custom processing logic
        return plan

# Integrate into pipeline
pipeline.add_agent(CustomAgent)
```

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the example usage scripts
2. Review the configuration options
3. Open an issue on GitHub
4. Check OpenAI API status if experiencing LLM errors

## 🗺️ Roadmap

- [ ] Support for more LLM providers (Anthropic, Cohere)
- [ ] Integration with job market APIs
- [ ] Advanced skill assessment tools
- [ ] Team/organization roadmap generation
- [ ] Progress tracking and analytics
- [ ] Mobile app integration