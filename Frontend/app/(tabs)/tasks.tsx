import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/constants/Colors';

// Icon components (you'll need to install react-native-vector-icons or use your preferred icon library)
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Quest {
  id: number;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  xp: number;
  iconName: string;
  completed?: boolean;
}

interface WeeklyObjective {
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  xp: number;
  iconName: string;
}

const WeeklyQuestCard: React.FC<{
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  xp: number;
  iconName: string;
  completed?: boolean;
}> = ({ title, description, progress, maxProgress, xp, iconName, completed = false }) => {
  const progressPercentage = (progress / maxProgress) * 100;

  return (
    <View style={styles.weeklyQuestCard}>
      <View style={styles.weeklyQuestHeader}>
        <View style={styles.weeklyQuestIcon}>
          <Text style={[styles.weeklyIconText, { color: completed ? colors.success : colors.primary }]}>
            {iconName}
          </Text>
        </View>
        <View style={styles.weeklyQuestContent}>
          <Text style={styles.weeklyQuestTitle}>{title}</Text>
          <Text style={styles.weeklyQuestDescription}>{description}</Text>
          
          <View style={styles.weeklyProgressContainer}>
            <View style={styles.weeklyProgressBar}>
              <View 
                style={[
                  styles.weeklyProgressFill,
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: completed ? colors.success : colors.primary
                  }
                ]} 
              />
            </View>
            <View style={styles.weeklyQuestFooter}>
              <Text style={styles.weeklyProgressText}>
                {progress}/{maxProgress} daily objectives completed
              </Text>
              <View style={styles.weeklyXpContainer}>
                <Text style={styles.weeklyXpText}>+{xp} XP</Text>
                <Text style={[styles.weeklyStatusIcon, { color: completed ? colors.success : colors.border }]}>
                  {completed ? '✓' : '○'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const DailyQuestCard: React.FC<{
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  xp: number;
  iconName: string;
  completed?: boolean;
  onPress?: () => void;
}> = ({ title, description, progress, maxProgress, xp, iconName, completed = false, onPress }) => {
  const progressPercentage = (progress / maxProgress) * 100;

  return (
    <TouchableOpacity style={styles.dailyQuestCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.dailyQuestHeader}>
        <View style={styles.dailyQuestIcon}>
          <Text style={[styles.dailyIconText, { color: completed ? colors.success : colors.primary }]}>
            {iconName}
          </Text>
        </View>
        <View style={styles.dailyQuestContent}>
          <Text style={styles.dailyQuestTitle}>{title}</Text>
          <Text style={styles.dailyQuestDescription}>{description}</Text>
          
          <View style={styles.dailyProgressContainer}>
            <View style={styles.dailyProgressBar}>
              <View 
                style={[
                  styles.dailyProgressFill,
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: completed ? colors.success : colors.primary
                  }
                ]} 
              />
            </View>
            <View style={styles.dailyQuestFooter}>
              <Text style={styles.dailyProgressText}>
                {progress}/{maxProgress} {maxProgress === 1 ? 'completed' : 'tasks'}
              </Text>
              <View style={styles.dailyXpContainer}>
                <Text style={styles.dailyXpText}>+{xp} XP</Text>
                <Text style={[styles.dailyStatusIcon, { color: completed ? colors.success : colors.border }]}>
                  {completed ? '✓' : '○'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const QuestsScreen: React.FC = () => {
  const weeklyObjective: WeeklyObjective = {
    title: "AWS Solutions Architect Associate Certification",
    description: "Complete preparation modules and practice exams to earn your first major cloud certification",
    progress: 3,
    maxProgress: 7,
    xp: 500,
    iconName: "🏆"
  };

  const dailyObjectives: Quest[] = [
    {
      id: 1,
      title: "Study AWS VPC Fundamentals",
      description: "Complete VPC networking module and take practice quiz",
      progress: 1,
      maxProgress: 1,
      xp: 50,
      iconName: "📚",
      completed: true
    },
    {
      id: 2,
      title: "Build EC2 Lab Environment",
      description: "Deploy and configure EC2 instances with security groups",
      progress: 2,
      maxProgress: 3,
      xp: 75,
      iconName: "💻"
    },
    {
      id: 3,
      title: "Practice IAM Policies",
      description: "Create and test custom IAM roles and policies",
      progress: 0,
      maxProgress: 2,
      xp: 60,
      iconName: "🎯"
    },
    {
      id: 4,
      title: "Review S3 Storage Classes",
      description: "Study different S3 storage options and use cases",
      progress: 1,
      maxProgress: 2,
      xp: 40,
      iconName: "📖"
    }
  ];

  const handleQuestPress = (questId?: number) => {
    console.log('Quest pressed:', questId);
    // Navigate to quest details or handle quest interaction
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🏆</Text>
        <Text style={styles.headerTitle}>Quests</Text>
      </View>

      {/* Weekly Objective */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Objective</Text>
        <WeeklyQuestCard
          title={weeklyObjective.title}
          description={weeklyObjective.description}
          progress={weeklyObjective.progress}
          maxProgress={weeklyObjective.maxProgress}
          xp={weeklyObjective.xp}
          iconName={weeklyObjective.iconName}
        />
      </View>

      {/* Daily Objectives */}
      <View style={styles.section}>
        <Text style={styles.sectionSubtitle}>Daily Objectives</Text>
        {dailyObjectives.map((objective) => (
          <DailyQuestCard
            key={objective.id}
            title={objective.title}
            description={objective.description}
            progress={objective.progress}
            maxProgress={objective.maxProgress}
            xp={objective.xp}
            iconName={objective.iconName}
            completed={objective.completed}
            onPress={() => handleQuestPress(objective.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    opacity: 0.8,
    marginBottom: 16,
  },
  // Weekly Quest Card Styles
  weeklyQuestCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  weeklyQuestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  weeklyQuestIcon: {
    marginRight: 16,
    paddingTop: 4,
  },
  weeklyIconText: {
    fontSize: 32,
  },
  weeklyQuestContent: {
    flex: 1,
  },
  weeklyQuestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 28,
  },
  weeklyQuestDescription: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.8,
    marginBottom: 20,
    lineHeight: 24,
  },
  weeklyProgressContainer: {
    gap: 12,
  },
  weeklyProgressBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  weeklyProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  weeklyQuestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyProgressText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    fontWeight: '500',
  },
  weeklyXpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weeklyXpText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
  },
  weeklyStatusIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Daily Quest Card Styles
  dailyQuestCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dailyQuestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dailyQuestIcon: {
    marginRight: 10,
    paddingTop: 1,
  },
  dailyIconText: {
    fontSize: 16,
  },
  dailyQuestContent: {
    flex: 1,
  },
  dailyQuestTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 3,
  },
  dailyQuestDescription: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 10,
    lineHeight: 16,
  },
  dailyProgressContainer: {
    gap: 6,
  },
  dailyProgressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  dailyProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  dailyQuestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyProgressText: {
    fontSize: 11,
    color: colors.text,
    opacity: 0.6,
  },
  dailyXpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dailyXpText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  dailyStatusIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default QuestsScreen;