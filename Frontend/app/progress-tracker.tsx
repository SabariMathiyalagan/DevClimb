import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';
import { mockUser, mockQuests, mockSkills, mockAchievements } from '@/constants/MockData';

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function ProgressTrackerScreen() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d');

  const timeRanges: { key: TimeRange; label: string }[] = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: 'all', label: 'All Time' },
  ];

  // Mock analytics data
  const analyticsData = {
    xpGained: {
      '7d': 250,
      '30d': 850,
      '90d': 2100,
      'all': 2450,
    },
    questsCompleted: {
      '7d': 2,
      '30d': 5,
      '90d': 8,
      'all': 10,
    },
    streakData: {
      current: 7,
      longest: 12,
      totalDays: 45,
    },
    skillProgress: mockSkills.filter(skill => skill.isUnlocked),
    recentActivity: [
      { date: '2024-01-28', type: 'quest', description: 'Completed "Build Responsive Landing Page"', xp: 100 },
      { date: '2024-01-27', type: 'streak', description: '7-day coding streak!', xp: 25 },
      { date: '2024-01-26', type: 'skill', description: 'Leveled up JavaScript skill', xp: 50 },
      { date: '2024-01-25', type: 'achievement', description: 'Unlocked "Week Warrior" badge', xp: 75 },
      { date: '2024-01-24', type: 'quest', description: 'Started "React Component Library" quest', xp: 0 },
    ],
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    color = colors.primary 
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: string;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <FontAwesome5 name={icon as any} size={20} color={color} />
        </View>
        {change && (
          <View style={styles.changeIndicator}>
            <FontAwesome5 name="arrow-up" size={12} color={colors.success} />
            <Text style={styles.changeText}>{change}</Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const ProgressBar = ({ 
    label, 
    current, 
    total, 
    color = colors.primary 
  }: {
    label: string;
    current: number;
    total: number;
    color?: string;
  }) => (
    <View style={styles.progressItem}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{current}/{total}</Text>
      </View>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${Math.min((current / total) * 100, 100)}%`,
              backgroundColor: color 
            }
          ]} 
        />
      </View>
    </View>
  );

  const ActivityItem = ({ activity }: { activity: any }) => {
    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'quest': return 'tasks';
        case 'streak': return 'fire';
        case 'skill': return 'star';
        case 'achievement': return 'trophy';
        default: return 'circle';
      }
    };

    const getActivityColor = (type: string) => {
      switch (type) {
        case 'quest': return colors.primary;
        case 'streak': return colors.warning;
        case 'skill': return colors.accent;
        case 'achievement': return colors.success;
        default: return colors.border;
      }
    };

    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
          <FontAwesome5 name={getActivityIcon(activity.type) as any} size={16} color={getActivityColor(activity.type)} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          <Text style={styles.activityDate}>{new Date(activity.date).toLocaleDateString()}</Text>
        </View>
        {activity.xp > 0 && (
          <View style={styles.activityXP}>
            <Text style={styles.activityXPText}>+{activity.xp} XP</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Progress Tracker</Text>
          <Text style={styles.subtitle}>
            Track your coding journey and celebrate your achievements
          </Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeRangeScroll}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.key}
                style={[styles.timeRangeButton, selectedRange === range.key && styles.timeRangeButtonActive]}
                onPress={() => setSelectedRange(range.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.timeRangeText, selectedRange === range.key && styles.timeRangeTextActive]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <StatCard
              title="XP Gained"
              value={analyticsData.xpGained[selectedRange].toLocaleString()}
              change="+15%"
              icon="star"
              color={colors.accent}
            />
            <StatCard
              title="Quests Done"
              value={analyticsData.questsCompleted[selectedRange]}
              change="+2"
              icon="tasks"
              color={colors.primary}
            />
            <StatCard
              title="Current Streak"
              value={`${analyticsData.streakData.current} days`}
              icon="fire"
              color={colors.warning}
            />
            <StatCard
              title="Skills Unlocked"
              value={analyticsData.skillProgress.length}
              icon="graduation-cap"
              color={colors.success}
            />
          </View>
        </View>

        {/* Progress Breakdown */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Current Progress</Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              label="Overall Level Progress"
              current={mockUser.currentXP}
              total={mockUser.currentXP + mockUser.xpToNextLevel}
              color={colors.primary}
            />
            <ProgressBar
              label="Quests Completed"
              current={mockQuests.filter(q => q.isCompleted).length}
              total={mockQuests.length}
              color={colors.success}
            />
            <ProgressBar
              label="Skills Mastered"
              current={mockSkills.filter(s => s.level === s.maxLevel).length}
              total={mockSkills.length}
              color={colors.accent}
            />
            <ProgressBar
              label="Achievements Unlocked"
              current={mockAchievements.filter(a => a.isUnlocked).length}
              total={mockAchievements.length}
              color={colors.warning}
            />
          </View>
        </View>

        {/* Streak Analytics */}
        <View style={styles.streakSection}>
          <Text style={styles.sectionTitle}>Streak Analytics</Text>
          <View style={styles.streakContainer}>
            <View style={styles.streakStats}>
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>{analyticsData.streakData.current}</Text>
                <Text style={styles.streakStatLabel}>Current Streak</Text>
              </View>
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>{analyticsData.streakData.longest}</Text>
                <Text style={styles.streakStatLabel}>Longest Streak</Text>
              </View>
              <View style={styles.streakStat}>
                <Text style={styles.streakStatValue}>{analyticsData.streakData.totalDays}</Text>
                <Text style={styles.streakStatLabel}>Total Active Days</Text>
              </View>
            </View>
            
            {/* Mock streak calendar visualization */}
            <View style={styles.streakCalendar}>
              <Text style={styles.streakCalendarTitle}>Last 30 Days</Text>
              <View style={styles.streakGrid}>
                {Array.from({ length: 30 }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.streakDay,
                      {
                        backgroundColor: i < 7 || (i >= 10 && i < 15) || (i >= 20 && i < 28)
                          ? colors.success
                          : colors.border + '30'
                      }
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {analyticsData.recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    lineHeight: 24,
  },
  timeRangeContainer: {
    marginBottom: 24,
  },
  timeRangeScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  timeRangeButton: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    marginLeft: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'SpaceMono',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
  },
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  progressContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  progressItem: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border + '30',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  streakSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  streakContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.warning,
    fontFamily: 'SpaceMono',
  },
  streakStatLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  streakCalendar: {
    alignItems: 'center',
  },
  streakCalendarTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 12,
  },
  streakGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    maxWidth: 280,
  },
  streakDay: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  activitySection: {
    paddingHorizontal: 24,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
  },
  activityXP: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityXPText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
});