import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { colors } from '@/constants/Colors';
import RoadmapDashboard from '@/components/RoadmapDashboard';

const Dashboard: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <RoadmapDashboard />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default Dashboard;