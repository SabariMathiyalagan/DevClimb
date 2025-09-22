/**
 * Database-Integrated Week View Component
 * 
 * Displays week details with real task completion tracking
 * Optimistic UI for instant task completion feedback
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';
import { useRoadmapDB } from '@/hooks/useRoadmapDB';
import { roadmapDbUtils, DailyTaskDB } from '@/services/roadmapApi';

interface WeekViewProps {
  roadmapId: number;
  weekIndex: number;
}

const WeekView: React.FC<WeekViewProps> = ({ roadmapId, weekIndex }) => {
  const {
    currentWeek,
    isLoadingWeek,
    loadWeekDetails,
    markTaskComplete,
  } = useRoadmapDB();

  const [completingTasks, setCompletingTasks] = useState<Set<number>>(new Set());

  // Load week details on component mount or when props change
  useEffect(() => {
    loadWeekDetails(roadmapId, weekIndex).catch(console.error);
  }, [roadmapId, weekIndex]);

  // Handle task completion
  const handleTaskComplete = async (task: DailyTaskDB) => {
    const newCompletedState = !task.completed;
    
    // Add to completing set for loading state
    setCompletingTasks(prev => new Set(prev).add(task.task_id));

    try {
      await markTaskComplete(task.task_id, newCompletedState);
    } catch (error) {
      console.error('Failed to mark task complete:', error);
      Alert.alert(
        'Error', 
        'Failed to update task completion. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      // Remove from completing set
      setCompletingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.task_id);
        return newSet;
      });
    }
  };

  // Group tasks by day
  const groupTasksByDay = (tasks: DailyTaskDB[]) => {
    const grouped: { [day: number]: DailyTaskDB[] } = {};
    tasks.forEach(task => {
      if (!grouped[task.day_number]) {
        grouped[task.day_number] = [];
      }
      grouped[task.day_number].push(task);
    });
    return grouped;
  };

  // Show loading state
  if (isLoadingWeek || !currentWeek) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading week details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const groupedTasks = groupTasksByDay(currentWeek.daily_tasks);
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Week Header */}
        <View style={styles.weekHeader}>
          <View style={styles.weekTitleContainer}>
            <Text style={styles.weekNumber}>Week {currentWeek.week_index}</Text>
            <Text style={styles.weekTheme}>{currentWeek.theme}</Text>
          </View>
          
          <View style={styles.completionBadge}>
            <Text style={styles.completionText}>
              {Math.round(currentWeek.completion_rate * 100)}%
            </Text>
          </View>
        </View>

        {/* Skills Focus */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Skills Focus</Text>
          <View style={styles.skillsContainer}>
            {currentWeek.skills_focus.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Task */}
        <View style={styles.weeklyTaskSection}>
          <Text style={styles.sectionTitle}>Weekly Objective</Text>
          <Text style={styles.weeklyTaskText}>{currentWeek.weekly_task}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Week Progress</Text>
            <Text style={styles.progressPercentage}>
              {Math.round(currentWeek.completion_rate * 100)}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${currentWeek.completion_rate * 100}%`,
                  backgroundColor: roadmapDbUtils.getProgressColor(currentWeek.completion_rate)
                }
              ]} 
            />
          </View>
          <Text style={styles.progressSubtext}>
            {currentWeek.daily_tasks.filter(task => task.completed).length} of {currentWeek.daily_tasks.length} tasks completed
          </Text>
        </View>

        {/* Daily Tasks */}
        <View style={styles.dailyTasksSection}>
          <Text style={styles.sectionTitle}>Daily Tasks</Text>
          
          {Object.keys(groupedTasks)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(dayNumber => {
              const dayIndex = parseInt(dayNumber) - 1;
              const dayName = dayNames[dayIndex] || `Day ${dayNumber}`;
              const dayTasks = groupedTasks[parseInt(dayNumber)];
              const completedTasks = dayTasks.filter(task => task.completed).length;
              
              return (
                <View key={dayNumber} style={styles.dayContainer}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayName}>{dayName}</Text>
                    <View style={styles.dayProgress}>
                      <Text style={styles.dayProgressText}>
                        {completedTasks}/{dayTasks.length}
                      </Text>
                      {completedTasks === dayTasks.length && (
                        <FontAwesome5 name="check-circle" size={16} color={colors.success} />
                      )}
                    </View>
                  </View>

                  {dayTasks.map(task => {
                    const isCompleting = completingTasks.has(task.task_id);
                    
                    return (
                      <TouchableOpacity
                        key={task.task_id}
                        style={[
                          styles.taskItem,
                          task.completed && styles.completedTask
                        ]}
                        onPress={() => handleTaskComplete(task)}
                        activeOpacity={0.7}
                        disabled={isCompleting}
                      >
                        <View style={styles.taskContent}>
                          <View style={[
                            styles.taskCheckbox,
                            task.completed && styles.completedCheckbox
                          ]}>
                            {isCompleting ? (
                              <ActivityIndicator size="small" color={colors.primary} />
                            ) : task.completed ? (
                              <FontAwesome5 name="check" size={12} color="white" />
                            ) : null}
                          </View>
                          
                          <View style={styles.taskTextContainer}>
                            <Text style={[
                              styles.taskText,
                              task.completed && styles.completedTaskText
                            ]}>
                              {task.task_description}
                            </Text>
                            
                            <Text style={styles.taskDate}>
                              {roadmapDbUtils.formatDate(task.date)}
                            </Text>
                          </View>
                        </View>

                        {/* Task completion indicator */}
                        {task.completed && (
                          <View style={styles.completedIndicator}>
                            <FontAwesome5 name="check-circle" size={16} color={colors.success} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
        </View>

        {/* Next Steps */}
        {currentWeek.completion_rate < 1 && (
          <View style={styles.nextStepsSection}>
            <Text style={styles.sectionTitle}>Next Steps</Text>
            {(() => {
              const nextTask = roadmapDbUtils.getNextTask(currentWeek);
              return nextTask ? (
                <View style={styles.nextTaskCard}>
                  <FontAwesome5 name="arrow-right" size={16} color={colors.primary} />
                  <Text style={styles.nextTaskText}>{nextTask.task_description}</Text>
                </View>
              ) : (
                <Text style={styles.allTasksCompleted}>
                  🎉 All tasks completed for this week!
                </Text>
              );
            })()}
          </View>
        )}

        {/* Week completed celebration */}
        {currentWeek.completion_rate === 1 && (
          <View style={styles.celebrationCard}>
            <FontAwesome5 name="trophy" size={32} color={colors.warning} />
            <Text style={styles.celebrationTitle}>Week Completed! 🎉</Text>
            <Text style={styles.celebrationText}>
              Great job completing all tasks for Week {currentWeek.week_index}!
            </Text>
          </View>
        )}
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
  scrollView: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekTitleContainer: {
    flex: 1,
  },
  weekNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  weekTheme: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.8,
    marginTop: 4,
  },
  completionBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  skillsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  weeklyTaskSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weeklyTaskText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  progressSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  dailyTasksSection: {
    padding: 20,
  },
  dayContainer: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dayProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayProgressText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  taskItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completedTask: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success + '30',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  completedCheckbox: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  taskDate: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.5,
    marginTop: 4,
  },
  completedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  nextStepsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  nextTaskText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  allTasksCompleted: {
    fontSize: 16,
    color: colors.success,
    textAlign: 'center',
    fontWeight: '500',
  },
  celebrationCard: {
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    borderRadius: 16,
    padding: 24,
    margin: 20,
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  celebrationText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
});

export default WeekView;
