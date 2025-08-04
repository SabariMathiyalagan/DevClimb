import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';
import { Skill } from '@/constants/MockData';

interface SkillNodeProps {
  skill: Skill;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function SkillNode({ skill, onPress, size = 'medium' }: SkillNodeProps) {
  const getNodeSize = () => {
    switch (size) {
      case 'small':
        return 60;
      case 'large':
        return 100;
      default:
        return 80;
    }
  };

  const getProgressPercentage = () => {
    return (skill.xpCurrent / skill.xpRequired) * 100;
  };

  const nodeSize = getNodeSize();
  const progressPercentage = getProgressPercentage();
  const isMaxLevel = skill.level === skill.maxLevel;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: nodeSize + 20,
          height: nodeSize + 40,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!skill.isUnlocked}
    >
      {/* Skill Node Circle */}
      <View
        style={[
          styles.node,
          {
            width: nodeSize,
            height: nodeSize,
            borderRadius: nodeSize / 2,
          },
          skill.isUnlocked ? styles.nodeUnlocked : styles.nodeLocked,
          isMaxLevel && styles.nodeMaxLevel,
        ]}
      >
        {/* Progress Ring for Unlocked Skills */}
        {skill.isUnlocked && !isMaxLevel && (
          <View
            style={[
              styles.progressRing,
              {
                width: nodeSize - 4,
                height: nodeSize - 4,
                borderRadius: (nodeSize - 4) / 2,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: nodeSize - 8,
                  height: nodeSize - 8,
                  borderRadius: (nodeSize - 8) / 2,
                  transform: [{ rotate: `${(progressPercentage / 100) * 360}deg` }],
                },
              ]}
            />
          </View>
        )}

        {/* Skill Icon/Emoji */}
        <View style={styles.iconContainer}>
          {skill.isUnlocked ? (
            <Text style={[styles.skillIcon, { fontSize: nodeSize * 0.3 }]}>
              {skill.icon}
            </Text>
          ) : (
            <FontAwesome5 
              name="lock" 
              size={nodeSize * 0.25} 
              color={colors.border} 
            />
          )}
        </View>

        {/* Level Badge */}
        {skill.isUnlocked && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{skill.level}</Text>
          </View>
        )}

        {/* Max Level Crown */}
        {isMaxLevel && (
          <View style={styles.crownContainer}>
            <FontAwesome5 name="crown" size={12} color={colors.warning} />
          </View>
        )}
      </View>

      {/* Skill Name */}
      <Text
        style={[
          styles.skillName,
          !skill.isUnlocked && styles.skillNameLocked,
          { fontSize: size === 'small' ? 10 : size === 'large' ? 14 : 12 },
        ]}
        numberOfLines={2}
      >
        {skill.name}
      </Text>

      {/* XP Progress (for unlocked skills) */}
      {skill.isUnlocked && size !== 'small' && (
        <Text style={styles.xpText}>
          {isMaxLevel ? 'MAX' : `${skill.xpCurrent}/${skill.xpRequired}`}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 8,
  },
  node: {
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
  },
  nodeUnlocked: {
    borderColor: colors.primary,
  },
  nodeLocked: {
    borderColor: colors.border,
    opacity: 0.5,
  },
  nodeMaxLevel: {
    borderColor: colors.warning,
    backgroundColor: colors.warning + '10',
  },
  progressRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.cardBackground,
    backgroundColor: 'transparent',
  },
  progressFill: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.accent,
    borderTopColor: colors.accent,
    borderRightColor: colors.accent,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    backgroundColor: 'transparent',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  skillIcon: {
    textAlign: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'SpaceMono',
  },
  crownContainer: {
    position: 'absolute',
    top: -8,
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
    padding: 2,
  },
  skillName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  skillNameLocked: {
    color: colors.border,
  },
  xpText: {
    fontSize: 10,
    color: colors.accent,
    fontFamily: 'SpaceMono',
    marginTop: 2,
    textAlign: 'center',
  },
});