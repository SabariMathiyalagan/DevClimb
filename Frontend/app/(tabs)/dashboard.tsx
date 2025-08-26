import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
//import { LineChart } from 'react-native-chart-kit';
import { colors } from '@/constants/Colors';

// Import your icon components - adjust imports based on your icon library
// For example, using react-native-vector-icons or expo-vector-icons
//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface RankInfo {
  name: string;
  levels: number[];
  color: string;
  icon: string;
}

interface CurrentRank {
  tier: string;
  level: number;
  rr: number;
  totalRr: number;
}

const Dashboard: React.FC = () => {
  const [currentRank] = useState<CurrentRank>({
    tier: 'Gold',
    level: 2,
    rr: 7,
    totalRr: 1247
  });

  const [showAllRanks, setShowAllRanks] = useState<boolean>(false);

  // Sample RR growth data over time
  const rrData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [950, 1020, 980, 1100, 1180, 1220, 1247],
      color: () => colors.accent,
      strokeWidth: 3,
    }]
  };

  const rankSystem: RankInfo[] = [
    { name: 'Bronze', levels: [1, 2, 3], color: '#CD7F32', icon: 'medal' },
    { name: 'Silver', levels: [1, 2, 3], color: '#C0C0C0', icon: 'star' },
    { name: 'Gold', levels: [1, 2, 3], color: '#FFD700', icon: 'trophy' },
    { name: 'Diamond', levels: [1, 2, 3], color: '#B9F2FF', icon: 'crown' },
    { name: 'Infinity', levels: [1, 2, 3], color: '#FF6B6B', icon: 'infinity' }
  ];

  const getCurrentRankInfo = (): RankInfo => {
    const rank = rankSystem.find(r => r.name === currentRank.tier);
    return rank || rankSystem[0];
  };

  const getRankProgress = (): number => {
    return (currentRank.rr / 10) * 100;
  };

  const currentRankInfo = getCurrentRankInfo();

  const chartConfig = {
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    color: () => colors.accent,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: '400',
      fill: colors.text + '80',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
      strokeWidth: 1,
    },
    propsForVerticalLabels: {
      fontSize: 12,
      fontWeight: '400',
      fill: colors.text + '80',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Current Rank Display */}
        <View style={[styles.rankCard, { borderColor: currentRankInfo.color + '30' }]}>
          <View style={styles.rankCardContent}>
            {/* Rank Icon */}
            <View style={[styles.rankIcon, { backgroundColor: currentRankInfo.color }]}>
               {/* <Icon name={currentRankInfo.icon} size={40} color="white" /> */}
            </View>

            {/* Rank Name */}
            <Text style={[styles.rankTitle, { color: currentRankInfo.color }]}>
              {currentRank.tier} {currentRank.level}
            </Text>

            {/* RR Progress */}
            <View style={styles.progressSection}>
              <Text style={styles.progressText}>
                {currentRank.rr}/10 RR to next rank
              </Text>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${getRankProgress()}%`,
                      backgroundColor: currentRankInfo.color 
                    }
                  ]} 
                />
              </View>
            </View>

            {/* Total RR */}
            <Text style={styles.totalRr}>
              Total RR: {currentRank.totalRr}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
              {/* <Icon name="trending-up" size={24} color={colors.success} />   */}
            <Text style={[styles.statValue, { color: colors.success }]}>+67</Text>
            <Text style={styles.statLabel}>RR Today</Text>
          </View>
          
          <View style={styles.statCard}>
            {/* <Icon name="trophy" size={24} color={colors.warning} />     */}
            <Text style={[styles.statValue, { color: colors.warning }]}>12</Text>
            <Text style={styles.statLabel}>Win Streak</Text>
          </View>
        </View>

        {/* RR Growth Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>RR Over Time</Text>
          {/* <LineChart
            data={rrData}
            width={width - 60}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            segments={4}
          /> */}
        </View>

        {/* All Ranks Button */}
        <TouchableOpacity
          style={styles.allRanksButton}
          onPress={() => setShowAllRanks(!showAllRanks)}
          activeOpacity={0.8}
        >
          <Text style={styles.allRanksButtonText}>
            {showAllRanks ? 'Hide' : 'View'} All Ranks
          </Text>
        </TouchableOpacity>

        {/* All Ranks Display */}
        {showAllRanks && (
          <View style={styles.allRanksCard}>
            <Text style={styles.allRanksTitle}>Rank System</Text>
            
            <View style={styles.ranksContainer}>
              {rankSystem.map((rank) => {
                const isCurrentRank = rank.name === currentRank.tier;
                
                return (
                  <View 
                    key={rank.name}
                    style={[
                      styles.rankItem,
                      isCurrentRank && { 
                        backgroundColor: rank.color + '20',
                        borderColor: rank.color,
                        borderWidth: 2
                      }
                    ]}
                  >
                    <View style={[styles.rankItemIcon, { backgroundColor: rank.color }]}>
                      {/* <Icon name={rank.icon} size={20} color="white" /> */}
                    </View>
                    
                    <View style={styles.rankItemContent}>
                      <Text style={[
                        styles.rankItemName,
                        isCurrentRank && { color: rank.color }
                      ]}>
                        {rank.name}
                      </Text>
                      <Text style={styles.rankItemLevels}>
                        Levels: {rank.levels.join(', ')}
                      </Text>
                    </View>
                    
                    {isCurrentRank && (
                      <View style={[styles.currentBadge, { backgroundColor: rank.color + '20' }]}>
                        <Text style={[styles.currentBadgeText, { color: rank.color }]}>
                          Current
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            
            <View style={styles.rankSystemNote}>
              <Text style={styles.rankSystemNoteText}>
                📈 Earn 10 RR to advance to the next level
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    margin: 0,
  },
  rankCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    margin: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  rankCardContent: {
    alignItems: 'center',
    width: '100%',
  },
  rankIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  rankTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  progressSection: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: colors.text + '80',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  totalRr: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text + '80',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    margin: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  allRanksButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  allRanksButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  allRanksCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    margin: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  allRanksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  ranksContainer: {
    gap: 12,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankItemContent: {
    flex: 1,
  },
  rankItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rankItemLevels: {
    fontSize: 12,
    color: colors.text + '80',
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rankSystemNote: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  rankSystemNoteText: {
    fontSize: 14,
    color: colors.text + '80',
  },
});

export default Dashboard;