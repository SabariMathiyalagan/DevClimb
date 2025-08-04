# 🧗‍♂️ DevClimb

> **AI-Powered Gamified Roadmaps for Software Developers**

DevClimb transforms your coding journey into an engaging, game-like experience with personalized learning paths, skill trees, and AI-powered guidance. Level up your development skills through quests, earn XP, unlock achievements, and climb the ranks from beginner to expert.



## ✨ Features

### 🎮 **Gamification System**
- **XP & Levels**: Earn experience points and level up as you complete quests
- **Skill Trees**: Visual progression through interconnected skills with unlock requirements  
- **Achievement System**: Unlock badges for streaks, completions, and mastery milestones
- **Daily Streaks**: Build coding habits with streak tracking and rewards

### 🤖 **AI-Powered Learning**
- **Intelligent Coach**: Chat with an AI assistant for personalized guidance
- **Resume Analysis**: Upload your resume for skill assessment and tailored recommendations
- **Smart Quest Matching**: Get quest suggestions based on your current skill level
- **Progress Analytics**: Detailed insights into your learning patterns and growth

### 🎯 **Quest System**
- **Diverse Categories**: Frontend, Backend, DevOps, Mobile, Database, and Testing quests
- **Difficulty Levels**: Beginner, Intermediate, and Advanced challenges
- **Real Projects**: Build actual applications and submit them for AI review
- **Comprehensive Feedback**: Get detailed code reviews and improvement suggestions

### 📊 **Progress Tracking**
- **Visual Analytics**: Charts, graphs, and progress bars to track your journey
- **Streak Calendar**: See your coding activity patterns over time
- **Skill Mastery**: Track progress in individual technologies and concepts
- **Portfolio Building**: Showcase completed projects and earned achievements

## 🛠️ Tech Stack

### **Frontend**
- **React Native** - Cross-platform mobile development
- **Expo** (~50.0) - Development platform and toolchain
- **TypeScript** - Type-safe JavaScript development
- **Expo Router** - File-based navigation system

### **Styling & UI**
- **StyleSheet** - React Native's built-in styling system
- **FontAwesome Icons** - Comprehensive icon library
- **Custom Design System** - Consistent colors, typography, and components
- **Dark Theme** - Modern, eye-friendly interface

### **Navigation & UX**
- **Tab Navigation** - Bottom tabs for main app sections
- **Stack Navigation** - Screen-to-screen navigation flow
- **Modal Presentations** - AI coach chat and overlays
- **Deep Linking** - Direct navigation to specific quests and features

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/devclimb.git
   cd devclimb
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your preferred platform**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your device

## 📱 App Structure

```
DevClimb/
├── app/                        # Main application screens
│   ├── _layout.tsx            # Root navigation layout
│   ├── onboarding/            # User onboarding flow
│   │   ├── welcome.tsx        # Landing screen
│   │   ├── signup.tsx         # User registration
│   │   ├── upload-resume.tsx  # Resume upload
│   │   └── loading.tsx        # AI processing
│   ├── (tabs)/                # Main app with bottom tabs
│   │   ├── _layout.tsx       # Tab navigation
│   │   ├── dashboard.tsx     # Home dashboard
│   │   ├── quests.tsx        # Available quests
│   │   ├── skill-tree.tsx    # Skills visualization
│   │   ├── achievements.tsx  # Badge collection
│   │   └── settings.tsx      # User preferences
│   ├── modal.tsx             # AI Coach chat
│   ├── quest-detail.tsx      # Individual quest view
│   ├── submit-project.tsx    # Project submission
│   ├── project-review.tsx    # AI feedback
│   ├── progress-tracker.tsx  # Analytics dashboard
│   ├── resume-update.tsx     # Resume management
│   └── error.tsx             # Error boundary
├── components/                # Reusable UI components
│   ├── XPBar.tsx             # Experience progress bar
│   ├── QuestCard.tsx         # Quest list item
│   ├── SkillNode.tsx         # Skill tree node
│   ├── Badge.tsx             # Achievement badge
│   ├── ChatBubble.tsx        # Chat message
│   └── ProgressCircle.tsx    # Circular progress
├── constants/                 # App configuration
│   ├── Colors.ts             # Design system colors
│   └── MockData.ts           # Sample data & types
└── assets/                    # Images, fonts, icons
```

