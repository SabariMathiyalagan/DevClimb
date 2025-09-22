/**
 * Database-Integrated Roadmap Dashboard Component
 * 
 * Enhanced dashboard that loads data from PostgreSQL database
 * Displays user roadmaps, progress, and current week information
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
  RefreshControl,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';
import { useRoadmapDB } from '@/hooks/useRoadmapDB';
import { roadmapDbUtils } from '@/services/roadmapApi';

const RoadmapDashboard: React.FC = () => {
  const {
    userRoadmaps,
    currentRoadmapId,
    currentProgress,
    isLoadingRoadmaps,
    isLoadingProgress,
    loadUserRoadmaps,
    selectRoadmap,
    loadProgress,
  } = useRoadmapDB();

  const [refreshing, setRefreshing] = useState(false);

  // Load roadmaps on component mount
  useEffect(() => {
    loadUserRoadmaps().catch(console.error);
  }, []);

  // Load progress when roadmap is selected
  useEffect(() => {
    if (currentRoadmapId && !currentProgress) {
      loadProgress(currentRoadmapId).catch(console.error);
    }
  }, [currentRoadmapId, currentProgress]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUserRoadmaps();
      if (currentRoadmapId) {
        await loadProgress(currentRoadmapId);
      }
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle roadmap selection
  const handleSelectRoadmap = async (roadmapId: number) => {
    try {
      await selectRoadmap(roadmapId);
    } catch (error) {
      console.error('Failed to select roadmap:', error);
    }
  };

  // Get current roadmap data
  const currentRoadmap = userRoadmaps.find(rm => rm.roadmap_id === currentRoadmapId);

  // Show loading state
  if (isLoadingRoadmaps && userRoadmaps.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your roadmaps...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no roadmaps
  if (!isLoadingRoadmaps && userRoadmaps.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <FontAwesome5 name="map-marked-alt" size={48} color={colors.border} />
          <Text style={styles.emptyText}>No roadmaps found</Text>
          <Text style={styles.emptySubtext}>Generate your first roadmap to get started!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Learning Journey</Text>
          <Text style={styles.headerSubtitle}>
            {userRoadmaps.length} roadmap{userRoadmaps.length !== 1 ? 's' : ''} in progress
          </Text>
        </View>

        {/* Current Roadmap Progress Card */}
        {currentRoadmap && (
          <View style={styles.currentRoadmapCard}>
            <View style={styles.currentRoadmapHeader}>
              <Text style={styles.currentRoadmapTitle}>
                {roadmapDbUtils.formatTargetRole(currentRoadmap.target_role)}
              </Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>
                  {Math.round(currentRoadmap.progress_percentage)}%
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${currentRoadmap.progress_percentage}%`,
                    backgroundColor: roadmapDbUtils.getProgressColor(currentRoadmap.progress_percentage / 100)
                  }
                ]} 
              />
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <FontAwesome5 name="calendar-week" size={16} color={colors.primary} />
                <Text style={styles.statLabel}>Current Week</Text>
                <Text style={styles.statValue}>{currentRoadmap.current_week}</Text>
              </View>

              <View style={styles.statItem}>
                <FontAwesome5 name="clock" size={16} color={colors.warning} />
                <Text style={styles.statLabel}>Weekly Hours</Text>
                <Text style={styles.statValue}>{currentRoadmap.weekly_hours_target}h</Text>
              </View>

              <View style={styles.statItem}>
                <FontAwesome5 name="calendar-alt" size={16} color={colors.success} />
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{currentRoadmap.duration_weeks}w</Text>
              </View>
            </View>

            {/* Detailed Progress (if available) */}
            {currentProgress && (
              <View style={styles.detailedProgress}>
                <Text style={styles.detailedProgressTitle}>Progress Details</Text>
                <View style={styles.progressDetails}>
                  <View style={styles.progressDetailItem}>
                    <Text style={styles.progressDetailLabel}>Completed Tasks</Text>
                    <Text style={styles.progressDetailValue}>
                      {currentProgress.completed_tasks} / {currentProgress.total_tasks}
                    </Text>
                  </View>
                  <View style={styles.progressDetailItem}>
                    <Text style={styles.progressDetailLabel}>Estimated Completion</Text>
                    <Text style={styles.progressDetailValue}>
                      {roadmapDbUtils.getEstimatedCompletionDate(
                        currentProgress, 
                        currentRoadmap.weekly_hours_target
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* All Roadmaps List */}
        <View style={styles.roadmapsSection}>
          <Text style={styles.sectionTitle}>All Roadmaps</Text>
          
          {userRoadmaps.map((roadmap) => {
            const isSelected = roadmap.roadmap_id === currentRoadmapId;
            
            return (
              <TouchableOpacity
                key={roadmap.roadmap_id}
                style={[
                  styles.roadmapCard,
                  isSelected && styles.selectedRoadmapCard
                ]}
                onPress={() => handleSelectRoadmap(roadmap.roadmap_id)}
                activeOpacity={0.8}
              >
                <View style={styles.roadmapCardHeader}>
                  <View style={styles.roadmapCardTitle}>
                    <Text style={[
                      styles.roadmapTitle,
                      isSelected && styles.selectedRoadmapTitle
                    ]}>
                      {roadmapDbUtils.formatTargetRole(roadmap.target_role)}
                    </Text>
                    <Text style={styles.roadmapDate}>
                      Started {new Date(roadmap.generated_at).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.roadmapProgress}>
                    <Text style={[
                      styles.progressText,
                      { color: roadmapDbUtils.getProgressColor(roadmap.progress_percentage / 100) }
                    ]}>
                      {Math.round(roadmap.progress_percentage)}%
                    </Text>
                  </View>
                </View>

                {/* Mini Progress Bar */}
                <View style={styles.miniProgressContainer}>
                  <View 
                    style={[
                      styles.miniProgressBar, 
                      { 
                        width: `${roadmap.progress_percentage}%`,
                        backgroundColor: roadmapDbUtils.getProgressColor(roadmap.progress_percentage / 100)
                      }
                    ]} 
                  />
                </View>

                {/* Quick Stats */}
                <View style={styles.quickStats}>
                  <Text style={styles.quickStat}>Week {roadmap.current_week}/{roadmap.duration_weeks}</Text>
                  <Text style={styles.quickStat}>•</Text>
                  <Text style={styles.quickStat}>{roadmap.weekly_hours_target}h/week</Text>
                </View>

                {/* Selected Indicator */}
                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <FontAwesome5 name="check-circle" size={16} color={colors.success} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Loading indicator for progress */}
        {isLoadingProgress && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Loading progress...</Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  currentRoadmapCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    margin: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentRoadmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentRoadmapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  progressBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  detailedProgress: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  detailedProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressDetailItem: {
    flex: 1,
  },
  progressDetailLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
  },
  progressDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginTop: 2,
  },
  roadmapsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  roadmapCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  selectedRoadmapCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  roadmapCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roadmapCardTitle: {
    flex: 1,
  },
  roadmapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  selectedRoadmapTitle: {
    color: colors.primary,
  },
  roadmapDate: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  roadmapProgress: {
    marginLeft: 12,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
  },
  miniProgressContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  miniProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickStat: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

export default RoadmapDashboard;
