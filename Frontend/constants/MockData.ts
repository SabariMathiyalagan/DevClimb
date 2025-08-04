// Mock Data for DevClimb App

export interface User {
  name: string;
  email: string;
  level: number;
  totalXP: number;
  currentXP: number;
  xpToNextLevel: number;
  joinDate: string;
  streak: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  isCompleted: boolean;
  estimatedTime: string;
  prerequisites?: string[];
  skills: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  maxLevel: number;
  xpRequired: number;
  xpCurrent: number;
  isUnlocked: boolean;
  prerequisites?: string[];
  icon: string;
  color: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  category: 'Streak' | 'Completion' | 'Skill Mastery' | 'Special';
  requirement: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

// Mock User Data
export const mockUser: User = {
  name: "Alex Developer",
  email: "alex@devclimb.com",
  level: 12,
  totalXP: 2450,
  currentXP: 150,
  xpToNextLevel: 200,
  joinDate: "2024-01-15",
  streak: 7,
};

// Mock Quests Data
export const mockQuests: Quest[] = [
  {
    id: "quest-1",
    title: "Build a Responsive Landing Page",
    description: "Create a modern, responsive landing page using HTML, CSS, and JavaScript. Focus on mobile-first design and performance optimization.",
    xpReward: 100,
    difficulty: "Beginner",
    category: "Frontend",
    isCompleted: true,
    estimatedTime: "4-6 hours",
    skills: ["HTML", "CSS", "JavaScript", "Responsive Design"],
  },
  {
    id: "quest-2",
    title: "Create REST API with Authentication",
    description: "Build a secure REST API with user authentication, JWT tokens, and proper error handling using Node.js and Express.",
    xpReward: 200,
    difficulty: "Intermediate",
    category: "Backend",
    isCompleted: false,
    estimatedTime: "8-10 hours",
    prerequisites: ["JavaScript Basics"],
    skills: ["Node.js", "Express", "JWT", "Security"],
  },
  {
    id: "quest-3",
    title: "Deploy App to Cloud Platform",
    description: "Deploy your application to a cloud platform like AWS, Vercel, or Heroku. Set up CI/CD pipeline and monitoring.",
    xpReward: 150,
    difficulty: "Intermediate",
    category: "DevOps",
    isCompleted: false,
    estimatedTime: "6-8 hours",
    skills: ["AWS", "Docker", "CI/CD", "Monitoring"],
  },
  {
    id: "quest-4",
    title: "Implement Unit Testing Suite",
    description: "Write comprehensive unit tests for your application using Jest or similar testing framework. Achieve 80%+ code coverage.",
    xpReward: 120,
    difficulty: "Intermediate",
    category: "Testing",
    isCompleted: false,
    estimatedTime: "5-7 hours",
    skills: ["Jest", "Testing", "Code Coverage"],
  },
  {
    id: "quest-5",
    title: "Build React Component Library",
    description: "Create a reusable component library with TypeScript, Storybook documentation, and npm publishing.",
    xpReward: 250,
    difficulty: "Advanced",
    category: "Frontend",
    isCompleted: false,
    estimatedTime: "12-15 hours",
    prerequisites: ["React Basics", "TypeScript"],
    skills: ["React", "TypeScript", "Storybook", "NPM"],
  },
  {
    id: "quest-6",
    title: "Database Design & Optimization",
    description: "Design and optimize a database schema with proper indexing, relationships, and query optimization techniques.",
    xpReward: 200,
    difficulty: "Advanced",
    category: "Database",
    isCompleted: false,
    estimatedTime: "10-12 hours",
    skills: ["SQL", "Database Design", "Performance", "Indexing"],
  },
  {
    id: "quest-7",
    title: "Mobile App with React Native",
    description: "Build a cross-platform mobile application using React Native with navigation, state management, and device APIs.",
    xpReward: 300,
    difficulty: "Advanced",
    category: "Mobile",
    isCompleted: false,
    estimatedTime: "15-20 hours",
    prerequisites: ["React Basics"],
    skills: ["React Native", "Mobile Development", "State Management"],
  },
  {
    id: "quest-8",
    title: "GraphQL API Implementation",
    description: "Create a GraphQL API with schema design, resolvers, and client integration. Include subscriptions for real-time features.",
    xpReward: 180,
    difficulty: "Advanced",
    category: "Backend",
    isCompleted: false,
    estimatedTime: "8-10 hours",
    skills: ["GraphQL", "Apollo", "Subscriptions", "Schema Design"],
  },
];

// Mock Skills Data
export const mockSkills: Skill[] = [
  {
    id: "skill-html",
    name: "HTML",
    category: "Frontend",
    level: 5,
    maxLevel: 5,
    xpRequired: 100,
    xpCurrent: 100,
    isUnlocked: true,
    icon: "🌐",
    color: "#E34F26",
  },
  {
    id: "skill-css",
    name: "CSS",
    category: "Frontend",
    level: 4,
    maxLevel: 5,
    xpRequired: 120,
    xpCurrent: 95,
    isUnlocked: true,
    icon: "🎨",
    color: "#1572B6",
  },
  {
    id: "skill-javascript",
    name: "JavaScript",
    category: "Frontend",
    level: 4,
    maxLevel: 5,
    xpRequired: 150,
    xpCurrent: 135,
    isUnlocked: true,
    icon: "⚡",
    color: "#F7DF1E",
  },
  {
    id: "skill-react",
    name: "React",
    category: "Frontend",
    level: 3,
    maxLevel: 5,
    xpRequired: 200,
    xpCurrent: 150,
    isUnlocked: true,
    prerequisites: ["skill-javascript"],
    icon: "⚛️",
    color: "#61DAFB",
  },
  {
    id: "skill-typescript",
    name: "TypeScript",
    category: "Frontend",
    level: 2,
    maxLevel: 5,
    xpRequired: 180,
    xpCurrent: 80,
    isUnlocked: true,
    prerequisites: ["skill-javascript"],
    icon: "📘",
    color: "#3178C6",
  },
  {
    id: "skill-nodejs",
    name: "Node.js",
    category: "Backend",
    level: 3,
    maxLevel: 5,
    xpRequired: 180,
    xpCurrent: 120,
    isUnlocked: true,
    prerequisites: ["skill-javascript"],
    icon: "🚀",
    color: "#339933",
  },
  {
    id: "skill-express",
    name: "Express",
    category: "Backend",
    level: 2,
    maxLevel: 5,
    xpRequired: 150,
    xpCurrent: 70,
    isUnlocked: true,
    prerequisites: ["skill-nodejs"],
    icon: "🛣️",
    color: "#000000",
  },
  {
    id: "skill-database",
    name: "Databases",
    category: "Backend",
    level: 2,
    maxLevel: 5,
    xpRequired: 200,
    xpCurrent: 60,
    isUnlocked: true,
    icon: "🗄️",
    color: "#336791",
  },
  {
    id: "skill-api",
    name: "APIs",
    category: "Backend",
    level: 3,
    maxLevel: 5,
    xpRequired: 160,
    xpCurrent: 110,
    isUnlocked: true,
    prerequisites: ["skill-nodejs"],
    icon: "🔌",
    color: "#FF6B35",
  },
  {
    id: "skill-git",
    name: "Git",
    category: "Tools",
    level: 4,
    maxLevel: 5,
    xpRequired: 100,
    xpCurrent: 85,
    isUnlocked: true,
    icon: "📚",
    color: "#F05032",
  },
  {
    id: "skill-docker",
    name: "Docker",
    category: "DevOps",
    level: 1,
    maxLevel: 5,
    xpRequired: 200,
    xpCurrent: 25,
    isUnlocked: false,
    prerequisites: ["skill-nodejs"],
    icon: "🐳",
    color: "#2496ED",
  },
  {
    id: "skill-cloud",
    name: "Cloud Platforms",
    category: "DevOps",
    level: 1,
    maxLevel: 5,
    xpRequired: 250,
    xpCurrent: 15,
    isUnlocked: false,
    prerequisites: ["skill-docker"],
    icon: "☁️",
    color: "#FF9900",
  },
];

// Mock Achievements Data
export const mockAchievements: Achievement[] = [
  {
    id: "achievement-first-quest",
    name: "First Steps",
    description: "Complete your first quest",
    icon: "🎯",
    isUnlocked: true,
    unlockedDate: "2024-01-20",
    category: "Completion",
    requirement: "Complete 1 quest",
  },
  {
    id: "achievement-week-streak",
    name: "Week Warrior",
    description: "Maintain a 7-day coding streak",
    icon: "🔥",
    isUnlocked: true,
    unlockedDate: "2024-01-27",
    category: "Streak",
    requirement: "7-day streak",
  },
  {
    id: "achievement-frontend-master",
    name: "Frontend Master",
    description: "Max out all frontend skills",
    icon: "🎨",
    isUnlocked: false,
    category: "Skill Mastery",
    requirement: "Master HTML, CSS, JavaScript, React",
  },
  {
    id: "achievement-quest-crusher",
    name: "Quest Crusher",
    description: "Complete 10 quests",
    icon: "💪",
    isUnlocked: false,
    category: "Completion",
    requirement: "Complete 10 quests",
  },
  {
    id: "achievement-level-10",
    name: "Double Digits",
    description: "Reach level 10",
    icon: "🔟",
    isUnlocked: true,
    unlockedDate: "2024-02-15",
    category: "Special",
    requirement: "Reach level 10",
  },
  {
    id: "achievement-early-bird",
    name: "Early Bird",
    description: "Complete a quest before 9 AM",
    icon: "🌅",
    isUnlocked: false,
    category: "Special",
    requirement: "Complete quest before 9 AM",
  },
  {
    id: "achievement-night-owl",
    name: "Night Owl",
    description: "Complete a quest after 9 PM",
    icon: "🦉",
    isUnlocked: true,
    unlockedDate: "2024-02-01",
    category: "Special",
    requirement: "Complete quest after 9 PM",
  },
  {
    id: "achievement-backend-explorer",
    name: "Backend Explorer",
    description: "Complete 3 backend quests",
    icon: "🛠️",
    isUnlocked: false,
    category: "Completion",
    requirement: "Complete 3 backend quests",
  },
  {
    id: "achievement-month-streak",
    name: "Monthly Champion",
    description: "Maintain a 30-day coding streak",
    icon: "🏆",
    isUnlocked: false,
    category: "Streak",
    requirement: "30-day streak",
  },
  {
    id: "achievement-skill-collector",
    name: "Skill Collector",
    description: "Unlock 10 different skills",
    icon: "📊",
    isUnlocked: false,
    category: "Skill Mastery",
    requirement: "Unlock 10 skills",
  },
];

// Mock Chat Messages for AI Coach
export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    text: "Hello! I'm your AI coding coach. How can I help you today?",
    isUser: false,
    timestamp: "2024-01-28T10:00:00Z",
  },
  {
    id: "msg-2",
    text: "I'm working on the React quest but struggling with state management",
    isUser: true,
    timestamp: "2024-01-28T10:01:00Z",
  },
  {
    id: "msg-3",
    text: "Great question! State management is a core React concept. I recommend starting with useState for local state, then exploring useContext for sharing state between components. Would you like me to suggest some specific exercises?",
    isUser: false,
    timestamp: "2024-01-28T10:01:30Z",
  },
];

// Helper functions for mock data
export const getCompletedQuests = () => mockQuests.filter(quest => quest.isCompleted);
export const getActiveQuests = () => mockQuests.filter(quest => !quest.isCompleted);
export const getUnlockedAchievements = () => mockAchievements.filter(achievement => achievement.isUnlocked);
export const getLockedAchievements = () => mockAchievements.filter(achievement => !achievement.isUnlocked);
export const getUnlockedSkills = () => mockSkills.filter(skill => skill.isUnlocked);
export const getLockedSkills = () => mockSkills.filter(skill => !skill.isUnlocked);

// Get quests by category
export const getQuestsByCategory = (category: string) => 
  mockQuests.filter(quest => quest.category === category);

// Get skills by category  
export const getSkillsByCategory = (category: string) =>
  mockSkills.filter(skill => skill.category === category);

// Get achievements by category
export const getAchievementsByCategory = (category: Achievement['category']) =>
  mockAchievements.filter(achievement => achievement.category === category);