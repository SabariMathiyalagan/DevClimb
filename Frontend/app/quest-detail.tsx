import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/Colors';
import { mockQuests, Quest } from '@/constants/MockData';

export default function QuestDetailScreen() {
  const router = useRouter();
  const { questId } = useLocalSearchParams<{ questId: string }>();
  
  // Find the quest by ID
  const quest = mockQuests.find(q => q.id === questId);
  
  if (!quest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color={colors.warning} />
          <Text style={styles.errorTitle}>Quest Not Found</Text>
          <Text style={styles.errorDescription}>
            The quest you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getDifficultyColor = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'Beginner':
        return colors.success;
      case 'Intermediate':
        return colors.warning;
      case 'Advanced':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const handleStartQuest = () => {
    if (quest.isCompleted) {
      Alert.alert(
        'Quest Completed',
        'You have already completed this quest! Check out other available quests.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Start Quest',
      `Ready to begin "${quest.title}"? This quest is estimated to take ${quest.estimatedTime}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Quest', 
          onPress: () => {
            // In a real app, this would mark the quest as started
            Alert.alert('Quest Started!', 'Good luck with your coding journey!');
          }
        },
      ]
    );
  };

  const handleSubmitProject = () => {
    // Navigate to submit project screen
    router.push('/submit-project');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <FontAwesome name="laptop" size={16} color={colors.primary} />
            <Text style={styles.categoryText}>{quest.category}</Text>
          </View>
          
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quest.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(quest.difficulty) }]}>
              {quest.difficulty}
            </Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{quest.title}</Text>
          {quest.isCompleted && (
            <View style={styles.completedBadge}>
              <FontAwesome name="check-circle" size={20} color={colors.success} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <FontAwesome name="star" size={16} color={colors.accent} />
            <Text style={styles.statText}>{quest.xpReward} XP</Text>
          </View>
          
          <View style={styles.statItem}>
            <FontAwesome name="clock-o" size={16} color={colors.text} />
            <Text style={styles.statText}>{quest.estimatedTime}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{quest.description}</Text>
        </View>

        {/* Prerequisites */}
        {quest.prerequisites && quest.prerequisites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prerequisites</Text>
            <View style={styles.prerequisitesList}>
              {quest.prerequisites.map((prereq, index) => (
                <View key={index} style={styles.prerequisiteItem}>
                  <FontAwesome name="link" size={14} color={colors.primary} />
                  <Text style={styles.prerequisiteText}>{prereq}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Skills You'll Learn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills You'll Learn</Text>
          <View style={styles.skillsContainer}>
            {quest.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillTagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Learning Objectives (Mock) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Objectives</Text>
          <View style={styles.objectivesList}>
            <View style={styles.objectiveItem}>
              <FontAwesome name="check" size={14} color={colors.success} />
              <Text style={styles.objectiveText}>
                Understand the core concepts and best practices
              </Text>
            </View>
            <View style={styles.objectiveItem}>
              <FontAwesome name="check" size={14} color={colors.success} />
              <Text style={styles.objectiveText}>
                Build a functional project from scratch
              </Text>
            </View>
            <View style={styles.objectiveItem}>
              <FontAwesome name="check" size={14} color={colors.success} />
              <Text style={styles.objectiveText}>
                Apply industry-standard patterns and techniques
              </Text>
            </View>
            <View style={styles.objectiveItem}>
              <FontAwesome name="check" size={14} color={colors.success} />
              <Text style={styles.objectiveText}>
                Debug and optimize your implementation
              </Text>
            </View>
          </View>
        </View>

        {/* Resources (Mock) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Resources</Text>
          <View style={styles.resourcesList}>
            <TouchableOpacity style={styles.resourceItem} activeOpacity={0.8}>
              <FontAwesome name="book" size={16} color={colors.primary} />
              <Text style={styles.resourceText}>Official Documentation</Text>
              <FontAwesome name="external-link" size={12} color={colors.border} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resourceItem} activeOpacity={0.8}>
              <FontAwesome name="video-camera" size={16} color={colors.primary} />
              <Text style={styles.resourceText}>Video Tutorial Series</Text>
              <FontAwesome name="external-link" size={12} color={colors.border} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resourceItem} activeOpacity={0.8}>
              <FontAwesome name="github" size={16} color={colors.primary} />
              <Text style={styles.resourceText}>Example Projects</Text>
              <FontAwesome name="external-link" size={12} color={colors.border} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {quest.isCompleted ? (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitProject}
            activeOpacity={0.8}
          >
            <FontAwesome name="upload" size={16} color={colors.text} />
            <Text style={styles.submitButtonText}>Submit Another Project</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartQuest}
            activeOpacity={0.8}
          >
            <FontAwesome name="play" size={16} color={colors.text} />
            <Text style={styles.startButtonText}>Start Quest</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100, // Space for action buttons
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    lineHeight: 36,
    marginBottom: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 16,
    color: colors.success,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.8,
    lineHeight: 24,
  },
  prerequisitesList: {
    gap: 8,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prerequisiteText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillTagText: {
    fontSize: 14,
    color: colors.text,
  },
  objectivesList: {
    gap: 12,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  objectiveText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  resourcesList: {
    gap: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resourceText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
});