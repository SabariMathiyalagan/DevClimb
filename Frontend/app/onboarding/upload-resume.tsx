import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';

export default function UploadResumeScreen() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilePicker = () => {
    // Simulate file picker - immediately show resume.pdf as uploaded
    setUploadedFile('resume.pdf');
  };

  const handleGenerateRoadmap = async () => {
    if (!uploadedFile) {
      Alert.alert('File Required', 'Please upload your resume first.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to loading screen for AI processing simulation
      router.push('/onboarding/loading');
    } catch (error) {
      Alert.alert('Error', 'Failed to process resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upload Your Resume</Text>
          <Text style={styles.subtitle}>
            Let our AI analyze your experience and create a personalized roadmap
          </Text>
        </View>

        {/* Upload Area */}
        <View style={styles.uploadSection}>
          {!uploadedFile ? (
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={handleFilePicker}
              activeOpacity={0.8}
            >
              <View style={styles.uploadIcon}>
                <FontAwesome5 name="cloud-upload-alt" size={48} color={colors.primary} />
              </View>
              <Text style={styles.uploadTitle}>Tap to Upload Resume</Text>
              <Text style={styles.uploadSubtitle}>
                PDF, DOC, or DOCX files supported{'\n'}Max size: 10MB
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.filePreview}>
              <View style={styles.fileInfo}>
                <FontAwesome5 name="file-pdf" size={32} color={colors.error} />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{uploadedFile}</Text>
                  <Text style={styles.fileSize}>1.2 MB • PDF</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemoveFile}
                  activeOpacity={0.8}
                >
                  <FontAwesome5 name="times" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.successIndicator}>
                <FontAwesome5 name="check-circle" size={16} color={colors.success} />
                <Text style={styles.successText}>File uploaded successfully</Text>
              </View>
            </View>
          )}
        </View>

        {/* Features List */}
        <View style={styles.featuresList}>
          <Text style={styles.featuresTitle}>What happens next?</Text>
          <View style={styles.feature}>
            <FontAwesome5 name="search" size={16} color={colors.primary} />
            <Text style={styles.featureText}>AI analyzes your skills and experience</Text>
          </View>
          <View style={styles.feature}>
            <FontAwesome5 name="sitemap" size={16} color={colors.primary} />
            <Text style={styles.featureText}>Creates personalized learning paths</Text>
          </View>
          <View style={styles.feature}>
            <FontAwesome5 name="gamepad" size={16} color={colors.primary} />
            <Text style={styles.featureText}>Generates quests based on your goals</Text>
          </View>
          <View style={styles.feature}>
            <FontAwesome5 name="trophy" size={16} color={colors.primary} />
            <Text style={styles.featureText}>Sets up achievement milestones</Text>
          </View>
        </View>

        {/* Generate Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.generateButton, 
              !uploadedFile && styles.generateButtonDisabled,
              isLoading && styles.generateButtonDisabled
            ]}
            onPress={handleGenerateRoadmap}
            disabled={!uploadedFile || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.generateButtonText}>
              {isLoading ? 'Processing...' : 'Generate My Roadmap'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Your resume data is processed securely and never shared with third parties
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
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
  uploadSection: {
    marginBottom: 32,
  },
  uploadArea: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 20,
  },
  filePreview: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.success,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
  },
  removeButton: {
    padding: 8,
  },
  successIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successText: {
    fontSize: 14,
    color: colors.success,
    marginLeft: 8,
    fontWeight: '500',
  },
  featuresList: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  generateButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 16,
  },
});