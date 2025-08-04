import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';
import { Quest } from '@/constants/MockData';

interface QuestCardProps {
  quest: Quest;
  onPress: () => void;
}

export default function QuestCard({ quest, onPress }: QuestCardProps) {
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend':
        return 'laptop';
      case 'backend':
        return 'server';
      case 'devops':
        return 'cloud';
      case 'mobile':
        return 'mobile';
      case 'database':
        return 'database';
      case 'testing':
        return 'bug';
      default:
        return 'code';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        quest.isCompleted && styles.completedContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <FontAwesome5 
            name={getCategoryIcon(quest.category) as any} 
            size={16} 
            color={colors.primary} 
          />
          <Text style={styles.category}>{quest.category}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          {quest.isCompleted ? (
            <View style={styles.completedBadge}>
              <FontAwesome5 name="check" size={12} color={colors.text} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          ) : (
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quest.difficulty) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(quest.difficulty) }]}>
                {quest.difficulty}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, quest.isCompleted && styles.completedTitle]}>
          {quest.title}
        </Text>
        <Text style={[styles.description, quest.isCompleted && styles.completedDescription]} numberOfLines={2}>
          {quest.description}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.leftFooter}>
          <View style={styles.xpContainer}>
            <FontAwesome5 name="star" size={14} color={colors.accent} />
            <Text style={styles.xpText}>{quest.xpReward} XP</Text>
          </View>
          
          <View style={styles.timeContainer}>
            <FontAwesome5 name="clock-o" size={14} color={colors.text} />
            <Text style={styles.timeText}>{quest.estimatedTime}</Text>
          </View>
        </View>

        <View style={styles.rightFooter}>
          {quest.prerequisites && quest.prerequisites.length > 0 && (
            <View style={styles.prerequisiteContainer}>
              <FontAwesome5 name="link" size={12} color={colors.border} />
              <Text style={styles.prerequisiteText}>
                {quest.prerequisites.length} prereq{quest.prerequisites.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          
          <FontAwesome5 
            name="chevron-right" 
            size={16} 
            color={quest.isCompleted ? colors.border : colors.primary} 
          />
        </View>
      </View>

      {/* Skills Tags */}
      {quest.skills && quest.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {quest.skills.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillTagText}>{skill}</Text>
            </View>
          ))}
          {quest.skills.length > 3 && (
            <View style={styles.skillTag}>
              <Text style={styles.skillTagText}>+{quest.skills.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      {/* Completion Overlay */}
      {quest.isCompleted && (
        <View style={styles.completionOverlay}>
          <FontAwesome5 name="check-circle" size={24} color={colors.success} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  completedContainer: {
    opacity: 0.7,
    borderColor: colors.success + '30',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    lineHeight: 20,
  },
  completedDescription: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  xpText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'SpaceMono',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
    marginLeft: 4,
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prerequisiteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  prerequisiteText: {
    fontSize: 12,
    color: colors.border,
    marginLeft: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: colors.border + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillTagText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.8,
  },
  completionOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});