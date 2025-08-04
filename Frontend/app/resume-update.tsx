import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/Colors';

export default function ResumeUpdateScreen() {
  const router = useRouter();

  const handleUploadNewResume = () => {
    Alert.alert(
      'Upload New Resume',
      'This will replace your current resume and re-analyze your skills. Your progress will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upload New Resume', 
          onPress: () => {
            // Navigate to upload resume screen
            router.push('/onboarding/upload-resume');
          }
        },
      ]
    );
  };

  const handleViewCurrentResume = () => {
    Alert.alert(
      'Current Resume',
      'Your resume was uploaded on January 15, 2024 and contains information about your experience in JavaScript, React, Node.js, and database management.',
      [{ text: 'OK' }]
    );
  };

  const handleRequestReanalysis = () => {
    Alert.alert(
      'Reanalyze Skills',
      'Our AI will review your current resume and update your skill recommendations based on the latest industry trends.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Reanalysis', 
          onPress: () => {
            Alert.alert('Analysis Started', 'Your skills are being reanalyzed. This may take a few minutes.');
          }
        },
      ]
    );
  };

  const resumeData = {
    uploadDate: 'January 15, 2024',
    fileName: 'alex_developer_resume.pdf',
    size: '1.2 MB',
    analyzedSkills: [
      'JavaScript (Advanced)',
      'React (Intermediate)', 
      'Node.js (Intermediate)',
      'HTML/CSS (Advanced)',
      'Git (Intermediate)',
      'SQL (Beginner)',
    ],
    lastAnalysis: 'January 15, 2024',
    status: 'Active',
  };

  const SkillItem = ({ skill }: { skill: string }) => {
    const [skillName, level] = skill.split(' (');
    const cleanLevel = level?.replace(')', '') || '';
    
    const getLevelColor = (level: string) => {
      switch (level.toLowerCase()) {
        case 'advanced':
          return colors.success;
        case 'intermediate':
          return colors.warning;
        case 'beginner':
          return colors.error;
        default:
          return colors.primary;
      }
    };

    return (
      <View style={styles.skillItem}>
        <Text style={styles.skillName}>{skillName}</Text>
        <View style={[styles.skillLevel, { backgroundColor: getLevelColor(cleanLevel) + '20' }]}>
          <Text style={[styles.skillLevelText, { color: getLevelColor(cleanLevel) }]}>
            {cleanLevel}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Resume Management</Text>
          <Text style={styles.subtitle}>
            Keep your skills assessment up to date for better quest recommendations
          </Text>
        </View>

        {/* Current Resume Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <FontAwesome name="file-text" size={24} color={colors.primary} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Current Resume</Text>
              <View style={styles.statusBadge}>
                <FontAwesome name="check-circle" size={12} color={colors.success} />
                <Text style={styles.statusText}>{resumeData.status}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.resumeDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>File Name:</Text>
              <Text style={styles.detailValue}>{resumeData.fileName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Uploaded:</Text>
              <Text style={styles.detailValue}>{resumeData.uploadDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Size:</Text>
              <Text style={styles.detailValue}>{resumeData.size}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Analysis:</Text>
              <Text style={styles.detailValue}>{resumeData.lastAnalysis}</Text>
            </View>
          </View>
        </View>

        {/* Analyzed Skills */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Analyzed Skills</Text>
          <Text style={styles.sectionSubtitle}>
            Skills extracted from your resume by our AI
          </Text>
          
          <View style={styles.skillsList}>
            {resumeData.analyzedSkills.map((skill, index) => (
              <SkillItem key={index} skill={skill} />
            ))}
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <FontAwesome name="lightbulb-o" size={16} color={colors.warning} />
              <Text style={styles.insightTitle}>Skill Recommendations</Text>
            </View>
            <Text style={styles.insightText}>
              Based on your current skills, we recommend focusing on TypeScript and advanced React patterns 
              to enhance your frontend expertise. Consider exploring backend technologies like Express.js 
              to become a full-stack developer.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <FontAwesome name="trending-up" size={16} color={colors.success} />
              <Text style={styles.insightTitle}>Career Growth</Text>
            </View>
            <Text style={styles.insightText}>
              Your JavaScript and React skills are strong foundations. Adding cloud technologies and 
              DevOps practices could open up senior developer opportunities.
            </Text>
          </View>
        </View>

        {/* Action Options */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleUploadNewResume}
            activeOpacity={0.8}
          >
            <FontAwesome name="upload" size={20} color={colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Upload New Resume</Text>
              <Text style={styles.actionDescription}>
                Replace your current resume with an updated version
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleRequestReanalysis}
            activeOpacity={0.8}
          >
            <FontAwesome name="refresh" size={20} color={colors.accent} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Reanalyze Current Resume</Text>
              <Text style={styles.actionDescription}>
                Get updated skill analysis with latest AI improvements
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleViewCurrentResume}
            activeOpacity={0.8}
          >
            <FontAwesome name="eye" size={20} color={colors.warning} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Current Resume</Text>
              <Text style={styles.actionDescription}>
                See what information was extracted from your resume
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={colors.border} />
          </TouchableOpacity>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacySection}>
          <FontAwesome name="shield" size={20} color={colors.success} />
          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>Privacy & Security</Text>
            <Text style={styles.privacyText}>
              Your resume is securely stored and only used to personalize your learning experience. 
              We never share your personal information with third parties.
            </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    lineHeight: 24,
  },
  statusSection: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
    marginLeft: 6,
  },
  resumeDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  skillsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 16,
  },
  skillsList: {
    gap: 8,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  skillName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  skillLevel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillLevelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  insightsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  insightCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    lineHeight: 20,
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    lineHeight: 18,
  },
  privacySection: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  privacyContent: {
    flex: 1,
    marginLeft: 12,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    lineHeight: 20,
  },
});