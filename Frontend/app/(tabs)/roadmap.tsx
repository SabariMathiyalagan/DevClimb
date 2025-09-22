import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Animated,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';
import { useRoadmapDB } from '@/hooks/useRoadmapDB';

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
  completed: boolean;
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
  const { 
    userRoadmaps, 
    currentRoadmapId, 
    currentProgress,
    loadUserRoadmaps, 
    selectRoadmap,
    markTaskComplete,
    isLoadingRoadmaps 
  } = useRoadmapDB();
  
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [roadmapWeeks, setRoadmapWeeks] = useState<any[]>([]);
  const [completedWeeks, setCompletedWeeks] = useState<Set<number>>(new Set());
  const animatedValues = useRef<{ [key: number]: Animated.Value }>({}).current;
  const expandAnimations = useRef<{ [key: number]: Animated.Value }>({}).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // All hooks must be called before any conditional returns
  
  // Load roadmaps on mount
  useEffect(() => {
    loadUserRoadmaps().catch(console.error);
  }, []);

  // Auto-select first roadmap
  useEffect(() => {
    if (userRoadmaps.length > 0 && !currentRoadmapId) {
      selectRoadmap(userRoadmaps[0].roadmap_id);
    }
  }, [userRoadmaps, currentRoadmapId]);

  // Load week data for visualization (simplified approach)
  useEffect(() => {
    if (currentRoadmapId && userRoadmaps.length > 0) {
      const currentRoadmap = userRoadmaps.find(rm => rm.roadmap_id === currentRoadmapId);
      if (currentRoadmap) {
        // Create mock weeks based on duration for visualization
        const weeks = Array.from({ length: currentRoadmap.duration_weeks }, (_, i) => ({
          week_index: i + 1,
          theme: `Week ${i + 1}`,
          weekly_task: `Learning objectives for week ${i + 1}`,
          skills_focus: ['General'],
          completed_percentage: Math.random() * 100 // Mock completion
        }));
        setRoadmapWeeks(weeks);
        
        // Mock some completed weeks based on progress
        const completedCount = Math.floor((currentRoadmap.progress_percentage / 100) * weeks.length);
        const completed = new Set(Array.from({ length: completedCount }, (_, i) => i + 1));
        setCompletedWeeks(completed);
      }
    }
  }, [currentRoadmapId, userRoadmaps]);

  // Auto-scroll to bottom on component mount to show current week
  useEffect(() => {
    if (scrollViewRef.current && roadmapWeeks.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [roadmapWeeks.length]);

  // Convert weeks to TaskData format (reversed order - start from bottom)
  const roadmapTasks: TaskData[] = roadmapWeeks
    .slice()
    .reverse()
    .map((week, index) => ({
      id: week.week_index,
      title: week.theme,
      description: week.weekly_task,
      position: { 
        x: index % 2 === 0 ? 20 : 80, 
        y: 10 + (index * 12) 
      },
      difficulty: week.week_index <= 4 ? 'Beginner' : 
                  week.week_index <= 8 ? 'Intermediate' : 
                  week.week_index <= 10 ? 'Advanced' : 'Expert',
      category: week.skills_focus.length > 0 ? week.skills_focus[0] : 'General',
      icon: getIconForWeek(week.week_index),
      reward: 50 + (week.week_index * 20),
      color: getColorForWeek(week.week_index),
      week: week.week_index,
      completed: completedWeeks.has(week.week_index)
    }));

  // Helper functions for dynamic styling
  function getIconForWeek(weekIndex: number): keyof typeof IconMap {
    const icons: (keyof typeof IconMap)[] = ['Code', 'Settings', 'Star', 'Users', 'Code', 'Target', 'Settings', 'Briefcase', 'Trophy'];
    return icons[(weekIndex - 1) % icons.length] || 'Code';
  }

  function getColorForWeek(weekIndex: number): string {
    const colorPalette = [colors.success, colors.primary, colors.warning, colors.accent, colors.error];
    return colorPalette[(weekIndex - 1) % colorPalette.length] || colors.primary;
  }

  // Path connections between tasks (dynamic based on roadmap length)
  const pathConnections: PathConnection[] = roadmapTasks.length > 1 
    ? roadmapTasks.slice(0, -1).map((task, index) => ({ 
        from: task.id, 
        to: roadmapTasks[index + 1].id 
      }))
    : [];

  // Initialize animated values for all tasks
  roadmapTasks.forEach((task: TaskData) => {
    if (!animatedValues[task.id]) {
      animatedValues[task.id] = new Animated.Value(1);
    }
    if (!expandAnimations[task.id]) {
      expandAnimations[task.id] = new Animated.Value(0);
    }
  });

  const totalRewards: number = roadmapTasks
    .filter(task => task.completed)
    .reduce((sum: number, task: TaskData) => sum + task.reward, 0);

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

  const handleCompleteTask = async (taskId: number): Promise<void> => {
    if (!completedWeeks.has(taskId)) {
      // Optimistic update
      const newCompleted = new Set(completedWeeks);
      newCompleted.add(taskId);
      setCompletedWeeks(newCompleted);
      
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

      // Note: In a real implementation, you would call the API here
      // For now, this is just visual feedback
      console.log(`Week ${taskId} marked as completed`);
    }
  };

  const isTaskUnlocked = (taskId: number): boolean => {
    // All tasks are unlocked for viewing
    return true;
  };

  const isTaskCompleted = (taskId: number): boolean => completedWeeks.has(taskId);

  const getTaskStatus = (taskId: number): TaskStatus => {
    if (isTaskCompleted(taskId)) return 'completed';
    if (isTaskUnlocked(taskId)) return 'unlocked';
    return 'locked';
  };

  const generatePath = (from: number, to: number): string => {
    const task1 = roadmapTasks.find((t: TaskData) => t.id === from);
    const task2 = roadmapTasks.find((t: TaskData) => t.id === to);
    
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

  // Show loading state
  if (isLoadingRoadmaps) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your roadmap...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no roadmap data
  if (userRoadmaps.length === 0 || roadmapTasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <FontAwesome5 name="map" size={48} color={colors.border} />
          <Text style={styles.emptyText}>No roadmap available</Text>
          <Text style={styles.emptySubtext}>Generate a roadmap to get started!</Text>
        </View>
      </SafeAreaView>
    );
  }


  const currentRoadmap = userRoadmaps.find(rm => rm.roadmap_id === currentRoadmapId);

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
            {currentRoadmap?.target_role} - {Math.round(currentRoadmap?.progress_percentage || 0)}% Complete
          </Text>
          <Text style={styles.progressSubtext}>
            {completedWeeks.size}/{roadmapTasks.length} weeks completed
          </Text>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                { width: `${roadmapTasks.length > 0 ? (completedWeeks.size / roadmapTasks.length) * 100 : 0}%` }
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
            {pathConnections.map((connection: PathConnection, index: number) => {
              const isPathActive = completedWeeks.has(connection.from);
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
          {roadmapTasks.map((task: TaskData) => {
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
                        <Text style={styles.completeTaskButtonText}>Complete Week</Text>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    textAlign: 'center',
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  progressSubtext: {
    color: colors.text,
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'center',
    opacity: 0.7,
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