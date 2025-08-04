import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/Colors';
import { mockQuests, getQuestsByCategory, Quest } from '@/constants/MockData';
import QuestCard from '@/components/QuestCard';

type FilterType = 'all' | 'active' | 'completed';
type CategoryType = 'all' | 'Frontend' | 'Backend' | 'DevOps' | 'Mobile' | 'Database' | 'Testing';

export default function QuestsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [category, setCategory] = useState<CategoryType>('all');

  const categories: CategoryType[] = ['all', 'Frontend', 'Backend', 'DevOps', 'Mobile', 'Database', 'Testing'];

  const getFilteredQuests = (): Quest[] => {
    let filteredQuests = mockQuests;

    // Filter by completion status
    if (filter === 'active') {
      filteredQuests = filteredQuests.filter(quest => !quest.isCompleted);
    } else if (filter === 'completed') {
      filteredQuests = filteredQuests.filter(quest => quest.isCompleted);
    }

    // Filter by category
    if (category !== 'all') {
      filteredQuests = filteredQuests.filter(quest => quest.category === category);
    }

    return filteredQuests;
  };

  const handleQuestPress = (quest: Quest) => {
    // Navigate to quest detail screen
    router.push(`/quest-detail?questId=${quest.id}`);
  };

  const handleSubmitProject = () => {
    // Navigate to submit project screen
    router.push('/submit-project');
  };

  const filteredQuests = getFilteredQuests();
  const activeQuests = mockQuests.filter(quest => !quest.isCompleted);
  const completedQuests = mockQuests.filter(quest => quest.isCompleted);

  const FilterButton = ({ 
    label, 
    value, 
    isActive, 
    onPress 
  }: {
    label: string;
    value: FilterType;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const CategoryButton = ({ 
    label, 
    value, 
    isActive, 
    onPress 
  }: {
    label: string;
    value: CategoryType;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.categoryButtonText, isActive && styles.categoryButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Your Quests</Text>
            <Text style={styles.subtitle}>
              {activeQuests.length} active • {completedQuests.length} completed
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitProject}
            activeOpacity={0.8}
          >
            <FontAwesome name="upload" size={16} color={colors.text} />
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Status Filter */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <FilterButton
              label="All"
              value="all"
              isActive={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            <FilterButton
              label={`Active (${activeQuests.length})`}
              value="active"
              isActive={filter === 'active'}
              onPress={() => setFilter('active')}
            />
            <FilterButton
              label={`Completed (${completedQuests.length})`}
              value="completed"
              isActive={filter === 'completed'}
              onPress={() => setFilter('completed')}
            />
          </ScrollView>
        </View>

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((cat) => (
              <CategoryButton
                key={cat}
                label={cat === 'all' ? 'All Categories' : cat}
                value={cat}
                isActive={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Quest List */}
        <View style={styles.questsList}>
          {filteredQuests.length > 0 ? (
            filteredQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onPress={() => handleQuestPress(quest)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome name="search" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>No quests found</Text>
              <Text style={styles.emptyDescription}>
                Try adjusting your filters or check back later for new quests.
              </Text>
            </View>
          )}
        </View>

        {/* Stats Footer */}
        {filteredQuests.length > 0 && (
          <View style={styles.statsFooter}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{filteredQuests.reduce((sum, quest) => sum + quest.xpReward, 0)}</Text>
              <Text style={styles.statLabel}>Total XP Available</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(filteredQuests.reduce((sum, quest) => {
                  const hours = parseFloat(quest.estimatedTime.split('-')[0]);
                  return sum + hours;
                }, 0))}h
              </Text>
              <Text style={styles.statLabel}>Estimated Time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{filteredQuests.length}</Text>
              <Text style={styles.statLabel}>Quests Shown</Text>
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 6,
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
    color: colors.text,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  questsList: {
    paddingHorizontal: 24,
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
  statsFooter: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'SpaceMono',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
});