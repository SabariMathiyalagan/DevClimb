import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/Colors';

interface XPBarProps {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  showLabels?: boolean;
  height?: number;
}

export default function XPBar({
  level,
  currentXP,
  xpToNextLevel,
  totalXP,
  showLabels = true,
  height = 12,
}: XPBarProps) {
  const progressPercentage = (currentXP / (currentXP + xpToNextLevel)) * 100;

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.labelsContainer}>
          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>Level</Text>
            <Text style={styles.levelValue}>{level}</Text>
          </View>
          <View style={styles.xpContainer}>
            <Text style={styles.totalXPLabel}>{totalXP.toLocaleString()} Total XP</Text>
          </View>
        </View>
      )}
      
      <View style={[styles.progressBarContainer, { height }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progressPercentage}%`,
              height,
            },
          ]}
        />
        <View style={styles.progressOverlay}>
          <Text style={styles.progressText}>
            {currentXP} / {currentXP + xpToNextLevel} XP
          </Text>
        </View>
      </View>

      {showLabels && (
        <View style={styles.nextLevelContainer}>
          <Text style={styles.nextLevelText}>
            {xpToNextLevel} XP to Level {level + 1}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
    opacity: 0.8,
  },
  levelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'SpaceMono',
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  totalXPLabel: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
  progressBarContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  progressBar: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nextLevelContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  nextLevelText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    fontFamily: 'SpaceMono',
  },
});