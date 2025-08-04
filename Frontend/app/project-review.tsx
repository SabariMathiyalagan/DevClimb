import React from 'react';
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

export default function ProjectReviewScreen() {
  const router = useRouter();

  const reviewData = {
    projectName: "Responsive Landing Page",
    submissionDate: "2024-01-28",
    xpAwarded: 100,
    score: 85,
    status: "approved",
    feedback: {
      strengths: [
        "Clean, responsive design that works well across all device sizes",
        "Good use of semantic HTML elements for better accessibility",
        "Efficient CSS with proper use of flexbox and grid layouts",
        "Well-structured code with clear naming conventions"
      ],
      improvements: [
        "Consider adding loading states for better user experience",
        "Some images could be optimized for better performance",
        "Add more interactive elements to engage users"
      ],
      codeQuality: {
        structure: 9,
        readability: 8,
        performance: 7,
        bestPractices: 8
      }
    }
  };

  const handleContinueLearning = () => {
    // Navigate back to quests
    router.push('/(tabs)/quests');
  };

  const handleViewProgress = () => {
    // Navigate to progress tracker
    router.push('/progress-tracker');
  };

  const ScoreBar = ({ label, score }: { label: string; score: number }) => (
    <View style={styles.scoreItem}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{score}/10</Text>
      </View>
      <View style={styles.scoreBar}>
        <View 
          style={[
            styles.scoreFill, 
            { width: `${score * 10}%` }
          ]} 
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <FontAwesome name="check-circle" size={16} color={colors.success} />
            <Text style={styles.statusText}>Approved</Text>
          </View>
          
          <Text style={styles.title}>{reviewData.projectName}</Text>
          <Text style={styles.subtitle}>
            Submitted on {new Date(reviewData.submissionDate).toLocaleDateString()}
          </Text>
        </View>

        {/* Score Overview */}
        <View style={styles.scoreOverview}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{reviewData.score}</Text>
            <Text style={styles.scoreOutOf}>/ 100</Text>
          </View>
          
          <View style={styles.scoreDetails}>
            <View style={styles.scoreDetail}>
              <FontAwesome name="star" size={20} color={colors.accent} />
              <Text style={styles.scoreDetailText}>+{reviewData.xpAwarded} XP Earned</Text>
            </View>
            
            <View style={styles.scoreDetail}>
              <FontAwesome name="trophy" size={20} color={colors.warning} />
              <Text style={styles.scoreDetailText}>Great Work!</Text>
            </View>
          </View>
        </View>

        {/* Code Quality Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Code Quality Assessment</Text>
          <View style={styles.qualityScores}>
            <ScoreBar label="Code Structure" score={reviewData.feedback.codeQuality.structure} />
            <ScoreBar label="Readability" score={reviewData.feedback.codeQuality.readability} />
            <ScoreBar label="Performance" score={reviewData.feedback.codeQuality.performance} />
            <ScoreBar label="Best Practices" score={reviewData.feedback.codeQuality.bestPractices} />
          </View>
        </View>

        {/* Strengths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 What You Did Well</Text>
          <View style={styles.feedbackList}>
            {reviewData.feedback.strengths.map((strength, index) => (
              <View key={index} style={styles.feedbackItem}>
                <FontAwesome name="check" size={14} color={colors.success} />
                <Text style={styles.feedbackText}>{strength}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Areas for Improvement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Areas for Growth</Text>
          <View style={styles.feedbackList}>
            {reviewData.feedback.improvements.map((improvement, index) => (
              <View key={index} style={styles.feedbackItem}>
                <FontAwesome name="lightbulb-o" size={14} color={colors.warning} />
                <Text style={styles.feedbackText}>{improvement}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Coach Message */}
        <View style={styles.coachMessage}>
          <View style={styles.coachHeader}>
            <Text style={styles.coachEmoji}>🤖</Text>
            <Text style={styles.coachTitle}>AI Coach Feedback</Text>
          </View>
          <Text style={styles.coachText}>
            Excellent work on this project! Your code shows strong fundamentals and attention to detail. 
            The responsive design implementation is particularly impressive. Keep focusing on performance 
            optimization and user experience to take your skills to the next level. Ready for your next challenge?
          </Text>
        </View>

        {/* Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Recommended Next Steps</Text>
          <View style={styles.nextStepsList}>
            <TouchableOpacity style={styles.nextStepItem} activeOpacity={0.8}>
              <FontAwesome name="tasks" size={16} color={colors.primary} />
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepTitle}>Try an Intermediate Quest</Text>
                <Text style={styles.nextStepDescription}>Build on your frontend skills</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={colors.border} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.nextStepItem} activeOpacity={0.8}>
              <FontAwesome name="book" size={16} color={colors.accent} />
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepTitle}>Learn Performance Optimization</Text>
                <Text style={styles.nextStepDescription}>Improve your technical skills</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={colors.border} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinueLearning}
          activeOpacity={0.8}
        >
          <FontAwesome name="rocket" size={16} color={colors.text} />
          <Text style={styles.primaryButtonText}>Continue Learning</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleViewProgress}
          activeOpacity={0.8}
        >
          <FontAwesome name="chart-line" size={16} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>View Progress</Text>
        </TouchableOpacity>
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
    paddingBottom: 120, // Space for action buttons
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
  },
  scoreOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 24,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'SpaceMono',
  },
  scoreOutOf: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
  },
  scoreDetails: {
    flex: 1,
    gap: 12,
  },
  scoreDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreDetailText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 12,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  qualityScores: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  scoreItem: {
    marginBottom: 8,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  scoreBar: {
    height: 8,
    backgroundColor: colors.border + '30',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  feedbackList: {
    gap: 12,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
  },
  feedbackText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  coachMessage: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coachEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  coachTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  coachText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    lineHeight: 22,
  },
  nextStepsList: {
    gap: 12,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextStepContent: {
    flex: 1,
    marginLeft: 12,
  },
  nextStepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  nextStepDescription: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
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
    gap: 12,
  },
  primaryButton: {
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
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
});