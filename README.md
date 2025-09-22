# DevClimb - AI-Powered Learning Roadmap Generator

DevClimb is an innovative application that generates personalized 12-week learning roadmaps with daily tasks based on your resume and target job role. It combines AI-powered gap analysis with gamified learning experiences to help developers accelerate their career growth.

## 🌟 Features

### Backend (FastAPI)
- **AI-Powered Gap Analysis**: Analyzes your resume against target job requirements
- **Personalized Roadmap Generation**: Creates detailed 12-week learning plans with daily tasks
- **LangChain Integration**: Uses advanced LLM capabilities for intelligent content generation
- **RESTful API**: Clean, documented API endpoints for seamless frontend integration

### Frontend (React Native/Expo)
- **Interactive Roadmap Visualization**: Mario-style roadmap with visual progress tracking
- **Daily Task Management**: Gamified task completion with XP rewards
- **Progress Dashboard**: Real-time analytics and achievement tracking
- **Cross-Platform**: Runs on iOS, Android, and web platforms

## 🏗️ Architecture

```
DevClimb/
├── Backend/                 # FastAPI server
│   ├── app.py              # Main FastAPI application
│   ├── gap_analysis_llm.py # Gap analysis agent
│   ├── roadmap_agent_llm.py # Roadmap generation agent
│   ├── data/               # Skill maps and role definitions
│   └── requirements.txt    # Python dependencies
└── Frontend/               # React Native/Expo app
    ├── app/               # App screens and navigation
    ├── components/        # Reusable UI components
    ├── services/          # API integration
    ├── context/           # State management
    └── config/            # Configuration files
```

## 🚀 Quick Start

### Prerequisites

- **Backend**: Python 3.8+, pip
- **Frontend**: Node.js 16+, npm/yarn, Expo CLI
- **API Key**: OpenAI API key for LLM functionality

### Backend Setup

1. **Navigate to Backend directory**:
   ```bash
   cd DevClimb/Backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   # Create a .env file in the Backend directory
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```

4. **Start the FastAPI server**:
   ```bash
   python app.py
   ```
   
   The server will start at `http://localhost:8000`

5. **Verify the API is running**:
   ```bash
   curl http://localhost:8000/
   ```

### Frontend Setup

1. **Navigate to Frontend directory**:
   ```bash
   cd DevClimb/Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API endpoint**:
   ```bash
   # Create environment configuration (optional)
   export EXPO_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server**:
   ```bash
   npx expo start
   ```

5. **Run on your preferred platform**:
   - **iOS**: Press `i` in the terminal or scan QR code with iPhone
   - **Android**: Press `a` in the terminal or scan QR code with Android
   - **Web**: Press `w` in the terminal

## 📱 Usage

### Generating Your First Roadmap

1. **Launch the app** and navigate to the onboarding screen
2. **Enter your target role** (e.g., `full_stack_engineer`, `data_scientist`)
3. **Paste your resume text** in the provided text area
4. **Click "Generate My Roadmap"** and wait for AI processing
5. **Explore your personalized roadmap** with weekly themes and daily tasks

### Navigating the App

- **Dashboard**: View your progress, current rank, and statistics
- **Roadmap**: Interactive visualization of your 12-week learning journey
- **Tasks**: Daily objectives and quest management
- **Profile**: Settings and progress tracking

## 🔧 API Reference

### Generate Roadmap

**Endpoint**: `POST /generate-roadmap`

**Request Body**:
```json
{
  "resume_text": "Your resume content as text...",
  "target_role": "full_stack_engineer"
}
```

**Response**:
```json
{
  "success": true,
  "gap_analysis": {
    "meta": {
      "target_role": "full_stack_engineer",
      "generated_at": "2025-01-01T00:00:00Z"
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
    "categories": [...]
  },
  "roadmap": {
    "meta": {
      "target_role": "full_stack_engineer",
      "duration_weeks": 12,
      "weekly_hours_target": 8,
      "generated_at": "2025-01-01T00:00:00Z"
    },
    "roadmap": {
      "weeks": [
        {
          "week_index": 1,
          "theme": "Frontend Fundamentals",
          "skills_focus": ["HTML5", "CSS3", "JavaScript"],
          "weekly_task": "Build a responsive landing page",
          "daily_tasks": [
            {
              "day": 1,
              "tasks": [
                "Set up development environment",
                "Review HTML5 semantic elements"
              ]
            }
          ]
        }
      ]
    }
  },
  "message": "Successfully generated roadmap for full_stack_engineer"
}
```

### Health Check

**Endpoint**: `GET /`
- Returns basic health status

**Endpoint**: `GET /health`  
- Returns detailed health information including agent status

## 🎯 Supported Target Roles

- `full_stack_engineer`
- `frontend_developer` 
- `backend_developer`
- `data_scientist`
- `devops_engineer`
- `mobile_developer`
- `machine_learning_engineer`
- `cloud_architect`
- `product_manager`
- `ui_ux_designer`

## 🛠️ Development

### Backend Development

**Running tests**:
```bash
cd DevClimb/Backend
python test_pipeline.py
```

**Adding new target roles**:
1. Update `data/skill_map.json` with role requirements
2. Update `data/roles.json` with role definitions
3. Add role to frontend configuration in `config/api.config.ts`

### Frontend Development

**Development server with hot reload**:
```bash
cd DevClimb/Frontend
npx expo start --clear
```

**Building for production**:
```bash
# iOS
npx expo build:ios

# Android
npx expo build:android

# Web
npx expo build:web
```

## 📦 Dependencies

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **LangChain**: Framework for developing applications with LLMs
- **OpenAI**: GPT-4 integration for intelligent content generation
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI web server implementation

### Frontend
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform for React Native
- **React Navigation**: Routing and navigation
- **React Native SVG**: SVG support for custom graphics
- **Expo Vector Icons**: Icon library

## 🔐 Security & Privacy

- **Data Privacy**: Resume data is processed securely and never stored permanently
- **API Security**: Environment-based API key management
- **HTTPS**: All production communications use encrypted connections
- **Local Processing**: Sensitive data processing happens on secure servers

## 🚧 Troubleshooting

### Common Issues

**Backend not starting**:
- Verify OpenAI API key is set correctly
- Check Python version (3.8+ required)
- Ensure all dependencies are installed

**Frontend can't connect to backend**:
- Verify backend is running on `http://localhost:8000`
- Check `EXPO_PUBLIC_API_URL` environment variable
- Ensure no firewall blocking the connection

**Roadmap generation fails**:
- Verify OpenAI API key has sufficient credits
- Check internet connection for API calls
- Ensure resume text is not empty

### Debug Mode

Enable debug logging:
```bash
# Backend
export DEBUG=true

# Frontend
export EXPO_PUBLIC_DEBUG_MODE=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/devclimb/issues)
- **Documentation**: [Wiki](https://github.com/your-username/devclimb/wiki)
- **Email**: support@devclimb.com

## 🙏 Acknowledgments

- OpenAI for providing powerful language models
- LangChain community for excellent LLM tooling
- React Native and Expo teams for cross-platform capabilities
- All contributors and beta testers

---

**Happy Learning! 🚀**

Transform your career with AI-powered personalized learning roadmaps.