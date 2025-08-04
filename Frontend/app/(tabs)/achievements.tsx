import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/Colors';
import { 
  mockAchievements, 
  getAchievementsByCategory, 
  getUnlockedAchievements,
  getLockedAchievements,
  Achievement,
  mockUser
} from '@/constants/MockData';
import Badge from '@/components/Badge';

type FilterType = 'all' | 'unlocked' | 'locked';
type CategoryFilter = 'all' | 'Streak' | 'Completion' | 'Skill Mastery' | 'Special';

export default function AchievementsScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');

  const categories: { key: CategoryFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'th' },
    { key: 'Streak', label: 'Streak', icon: 'fire' },
    { key: 'Completion', label: 'Completion', icon: 'check-circle' },
    { key: 'Skill Mastery', label: 'Mastery', icon: 'graduation-cap' },
    { key: 'Special', label: 'Special', icon: 'star' },
  ];

  const getFilteredAchievements = (): Achievement[] => {
    let filteredAchievements = mockAchievements;

    // Filter by unlock status
    if (filter === 'unlocked') {
      filteredAchievements = getUnlockedAchievements();
    } else if (filter === 'locked') {
      filteredAchievements = getLockedAchievements();
    }

    // Filter by category
    if (category !== 'all') {
      filteredAchievements = filteredAchievements.filter(
        achievement => achievement.category === category
      );
    }

    return filteredAchievements;
  };

  const handleAchievementPress = (achievement: Achievement) => {
    const statusText = achievement.isUnlocked ? 'Unlocked' : 'Locked';
    const unlockDateText = achievement.unlockedDate 
      ? `\nUnlocked: ${new Date(achievement.unlockedDate).toLocaleDateString()}`
      : '';
    
    Alert.alert(
      achievement.name,
      `${achievement.description}\n\nRequirement: ${achievement.requirement}\nStatus: ${statusText}${unlockDateText}`,
      [{ text: 'OK' }]
    );
  };

  const filteredAchievements = getFilteredAchievements();
  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();
  const totalXPFromAchievements = unlockedAchievements.length * 50; // Assume 50 XP per achievement

  const FilterButton = ({ 
    label, 
    value, 
    count,
    isActive, 
    onPress 
  }: {
    label: string;
    value: FilterType;
    count: number;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const CategoryButton = ({ 
    category, 
    isActive, 
    onPress 
  }: {
    category: { key: CategoryFilter; label: string; icon: string };
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <FontAwesome 
        name={category.icon as any} 
        size={14} 
        color={isActive ? colors.text : colors.border} 
      />
      <Text style={[styles.categoryButtonText, isActive && styles.categoryButtonTextActive]}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Achievements</Text>
            <Text style={styles.subtitle}>
              {unlockedAchievements.length}/{mockAchievements.length} unlocked
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalXPFromAchievements}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
          </View>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressOverview}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <Text style={styles.progressPercentage}>
              {Math.round((unlockedAchievements.length / mockAchievements.length) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(unlockedAchievements.length / mockAchievements.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressDescription}>
            Keep completing quests and maintaining streaks to unlock more achievements!
          </Text>
        </View>

        {/* Status Filter */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <FilterButton
              label="All"
              value="all"
              count={mockAchievements.length}
              isActive={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            <FilterButton
              label="Unlocked"
              value="unlocked"
              count={unlockedAchievements.length}
              isActive={filter === 'unlocked'}
              onPress={() => setFilter('unlocked')}
            />
            <FilterButton
              label="Locked"
              value="locked"
              count={lockedAchievements.length}
              isActive={filter === 'locked'}
              onPress={() => setFilter('locked')}
            />
          </ScrollView>
        </View>

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((cat) => (
              <CategoryButton
                key={cat.key}
                category={cat}
                isActive={category === cat.key}
                onPress={() => setCategory(cat.key)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Achievements Grid */}
        <View style={styles.achievementsContainer}>
          {filteredAchievements.length > 0 ? (
            <View style={styles.achievementsGrid}>
              {filteredAchievements.map((achievement) => (
                <Badge
                  key={achievement.id}
                  achievement={achievement}
                  onPress={() => handleAchievementPress(achievement)}
                  size="medium"
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome name="trophy" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>No achievements found</Text>
              <Text style={styles.emptyDescription}>
                Try adjusting your filters or complete more quests to unlock achievements.
              </Text>
            </View>
          )}
        </View>

        {/* Category Stats */}
        {filteredAchievements.length > 0 && (
          <View style={styles.categoryStats}>
            <Text style={styles.categoryStatsTitle}>Category Breakdown</Text>
            <View style={styles.categoryStatsGrid}>
              {categories.slice(1).map((cat) => {
                const categoryAchievements = getAchievementsByCategory(cat.key as Achievement['category']);
                const unlockedInCategory = categoryAchievements.filter(a => a.isUnlocked).length;
                const percentage = categoryAchievements.length > 0 
                  ? Math.round((unlockedInCategory / categoryAchievements.length) * 100)
                  : 0;

                return (
                  <View key={cat.key} style={styles.categoryStatItem}>
                    <View style={styles.categoryStatHeader}>
                      <FontAwesome name={cat.icon as any} size={16} color={colors.primary} />
                      <Text style={styles.categoryStatLabel}>{cat.label}</Text>
                    </View>
                    <Text style={styles.categoryStatValue}>
                      {unlockedInCategory}/{categoryAchievements.length}
                    </Text>
                    <Text style={styles.categoryStatPercentage}>{percentage}%</Text>
                    <View style={styles.categoryProgressBar}>
                      <View 
                        style={[
                          styles.categoryProgressFill, 
                          { width: `${percentage}%` }
                        ]} 
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  statsContainer: {
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accent,
    fontFamily: 'SpaceMono',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
  },
  progressOverview: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'SpaceMono',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border + '30',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressDescription: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    lineHeight: 20,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterButton: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.accent + '20',
    borderColor: colors.accent,
  },
  categoryButtonText: {
    fontSize: 12,
    color: colors.border,
    fontWeight: '500',
    marginLeft: 6,
  },
  categoryButtonTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  achievementsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
  },
  categoryStats: {
    paddingHorizontal: 24,
  },
  categoryStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  categoryStatsGrid: {
    gap: 12,
  },
  categoryStatItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  categoryStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
    fontFamily: 'SpaceMono',
    position: 'absolute',
    right: 16,
    top: 16,
  },
  categoryStatPercentage: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 8,
  },
  categoryProgressBar: {
    height: 4,
    backgroundColor: colors.border + '30',
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
});