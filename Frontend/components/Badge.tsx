import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';
import { Achievement } from '@/constants/MockData';

interface BadgeProps {
  achievement: Achievement;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function Badge({ achievement, onPress, size = 'medium' }: BadgeProps) {
  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return 60;
      case 'large':
        return 100;
      default:
        return 80;
    }
  };

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'Streak':
        return colors.warning;
      case 'Completion':
        return colors.success;
      case 'Skill Mastery':
        return colors.primary;
      case 'Special':
        return colors.accent;
      default:
        return colors.border;
    }
  };

  const badgeSize = getBadgeSize();
  const categoryColor = getCategoryColor(achievement.category);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: badgeSize + 20,
          height: badgeSize + 60,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Badge Circle */}
      <View
        style={[
          styles.badge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
          },
          achievement.isUnlocked ? styles.badgeUnlocked : styles.badgeLocked,
          achievement.isUnlocked && { borderColor: categoryColor },
        ]}
      >
        {/* Badge Icon/Emoji */}
        <View style={styles.iconContainer}>
          {achievement.isUnlocked ? (
            <Text style={[styles.badgeIcon, { fontSize: badgeSize * 0.4 }]}>
              {achievement.icon}
            </Text>
          ) : (
            <FontAwesome5 
              name="lock" 
              size={badgeSize * 0.3} 
              color={colors.border} 
            />
          )}
        </View>

        {/* Unlock Date Badge */}
        {achievement.isUnlocked && achievement.unlockedDate && size !== 'small' && (
          <View style={styles.dateBadge}>
            <FontAwesome5 name="calendar" size={8} color={colors.text} />
          </View>
        )}

        {/* Glow Effect for Unlocked Achievements */}
        {achievement.isUnlocked && (
          <View
            style={[
              styles.glowEffect,
              {
                width: badgeSize + 8,
                height: badgeSize + 8,
                borderRadius: (badgeSize + 8) / 2,
                shadowColor: categoryColor,
              },
            ]}
          />
        )}
      </View>

      {/* Badge Name */}
      <Text
        style={[
          styles.badgeName,
          !achievement.isUnlocked && styles.badgeNameLocked,
          { fontSize: size === 'small' ? 10 : size === 'large' ? 14 : 12 },
        ]}
        numberOfLines={2}
      >
        {achievement.name}
      </Text>

      {/* Category Indicator */}
      {size !== 'small' && (
        <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{achievement.category}</Text>
        </View>
      )}

      {/* "NEW" indicator for recently unlocked achievements */}
      {achievement.isUnlocked && achievement.unlockedDate && (
        (() => {
          const unlockedDate = new Date(achievement.unlockedDate);
          const daysDiff = Math.floor((Date.now() - unlockedDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7 ? (
            <View style={styles.newBadge}>
              <Text style={styles.newText}>NEW</Text>
            </View>
          ) : null;
        })()
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 8,
    position: 'relative',
  },
  badge: {
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 3,
  },
  badgeUnlocked: {
    borderColor: colors.success,
  },
  badgeLocked: {
    borderColor: colors.border,
    opacity: 0.5,
  },
  glowEffect: {
    position: 'absolute',
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: -1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  badgeIcon: {
    textAlign: 'center',
  },
  dateBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.accent,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  badgeNameLocked: {
    color: colors.border,
  },
  categoryIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 8,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    zIndex: 10,
  },
  newText: {
    fontSize: 8,
    color: colors.text,
    fontWeight: 'bold',
  },
});