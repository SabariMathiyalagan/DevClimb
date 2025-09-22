import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';
import { useRoadmapDB } from '@/hooks/useRoadmapDB';
import WeekView from '@/components/WeekView';

const TasksScreen: React.FC = () => {
  const { 
    userRoadmaps, 
    currentRoadmapId, 
    currentProgress, 
    loadUserRoadmaps, 
    selectRoadmap,
    isLoadingRoadmaps 
  } = useRoadmapDB();

  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(1);

  // Load roadmaps on mount
  useEffect(() => {
    loadUserRoadmaps().catch(console.error);
  }, []);

  // Auto-select first roadmap and current week
  useEffect(() => {
    if (userRoadmaps.length > 0 && !currentRoadmapId) {
      selectRoadmap(userRoadmaps[0].roadmap_id);
    }
  }, [userRoadmaps, currentRoadmapId]);

  // Set current week when progress loads
  useEffect(() => {
    if (currentProgress && currentProgress.current_week !== selectedWeekIndex) {
      setSelectedWeekIndex(currentProgress.current_week);
    }
  }, [currentProgress]);

  // Show loading state
  if (isLoadingRoadmaps) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no roadmaps
  if (userRoadmaps.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <FontAwesome5 name="tasks" size={48} color={colors.border} />
          <Text style={styles.emptyText}>No tasks available</Text>
          <Text style={styles.emptySubtext}>Generate a roadmap to get your daily tasks!</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentRoadmap = userRoadmaps.find(rm => rm.roadmap_id === currentRoadmapId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🏆</Text>
          <Text style={styles.headerTitle}>Tasks</Text>
        </View>

        {/* Current Roadmap Info */}
        {currentRoadmap && (
          <View style={styles.roadmapInfo}>
            <Text style={styles.roadmapTitle}>{currentRoadmap.target_role}</Text>
            <Text style={styles.roadmapProgress}>
              {Math.round(currentRoadmap.progress_percentage)}% Complete
            </Text>
          </View>
        )}

        {/* Week Navigation */}
        {currentRoadmap && (
          <View style={styles.weekNavigation}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Array.from({ length: currentRoadmap.duration_weeks }, (_, i) => i + 1).map(weekNum => (
                <TouchableOpacity
                  key={weekNum}
                  style={[
                    styles.weekButton,
                    selectedWeekIndex === weekNum && styles.selectedWeekButton
                  ]}
                  onPress={() => setSelectedWeekIndex(weekNum)}
                >
                  <Text style={[
                    styles.weekButtonText,
                    selectedWeekIndex === weekNum && styles.selectedWeekButtonText
                  ]}>
                    Week {weekNum}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Week Details */}
        {currentRoadmapId && (
          <WeekView roadmapId={currentRoadmapId} weekIndex={selectedWeekIndex} />
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
  scrollView: {
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  roadmapInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roadmapTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  roadmapProgress: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  weekNavigation: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginLeft: 16,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedWeekButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  weekButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectedWeekButtonText: {
    color: 'white',
  },
});

export default TasksScreen;