## 🎨 Design System

### **Colors**
```typescript
{
  background: "#0A0A0A",      // Primary background
  primary: "#4B7BEC",         // Brand blue
  accent: "#00D1A1",          // Success green
  text: "#F5F5F5",            // Primary text
  cardBackground: "#1C1C1E",  // Card backgrounds
  border: "#2C2C2E",          // Borders & dividers
  success: "#34C759",         // Success states
  warning: "#FF9500",         // Warning states
  error: "#FF3B30"            // Error states
}
```

### **Typography**
- **Headers**: System font, bold weights
- **Body Text**: System font, regular weights
- **Code/Data**: SpaceMono monospace font
- **Sizes**: 12px, 14px, 16px, 18px, 24px, 32px

### **Component Patterns**
- **Cards**: Rounded corners, subtle shadows, consistent padding
- **Buttons**: Primary/secondary variants with hover states
- **Forms**: Floating labels, validation states, clear feedback
- **Navigation**: Tab bars, headers, modal presentations

## 🎯 User Journey

### **1. Onboarding Flow**
1. **Welcome Screen** - App introduction and hero content
2. **Sign Up** - Account creation with form validation
3. **Resume Upload** - AI skill assessment setup
4. **Loading Screen** - AI processing with progress indicators
5. **Dashboard** - Personalized learning dashboard

### **2. Main App Experience**
- **Dashboard**: Overview of progress, recent activity, quick actions
- **Quests**: Browse and filter available learning challenges
- **Skill Tree**: Visual representation of learning progression
- **Achievements**: Collection of earned badges and milestones
- **Settings**: Profile management and app preferences

### **3. Learning Workflow**
1. Browse quests filtered by category and difficulty
2. View detailed quest requirements and learning objectives
3. Start quest and work on real-world projects
4. Submit completed projects for AI review
5. Receive detailed feedback and earn XP
6. Unlock new skills and achievements
7. Track progress through analytics dashboard

## 🔮 Future Enhancements

### **Backend Integration**
- [ ] User authentication and profile management
- [ ] Real AI chat integration (OpenAI, Claude, etc.)
- [ ] Actual resume parsing and skill analysis
- [ ] Project submission and review system
- [ ] Progress tracking and analytics API

### **Advanced Features**
- [ ] Social features (leaderboards, friend connections)
- [ ] Custom quest creation by community
- [ ] Integration with GitHub for automatic progress tracking
- [ ] Push notifications for streaks and new content
- [ ] Offline mode with local data synchronization

### **Platform Expansion**
- [ ] Web version with shared progress
- [ ] Desktop companion app
- [ ] VSCode extension for in-editor guidance
- [ ] Slack/Discord bot integration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test`, `npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Code Style**
- Use TypeScript for all new code
- Follow existing component patterns
- Add proper TypeScript interfaces
- Include meaningful comments for navigation
- Test on both iOS and Android

## 📋 Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser
npm test           # Run test suite
npm run lint       # Run ESLint
npm run build      # Build for production
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development platform
- **React Native Community** - For the robust mobile framework
- **FontAwesome** - For the comprehensive icon library
- **AI Community** - For inspiration on gamified learning approaches

## 📞 Support

- **Email**: support@devclimb.com
- **Discord**: [DevClimb Community](https://discord.gg/devclimb)
- **Documentation**: [docs.devclimb.com](https://docs.devclimb.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/devclimb/issues)

---

**Made with ❤️ by developers, for developers**

*Keep climbing! 🚀*