import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';

interface ProjectSubmission {
  githubUrl: string;
  liveUrl: string;
  description: string;
  challenges: string;
  learnings: string;
}

export default function SubmitProjectScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectSubmission>({
    githubUrl: '',
    liveUrl: '',
    description: '',
    challenges: '',
    learnings: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: keyof ProjectSubmission, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.githubUrl.trim()) {
      Alert.alert('GitHub URL Required', 'Please provide a GitHub repository URL for your project.');
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert('Description Required', 'Please describe what you built and how it works.');
      return false;
    }

    // Basic URL validation for GitHub
    const githubUrlPattern = /^https:\/\/github\.com\/.+\/.+/;
    if (!githubUrlPattern.test(formData.githubUrl)) {
      Alert.alert('Invalid GitHub URL', 'Please provide a valid GitHub repository URL (e.g., https://github.com/username/repo).');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Project Submitted! 🎉',
        'Your project has been submitted for review. Our AI will analyze your code and provide feedback within 24 hours. You\'ll earn XP once the review is complete!',
        [
          {
            text: 'View Review',
            onPress: () => {
              // Navigate to project review screen
              router.push('/project-review');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Submission Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exampleProjects = [
    {
      title: 'Personal Portfolio',
      description: 'Responsive portfolio website with React and TypeScript',
      url: 'https://github.com/example/portfolio',
    },
    {
      title: 'Todo App',
      description: 'Full-stack todo application with authentication',
      url: 'https://github.com/example/todo-app',
    },
    {
      title: 'Weather Dashboard',
      description: 'Weather app using external APIs and modern UI',
      url: 'https://github.com/example/weather-app',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Submit Your Project</Text>
          <Text style={styles.subtitle}>
            Share your work and get AI-powered feedback to earn XP!
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* GitHub URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              GitHub Repository URL <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <FontAwesome5 name="github" size={20} color={colors.border} />
              <TextInput
                style={styles.input}
                placeholder="https://github.com/username/project-name"
                placeholderTextColor={colors.border}
                value={formData.githubUrl}
                onChangeText={(value) => updateFormData('githubUrl', value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Live URL (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Live Demo URL (Optional)</Text>
            <View style={styles.inputContainer}>
              <FontAwesome5 name="link" size={20} color={colors.border} />
              <TextInput
                style={styles.input}
                placeholder="https://your-project.vercel.app"
                placeholderTextColor={colors.border}
                value={formData.liveUrl}
                onChangeText={(value) => updateFormData('liveUrl', value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Project Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Project Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what you built, the technologies used, and key features..."
              placeholderTextColor={colors.border}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Challenges Faced */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Challenges You Overcame</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What difficulties did you encounter and how did you solve them?"
              placeholderTextColor={colors.border}
              value={formData.challenges}
              onChangeText={(value) => updateFormData('challenges', value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Key Learnings */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>What You Learned</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What new skills or concepts did you learn while building this?"
              placeholderTextColor={colors.border}
              value={formData.learnings}
              onChangeText={(value) => updateFormData('learnings', value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Submission Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <FontAwesome5 name="check" size={14} color={colors.success} />
              <Text style={styles.tipText}>Make sure your README explains how to run the project</Text>
            </View>
            <View style={styles.tipItem}>
              <FontAwesome5 name="check" size={14} color={colors.success} />
              <Text style={styles.tipText}>Include screenshots or GIFs of your project in action</Text>
            </View>
            <View style={styles.tipItem}>
              <FontAwesome5 name="check" size={14} color={colors.success} />
              <Text style={styles.tipText}>Clean, well-commented code gets better feedback</Text>
            </View>
            <View style={styles.tipItem}>
              <FontAwesome5 name="check" size={14} color={colors.success} />
              <Text style={styles.tipText}>Deploy your project for extra points!</Text>
            </View>
          </View>
        </View>

        {/* Example Projects */}
        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>🌟 Example Projects</Text>
          {exampleProjects.map((project, index) => (
            <TouchableOpacity key={index} style={styles.exampleCard} activeOpacity={0.8}>
              <View style={styles.exampleHeader}>
                <FontAwesome5 name="github" size={16} color={colors.primary} />
                <Text style={styles.exampleTitle}>{project.title}</Text>
              </View>
              <Text style={styles.exampleDescription}>{project.description}</Text>
              <Text style={styles.exampleUrl}>{project.url}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <Text style={styles.submitButtonText}>Submitting...</Text>
          ) : (
            <>
              <FontAwesome5 name="upload" size={16} color={colors.text} />
              <Text style={styles.submitButtonText}>Submit Project</Text>
            </>
          )}
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
    paddingBottom: 100, // Space for submit button
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
  form: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  textArea: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    marginLeft: 0,
  },
  tipsSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  examplesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  exampleCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  exampleDescription: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  },
  exampleUrl: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: 'SpaceMono',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
});