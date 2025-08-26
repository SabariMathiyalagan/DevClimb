import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';

// TypeScript interfaces
interface TaskData {
  id: number;
  title: string;
  description: string;
  position: { x: number; y: number };
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
  icon: keyof typeof IconMap;
  reward: number;
  color: string;
  week: number;
}

interface PathConnection {
  from: number;
  to: number;
}

type TaskStatus = 'completed' | 'unlocked' | 'locked';

// Icon mapping for different task types
const IconMap = {
  Code: 'code' as const,
  Users: 'users' as const,
  Briefcase: 'briefcase' as const,
  Settings: 'cogs' as const,
  Target: 'crosshairs' as const,
  Star: 'star' as const,
  Trophy: 'trophy' as const,
  Award: 'award' as const,
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CareerRoadmapMario: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set([1, 2]));
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const animatedValues = useRef<{ [key: number]: Animated.Value }>({}).current;
  const expandAnimations = useRef<{ [key: number]: Animated.Value }>({}).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Vertical roadmap data with zigzag pattern
  const roadmapData: TaskData[] = [
    {
      id: 1,
      title: "React Basics",
      description: "Master React fundamentals including components, JSX, props, and state management. Learn the core concepts that form the foundation of React development.",
      position: { x: 20, y: 10 },
      difficulty: "Beginner",
      category: "Technical",
      icon: "Code",
      reward: 100,
      color: colors.success,
      week: 1
    },
    {
      id: 2,
      title: "State Management",
      description: "Deep dive into Redux, Context API, and advanced state patterns. Learn how to manage complex application state effectively.",
      position: { x: 80, y: 22 },
      difficulty: "Intermediate",
      category: "Technical",
      icon: "Settings",
      reward: 150,
      color: colors.primary,
      week: 2
    },
    {
      id: 3,
      title: "Build Portfolio",
      description: "Create a stunning portfolio showcasing your skills and projects. Learn design principles and best practices for developer portfolios.",
      position: { x: 20, y: 34 },
      difficulty: "Intermediate",
      category: "Projects",
      icon: "Star",
      reward: 200,
      color: colors.warning,
      week: 3
    },
    {
      id: 4,
      title: "Team Collaboration",
      description: "Master Git workflows, code reviews, and team collaboration tools. Learn how to work effectively in development teams.",
      position: { x: 80, y: 46 },
      difficulty: "Intermediate",
      category: "Soft Skills",
      icon: "Users",
      reward: 120,
      color: colors.accent,
      week: 4
    },
    {
      id: 5,
      title: "Advanced Patterns",
      description: "Learn Higher-Order Components, Render Props, Custom Hooks, and performance optimization techniques for React applications.",
      position: { x: 20, y: 58 },
      difficulty: "Advanced",
      category: "Technical",
      icon: "Code",
      reward: 250,
      color: colors.error,
      week: 6
    },
    {
      id: 6,
      title: "Full Stack Project",
      description: "Build a complete full-stack application with backend integration, databases, and deployment. Showcase end-to-end development skills.",
      position: { x: 80, y: 70 },
      difficulty: "Advanced",
      category: "Projects",
      icon: "Target",
      reward: 300,
      color: colors.primary,
      week: 8
    },
    {
      id: 7,
      title: "System Design",
      description: "Learn scalable architecture patterns, microservices, caching strategies, and how to design systems for high availability.",
      position: { x: 20, y: 82 },
      difficulty: "Advanced",
      category: "Architecture",
      icon: "Settings",
      reward: 280,
      color: colors.warning,
      week: 10
    },
    {
      id: 8,
      title: "Interview Prep",
      description: "Practice coding challenges, system design interviews, and behavioral questions. Prepare for technical interviews at top companies.",
      position: { x: 80, y: 94 },
      difficulty: "Expert",
      category: "Career",
      icon: "Briefcase",
      reward: 350,
      color: colors.accent,
      week: 12
    },
    {
      id: 9,
      title: "Dream Job",
      description: "Land your dream developer position at a top tech company! Apply everything you've learned and start your amazing career journey.",
      position: { x: 50, y: 106 },
      difficulty: "Expert",
      category: "Career",
      icon: "Trophy",
      reward: 500,
      color: "#FFD700",
      week: 13
    }
  ];

  // Path connections between tasks
  const pathConnections: PathConnection[] = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 5, to: 6 },
    { from: 6, to: 7 },
    { from: 7, to: 8 },
    { from: 8, to: 9 }
  ];

  // Initialize animated values - Move this before the component renders
  useEffect(() => {
    roadmapData.forEach((task: TaskData) => {
      if (!animatedValues[task.id]) {
        animatedValues[task.id] = new Animated.Value(1);
      }
      if (!expandAnimations[task.id]) {
        expandAnimations[task.id] = new Animated.Value(0);
      }
    });
  }, []); // Remove dependencies to prevent re-initialization

  const totalRewards: number = Array.from(completedTasks).reduce((sum: number, taskId: number) => {
    const task = roadmapData.find((t: TaskData) => t.id === taskId);
    return sum + (task?.reward || 0);
  }, 0);

  const handleTaskClick = (task: TaskData): void => {
    if (isTaskUnlocked(task.id)) {
      if (expandedTask === task.id) {
        // Collapse if already expanded
        setExpandedTask(null);
        Animated.timing(expandAnimations[task.id], {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else {
        // Collapse previous if any
        if (expandedTask !== null) {
          Animated.timing(expandAnimations[expandedTask], {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
        
        // Expand current
        setExpandedTask(task.id);
        Animated.timing(expandAnimations[task.id], {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const handleCompleteTask = (taskId: number): void => {
    if (!completedTasks.has(taskId)) {
      const newCompleted = new Set(completedTasks);
      newCompleted.add(taskId);
      setCompletedTasks(newCompleted);
      
      // Animate the completion
      Animated.sequence([
        Animated.timing(animatedValues[taskId], {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues[taskId], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Collapse the expanded view
      setExpandedTask(null);
      Animated.timing(expandAnimations[taskId], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const isTaskUnlocked = (taskId: number): boolean => {
    if (taskId === 1) return true;
    const prerequisites = pathConnections.filter((conn: PathConnection) => conn.to === taskId);
    return prerequisites.some((prereq: PathConnection) => completedTasks.has(prereq.from));
  };

  const isTaskCompleted = (taskId: number): boolean => completedTasks.has(taskId);

  const getTaskStatus = (taskId: number): TaskStatus => {
    if (isTaskCompleted(taskId)) return 'completed';
    if (isTaskUnlocked(taskId)) return 'unlocked';
    return 'locked';
  };

  const generatePath = (from: number, to: number): string => {
    const task1 = roadmapData.find((t: TaskData) => t.id === from);
    const task2 = roadmapData.find((t: TaskData) => t.id === to);
    
    if (!task1 || !task2) return '';
    
    const mapWidth = screenWidth - 40;
    const mapHeight = screenHeight * 3;
    
    const x1 = (task1.position.x / 100) * mapWidth;
    const y1 = (task1.position.y / 120) * mapHeight;
    const x2 = (task2.position.x / 100) * mapWidth;
    const y2 = (task2.position.y / 120) * mapHeight;
    
    // Create zigzag path
    const midY = (y1 + y2) / 2;
    
    return `M ${x1} ${y1} Q ${x1} ${midY} ${(x1 + x2) / 2} ${midY} Q ${x2} ${midY} ${x2} ${y2}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleIcon}>🏆</Text>
            <Text style={styles.title}>DevClimb</Text>
          </View>
          
          <View style={styles.xpContainer}>
            <Text style={styles.xpIcon}>⭐</Text>
            <Text style={styles.xpText}>{totalRewards}</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {completedTasks.size}/{roadmapData.length} tasks completed
          </Text>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                { width: `${(completedTasks.size / roadmapData.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Vertical Roadmap */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.verticalScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        decelerationRate="fast"
      >
        <View style={styles.roadmapMap}>
          {/* SVG Background Lines */}
          <Svg style={styles.svgContainer} width="100%" height="100%">
            {/* Main path line */}
            <Path
              d={`M ${(screenWidth - 40) * 0.5} 0 L ${(screenWidth - 40) * 0.5} ${screenHeight * 3}`}
              stroke={colors.border}
              strokeWidth="4"
              fill="none"
              opacity={0.3}
            />
            
            {pathConnections.map((connection: PathConnection, index: number) => {
              const isPathActive = completedTasks.has(connection.from);
              const isNextTaskUnlocked = isTaskUnlocked(connection.to);
              return (
                <Path
                  key={index}
                  d={generatePath(connection.from, connection.to)}
                  stroke={isPathActive ? colors.success : isNextTaskUnlocked ? colors.accent : colors.border}
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={isPathActive ? "0" : isNextTaskUnlocked ? "0" : "8,4"}
                  strokeLinecap="round"
                  opacity={isPathActive ? 1 : isNextTaskUnlocked ? 0.8 : 0.5}
                />
              );
            })}
          </Svg>

          {/* Task Nodes */}
          {roadmapData.map((task: TaskData) => {
            const status: TaskStatus = getTaskStatus(task.id);
            const mapWidth = screenWidth - 40;
            const mapHeight = screenHeight * 3;
            const isExpanded = expandedTask === task.id;
            
            // Ensure animated values exist before using them
            const expandAnimation = expandAnimations[task.id];
            const animatedValue = animatedValues[task.id];
            
            if (!expandAnimation || !animatedValue) {
              // Return a simple version while animations are initializing
              return (
                <View
                  key={task.id}
                  style={[
                    styles.taskContainer,
                    {
                      left: (task.position.x / 100) * mapWidth - 25,
                      top: (task.position.y / 120) * mapHeight - 25,
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.taskNode,
                      {
                        backgroundColor: status === 'completed' ? colors.success : 
                                        status === 'unlocked' ? task.color : colors.border,
                        opacity: status === 'locked' ? 0.6 : 1,
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.taskTouchable}
                      onPress={() => handleTaskClick(task)}
                      disabled={status === 'locked'}
                      activeOpacity={0.7}
                    >
                      {status === 'completed' ? (
                        <FontAwesome5 
                          name="check" 
                          size={18} 
                          color="white" 
                        />
                      ) : status === 'locked' ? (
                        <FontAwesome5 
                          name="lock" 
                          size={16} 
                          color="white" 
                        />
                      ) : (
                        <FontAwesome5 
                          name={IconMap[task.icon]} 
                          size={16} 
                          color="white" 
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }
            
            return (
              <View
                key={task.id}
                style={[
                  styles.taskContainer,
                  {
                    left: (task.position.x / 100) * mapWidth - 25,
                    top: (task.position.y / 120) * mapHeight - 25,
                  }
                ]}
              >
                {/* Small Task Node */}
                <Animated.View
                  style={[
                    styles.taskNode,
                    {
                      backgroundColor: status === 'completed' ? colors.success : 
                                      status === 'unlocked' ? task.color : colors.border,
                      transform: [{ scale: animatedValue }],
                      opacity: status === 'locked' ? 0.6 : 1,
                      shadowColor: status === 'completed' ? colors.success :
                                   status === 'unlocked' ? task.color : colors.border,
                      shadowOpacity: status === 'locked' ? 0.2 : 0.8,
                      shadowRadius: status === 'locked' ? 2 : 8,
                      elevation: status === 'locked' ? 2 : 12,
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.taskTouchable}
                    onPress={() => handleTaskClick(task)}
                    disabled={status === 'locked'}
                    activeOpacity={0.7}
                  >
                    {status === 'completed' ? (
                      <FontAwesome5 
                        name="check" 
                        size={18} 
                        color="white" 
                      />
                    ) : status === 'locked' ? (
                      <FontAwesome5 
                        name="lock" 
                        size={16} 
                        color="white" 
                      />
                    ) : (
                      <FontAwesome5 
                        name={IconMap[task.icon]} 
                        size={16} 
                        color="white" 
                      />
                    )}
                  </TouchableOpacity>
                </Animated.View>

                {/* Expandable Info Box */}
                <Animated.View
                  style={[
                    styles.infoBox,
                    task.position.x > 50 ? styles.infoBoxLeft : styles.infoBoxRight,
                    {
                      borderColor: task.color,
                      opacity: expandAnimation,
                      transform: [
                        {
                          scaleY: expandAnimation
                        },
                        {
                          translateY: expandAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0]
                          })
                        }
                      ]
                    }
                  ]}
                  pointerEvents={isExpanded ? 'auto' : 'none'}
                >
                  <View style={[styles.infoHeader, { backgroundColor: task.color }]}>
                    <Text style={styles.infoTitle}>{task.title}</Text>
                    <TouchableOpacity 
                      onPress={() => handleTaskClick(task)}
                      style={styles.closeInfoButton}
                    >
                      <FontAwesome5 name="times" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.infoContent}>
                    <Text style={styles.infoDescription}>{task.description}</Text>
                    
                    <View style={styles.infoMeta}>
                      <View style={styles.infoMetaRow}>
                        <FontAwesome5 name="signal" size={12} color={colors.text} />
                        <Text style={styles.infoMetaText}>{task.difficulty}</Text>
                      </View>
                      <View style={styles.infoMetaRow}>
                        <FontAwesome5 name="calendar" size={12} color={colors.text} />
                        <Text style={styles.infoMetaText}>Week {task.week}</Text>
                      </View>
                      <View style={styles.infoMetaRow}>
                        <FontAwesome5 name="star" size={12} color="#FFD700" />
                        <Text style={styles.infoMetaText}>+{task.reward} XP</Text>
                      </View>
                    </View>

                    {!isTaskCompleted(task.id) && (
                      <TouchableOpacity
                        style={[styles.completeTaskButton, { backgroundColor: task.color }]}
                        onPress={() => handleCompleteTask(task.id)}
                      >
                        <FontAwesome5 name="play" size={12} color="white" />
                        <Text style={styles.completeTaskButtonText}>Complete Task</Text>
                      </TouchableOpacity>
                    )}

                    {isTaskCompleted(task.id) && (
                      <View style={styles.completedIndicator}>
                        <FontAwesome5 name="check-circle" size={12} color={colors.success} />
                        <Text style={styles.completedIndicatorText}>Completed!</Text>
                      </View>
                    )}
                  </View>

                  {/* Arrow pointing to node */}
                  <View style={[
                    styles.infoArrow,
                    task.position.x > 50 ? styles.infoArrowLeft : styles.infoArrowRight,
                    { borderTopColor: task.color }
                  ]} />
                </Animated.View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  xpContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  xpIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  xpText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressText: {
    color: colors.text,
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  verticalScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  roadmapMap: {
    width: screenWidth - 40,
    height: screenHeight * 3,
    position: 'relative',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  taskContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  taskNode: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  taskTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    position: 'absolute',
    top: -10,
    width: 280,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
    zIndex: 100,
  },
  infoBoxLeft: {
    right: 70,
  },
  infoBoxRight: {
    left: 70,
  },
  infoHeader: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  closeInfoButton: {
    padding: 4,
  },
  infoContent: {
    padding: 16,
  },
  infoDescription: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoMeta: {
    marginBottom: 16,
  },
  infoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoMetaText: {
    color: colors.text,
    fontSize: 12,
    marginLeft: 8,
  },
  completeTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  completeTaskButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: colors.success + '20',
    borderRadius: 8,
  },
  completedIndicatorText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  infoArrow: {
    position: 'absolute',
    top: 25,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
  },
  infoArrowLeft: {
    right: -10,
    borderLeftWidth: 12,
    borderLeftColor: colors.cardBackground,
    borderRightWidth: 0,
  },
  infoArrowRight: {
    left: -10,
    borderRightWidth: 12,
    borderRightColor: colors.cardBackground,
    borderLeftWidth: 0,
  },
});

export default CareerRoadmapMario;