import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/Colors';
import { mockUser, getCompletedQuests, getActiveQuests, getUnlockedSkills } from '@/constants/MockData';
import XPBar from '@/components/XPBar';

export default function DashboardScreen() {
  const router = useRouter();

  const completedQuests = getCompletedQuests();
  const activeQuests = getActiveQuests();
  const unlockedSkills = getUnlockedSkills();

  const handleViewProgress = () => {
    // Navigate to progress tracker screen
    router.push('/progress-tracker');
  };

  const handleStartQuest = () => {
    // Navigate to quests tab
    router.push('/(tabs)/quests');
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = colors.primary,
    onPress 
  }: {
    title: string;
    value: string | number;
    icon: string;
    color?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={styles.statCard} 
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <FontAwesome name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const QuickActionCard = ({
    title,
    subtitle,
    icon,
    color = colors.primary,
    onPress,
  }: {
    title: string;
    subtitle: string;
    icon: string;
    color?: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <FontAwesome name={icon as any} size={20} color={colors.text} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <FontAwesome name="chevron-right" size={16} color={colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{mockUser.name}!</Text>
          </View>
          <View style={styles.streakContainer}>
            <FontAwesome name="fire" size={20} color={colors.warning} />
            <Text style={styles.streakText}>{mockUser.streak} day streak</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpSection}>
          <XPBar
            level={mockUser.level}
            currentXP={mockUser.currentXP}
            xpToNextLevel={mockUser.xpToNextLevel}
            totalXP={mockUser.totalXP}
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total XP"
              value={mockUser.totalXP.toLocaleString()}
              icon="star"
              color={colors.primary}
            />
            <StatCard
              title="Completed"
              value={completedQuests.length}
              icon="check-circle"
              color={colors.success}
              onPress={() => router.push('/(tabs)/quests')}
            />
            <StatCard
              title="Active Skills"
              value={unlockedSkills.length}
              icon="cogs"
              color={colors.accent}
              onPress={() => router.push('/(tabs)/skill-tree')}
            />
            <StatCard
              title="Current Level"
              value={mockUser.level}
              icon="trophy"
              color={colors.warning}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <QuickActionCard
            title="Talk to AI Coach"
            subtitle="Get personalized guidance and tips"
            icon="comments"
            color={colors.primary}
            onPress={() => router.push('/modal')}
          />
          
          <QuickActionCard
            title="Start a Quest"
            subtitle={`${activeQuests.length} quests available`}
            icon="tasks"
            color={colors.accent}
            onPress={handleStartQuest}
          />
          
          <QuickActionCard
            title="View Progress"
            subtitle="Detailed analytics and insights"
            icon="chart-line"
            color={colors.success}
            onPress={handleViewProgress}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <FontAwesome name="check-circle" size={16} color={colors.success} />
              <Text style={styles.activityTitle}>Quest Completed</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
            <Text style={styles.activityDescription}>
              🎉 Completed "Build a Responsive Landing Page" and earned 100 XP!
            </Text>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <FontAwesome name="trophy" size={16} color={colors.warning} />
              <Text style={styles.activityTitle}>Achievement Unlocked</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
            <Text style={styles.activityDescription}>
              🏆 Earned "Week Warrior" achievement for maintaining a 7-day streak!
            </Text>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <FontAwesome name="arrow-up" size={16} color={colors.primary} />
              <Text style={styles.activityTitle}>Level Up</Text>
              <Text style={styles.activityTime}>3 days ago</Text>
            </View>
            <Text style={styles.activityDescription}>
              🚀 Leveled up to Level {mockUser.level}! Keep up the great work!
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 6,
    fontWeight: '600',
  },
  xpSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
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
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'SpaceMono',
  },
  statTitle: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  activitySection: {
    paddingHorizontal: 24,
  },
  activityCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.5,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    lineHeight: 20,
  },
});