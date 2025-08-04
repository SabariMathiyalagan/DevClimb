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
import { mockSkills, getSkillsByCategory, Skill } from '@/constants/MockData';
import SkillNode from '@/components/SkillNode';

type CategoryFilter = 'all' | 'Frontend' | 'Backend' | 'Tools' | 'DevOps';

export default function SkillTreeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  const categories: { key: CategoryFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'All Skills', icon: 'th' },
    { key: 'Frontend', label: 'Frontend', icon: 'laptop' },
    { key: 'Backend', label: 'Backend', icon: 'server' },
    { key: 'Tools', label: 'Tools', icon: 'wrench' },
    { key: 'DevOps', label: 'DevOps', icon: 'cloud' },
  ];

  const getFilteredSkills = (): Skill[] => {
    if (selectedCategory === 'all') {
      return mockSkills;
    }
    return getSkillsByCategory(selectedCategory);
  };

  const handleSkillPress = (skill: Skill) => {
    if (!skill.isUnlocked) {
      const prerequisites = skill.prerequisites
        ? skill.prerequisites.map(id => mockSkills.find(s => s.id === id)?.name).join(', ')
        : 'Complete more quests';
        
      Alert.alert(
        'Skill Locked',
        `Unlock "${skill.name}" by completing: ${prerequisites}`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Show skill details
    const isMaxLevel = skill.level === skill.maxLevel;
    const progressText = isMaxLevel 
      ? 'Skill Mastered!' 
      : `${skill.xpCurrent}/${skill.xpRequired} XP to next level`;

    Alert.alert(
      skill.name,
      `Level ${skill.level}/${skill.maxLevel}\n${progressText}\n\nCategory: ${skill.category}`,
      [{ text: 'OK' }]
    );
  };

  const filteredSkills = getFilteredSkills();
  const unlockedSkills = filteredSkills.filter(skill => skill.isUnlocked);
  const lockedSkills = filteredSkills.filter(skill => !skill.isUnlocked);
  const masteredSkills = unlockedSkills.filter(skill => skill.level === skill.maxLevel);

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
        size={16} 
        color={isActive ? colors.text : colors.border} 
      />
      <Text style={[styles.categoryButtonText, isActive && styles.categoryButtonTextActive]}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSkillConnections = (skill: Skill, index: number) => {
    if (!skill.prerequisites || skill.prerequisites.length === 0) return null;

    return skill.prerequisites.map((prereqId, prereqIndex) => {
      const prerequisiteSkill = mockSkills.find(s => s.id === prereqId);
      if (!prerequisiteSkill) return null;

      const prerequisiteIndex = filteredSkills.findIndex(s => s.id === prereqId);
      if (prerequisiteIndex === -1) return null;

      // Simple connection line (in a real app, you'd calculate positions)
      return (
        <View
          key={`${skill.id}-${prereqId}`}
          style={[
            styles.connectionLine,
            {
              // This is a simplified positioning - in a real app you'd calculate actual positions
              opacity: prerequisiteSkill.isUnlocked ? 0.6 : 0.3,
            },
          ]}
        />
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Skill Tree</Text>
            <Text style={styles.subtitle}>
              {unlockedSkills.length}/{filteredSkills.length} skills unlocked
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{masteredSkills.length}</Text>
              <Text style={styles.statLabel}>Mastered</Text>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((category) => (
              <CategoryButton
                key={category.key}
                category={category}
                isActive={selectedCategory === category.key}
                onPress={() => setSelectedCategory(category.key)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressOverview}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(unlockedSkills.length / filteredSkills.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((unlockedSkills.length / filteredSkills.length) * 100)}% Complete
          </Text>
        </View>

        {/* Skills Grid */}
        <View style={styles.skillsContainer}>
          {/* Unlocked Skills Section */}
          {unlockedSkills.length > 0 && (
            <View style={styles.skillsSection}>
              <Text style={styles.sectionTitle}>
                🔓 Unlocked Skills ({unlockedSkills.length})
              </Text>
              <View style={styles.skillsGrid}>
                {unlockedSkills.map((skill, index) => (
                  <View key={skill.id} style={styles.skillNodeContainer}>
                    <SkillNode
                      skill={skill}
                      onPress={() => handleSkillPress(skill)}
                      size="medium"
                    />
                    {renderSkillConnections(skill, index)}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Locked Skills Section */}
          {lockedSkills.length > 0 && (
            <View style={styles.skillsSection}>
              <Text style={styles.sectionTitle}>
                🔒 Locked Skills ({lockedSkills.length})
              </Text>
              <View style={styles.skillsGrid}>
                {lockedSkills.map((skill, index) => (
                  <View key={skill.id} style={styles.skillNodeContainer}>
                    <SkillNode
                      skill={skill}
                      onPress={() => handleSkillPress(skill)}
                      size="medium"
                    />
                    {renderSkillConnections(skill, index)}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Unlocked</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: colors.border }]} />
              <Text style={styles.legendText}>Locked</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendText}>Mastered</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: colors.accent }]} />
              <Text style={styles.legendText}>Progress Ring</Text>
            </View>
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
    color: colors.warning,
    fontFamily: 'SpaceMono',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.border,
    fontWeight: '500',
    marginLeft: 8,
  },
  categoryButtonTextActive: {
    color: colors.text,
    fontWeight: '600',
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
  progressBar: {
    height: 8,
    backgroundColor: colors.border + '30',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  skillsContainer: {
    paddingHorizontal: 24,
  },
  skillsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 8,
  },
  skillNodeContainer: {
    position: 'relative',
  },
  connectionLine: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    top: -10,
    left: '50%',
    marginLeft: -1,
  },
  legend: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '40%',
  },
  legendIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
  },
});