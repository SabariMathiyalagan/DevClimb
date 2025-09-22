import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';
import { useRoadmapDB } from '@/hooks/useRoadmapDB';
import { resume_text } from '@/services/resume';
import { roadmapApi, ROLE_IDS } from '@/services/roadmapApi';

// Target roles data (matching ROLE_IDS from roadmapApi)
const TARGET_ROLES = [
  { id: 'Frontend Engineer', label: 'Frontend Engineer', icon: '🎨' },
  { id: 'Backend Engineer', label: 'Backend Engineer', icon: '⚙️' },
  { id: 'Full Stack Engineer', label: 'Full Stack Engineer', icon: '🚀' },
  { id: 'Mobile Engineer', label: 'Mobile Engineer', icon: '📱' },
  { id: 'Cloud DevOps Engineer', label: 'Cloud DevOps Engineer', icon: '☁️' },
  { id: 'Data Engineering Engineer', label: 'Data Engineering Engineer', icon: '📊' },
  { id: 'ML/AI Engineer', label: 'ML/AI Engineer', icon: '🤖' },
  { id: 'Cybersecurity Engineer', label: 'Cybersecurity Engineer', icon: '🔒' },
  { id: 'QA Test Automation Engineer', label: 'QA Test Automation Engineer', icon: '🧪' },
  { id: 'Game Development Engineer', label: 'Game Development Engineer', icon: '🎮' },
  { id: 'Embedded IoT Engineer', label: 'Embedded IoT Engineer', icon: '🔧' },
  { id: 'AR/VR/XR Engineer', label: 'AR/VR/XR Engineer', icon: '🥽' },
  { id: 'Database Admin Engineer', label: 'Database Admin Engineer', icon: '🗄️' },
];

export default function UploadResumeScreen() {
  const router = useRouter();
  const { generateRoadmap, loadUserRoadmaps } = useRoadmapDB();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('Full Stack Engineer');
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');

  const handleFilePicker = () => {
    // Simulate file picker - immediately show resume.pdf as uploaded
    setUploadedFile('resume.pdf');
  };

  const handleGenerateRoadmap = async () => {
    setResumeText(resume_text);
    
    if (!resumeText.trim()) {
      Alert.alert('Resume Required', 'Please paste your resume text first.');
      return;
    }

    if (!targetRole.trim()) {
      Alert.alert('Target Role Required', 'Please specify your target role.');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Generate roadmap with progress tracking
      const response = await generateRoadmap(
        resumeText, 
        targetRole,
        (status: string) => {
          setGenerationStatus(status);
        }
      );
      
      console.log('Roadmap generated:', response);
      
      // Navigate to dashboard
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationStatus('');
        router.push('/(tabs)/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Error generating roadmap:', error);
      setIsGenerating(false);
      setGenerationStatus('');
      Alert.alert(
        'Error', 
        'Failed to generate roadmap. Please check your connection and try again.'
      );
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const selectedRole = TARGET_ROLES.find(role => role.id === targetRole);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Upload Resume</Text>
            <Text style={styles.subtitle}>
              Upload your resume to generate a personalized learning roadmap
            </Text>
          </View>

          {/* File Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resume</Text>
            
            {!uploadedFile ? (
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={handleFilePicker}
                activeOpacity={0.7}
              >
                <FontAwesome5 name="cloud-upload-alt" size={32} color={colors.primary} />
                <Text style={styles.uploadText}>Tap to upload resume</Text>
                <Text style={styles.uploadSubtext}>PDF, DOC, or TXT files supported</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.uploadedFile}>
                <View style={styles.fileInfo}>
                  <FontAwesome5 name="file-alt" size={24} color={colors.success} />
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>{uploadedFile}</Text>
                    <Text style={styles.fileSize}>Resume uploaded successfully</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleRemoveFile} style={styles.removeButton}>
                  <FontAwesome5 name="times" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>

         

          {/* Target Role Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target Role</Text>
            <TouchableOpacity
              style={styles.roleSelector}
              onPress={() => setShowRoleDropdown(true)}
              activeOpacity={0.7}
            >
              <View style={styles.roleContent}>
                <Text style={styles.roleIcon}>{selectedRole?.icon}</Text>
                <Text style={styles.roleText}>{selectedRole?.label}</Text>
              </View>
              <FontAwesome5 name="chevron-down" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, (isGenerating || !resumeText.trim()) && styles.generateButtonDisabled]}
            onPress={handleGenerateRoadmap}
            disabled={isGenerating}
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <View style={styles.generatingContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.generateButtonText}>Generating...</Text>
              </View>
            ) : (
              <Text style={styles.generateButtonText}>Generate Roadmap</Text>
            )}
          </TouchableOpacity>

          {/* Generation Status */}
          {generationStatus && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{generationStatus}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Role Selection Modal */}
      <Modal
        visible={showRoleDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRoleDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Target Role</Text>
              <TouchableOpacity onPress={() => setShowRoleDropdown(false)}>
                <FontAwesome5 name="times" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={TARGET_ROLES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    targetRole === item.id && styles.selectedRoleOption
                  ]}
                  onPress={() => {
                    setTargetRole(item.id);
                    setShowRoleDropdown(false);
                  }}
                >
                  <Text style={styles.roleOptionIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.roleOptionText,
                    targetRole === item.id && styles.selectedRoleOptionText
                  ]}>
                    {item.label}
                  </Text>
                  {targetRole === item.id && (
                    <FontAwesome5 name="check" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
  },
  uploadText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 12,
    fontWeight: '500',
  },
  uploadSubtext: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
    marginTop: 4,
  },
  uploadedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.success,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  fileSize: {
    fontSize: 14,
    color: colors.success,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  textArea: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  roleText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  generateButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  statusContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedRoleOption: {
    backgroundColor: colors.primary + '10',
  },
  roleOptionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  roleOptionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  selectedRoleOptionText: {
    color: colors.primary,
    fontWeight: '500',
  },
});