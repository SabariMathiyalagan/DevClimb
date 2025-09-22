import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'aws-amplify/auth';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '@/constants/Colors';
import { mockUser } from '@/constants/MockData';
import { useRoadmapDB } from '@/hooks/useRoadmapDB';
import { configureCognito } from '@/config/cognito.config';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { userRoadmaps, clearAllData } = useRoadmapDB();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [questNotifications, setQuestNotifications] = useState(true);

  // Configure Cognito on component mount
  React.useEffect(() => {
    configureCognito();
  }, []);

  // Check if user has a roadmap (which means they have uploaded a resume)
  const hasResume = userRoadmaps.length > 0;

  const handleResumeAction = () => {
    if (hasResume) {
      router.push('/resume-update');
    } else {
      router.push('/upload-resume');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        try {
          await signOut();
          clearAllData(); // Clear roadmap data on logout
          router.push('/');
        } catch (error) {
          console.error('Error signing out:', error);
          // Still clear data and redirect even if sign out fails
          clearAllData();
          router.push('/');
        }
      }},
    ]);
  };
  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account Deleted') },
    ]);
  };
  const handleSupport = () => Alert.alert('Support', 'Email support@devclimb.com');
  const handleAbout = () => Alert.alert('About', 'DevClimb v1.0.0');

  const settingSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Resume',
      items: [
        { 
          id: 'resume-action', 
          title: hasResume ? 'Update Resume' : 'Add Resume', 
          subtitle: hasResume ? 'Refresh your skill assessment' : 'Upload your resume to get started', 
          icon: hasResume ? 'edit' : 'plus-circle', 
          type: 'navigation', 
          onPress: handleResumeAction 
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { id: 'dark-mode', title: 'Dark Mode', subtitle: 'Use dark theme (recommended)', icon: 'moon', type: 'toggle', value: darkMode, onToggle: setDarkMode },
        { id: 'notifications', title: 'Push Notifications', subtitle: 'Get updates about your progress', icon: 'bell', type: 'toggle', value: notifications, onToggle: setNotifications },
        { id: 'streak-reminders', title: 'Streak Reminders', subtitle: 'Daily reminders', icon: 'fire', type: 'toggle', value: streakReminders, onToggle: setStreakReminders },
        { id: 'quest-notifications', title: 'Quest Updates', subtitle: 'Notifications about tasks', icon: 'tasks', type: 'toggle', value: questNotifications, onToggle: setQuestNotifications },
      ],
    },
    {
      title: 'Support',
      items: [
        { id: 'help', title: 'Help & Support', subtitle: 'Get help or contact us', icon: 'question-circle', type: 'action', onPress: handleSupport },
        { id: 'about', title: 'About', subtitle: 'App version and info', icon: 'info-circle', type: 'action', onPress: handleAbout },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 'logout', title: 'Logout', subtitle: 'Sign out of your account', icon: 'sign-out-alt', type: 'action', onPress: handleLogout },
        { id: 'delete', title: 'Delete Account', subtitle: 'Permanently delete your account', icon: 'trash', type: 'action', onPress: handleDeleteAccount },
      ],
    },
  ];

  const SettingItemComponent = ({ item }: { item: SettingItem }) => (
    <TouchableOpacity style={[styles.settingItem, item.id === 'delete' && styles.dangerItem]} onPress={item.onPress} disabled={item.type === 'toggle'} activeOpacity={0.8}>
      <View style={styles.settingIcon}>
        <FontAwesome5 name={item.icon as any} size={20} color={item.id === 'delete' ? colors.error : colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, item.id === 'delete' && styles.dangerText]}>{item.title}</Text>
        {item.subtitle && <Text style={styles.settingSubtitle}>{item.subtitle}</Text>}
      </View>
      <View style={styles.settingAction}>
        {item.type === 'toggle' && item.onToggle && (
          <Switch value={item.value} onValueChange={item.onToggle} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.text} />
        )}
        {(item.type === 'navigation' || (item.type === 'action' && item.id !== 'delete')) && (
          <FontAwesome5 name="chevron-right" size={16} color={colors.border} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={styles.title}>Settings</Text></View>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{mockUser.name.split(' ').map(n => n[0]).join('')}</Text></View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{mockUser.name}</Text>
            <Text style={styles.profileEmail}>{mockUser.email}</Text>
          </View>
        </View>
        {settingSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, idx) => (
                <View key={item.id}>
                  <SettingItemComponent item={item} />
                  {idx < section.items.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 24 },
  header: { paddingHorizontal: 24, paddingVertical: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  profileCard: { backgroundColor: colors.cardBackground, marginHorizontal: 24, marginBottom: 24, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  profileAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  profileAvatarText: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  profileInfo: { alignItems: 'center' },
  profileName: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  profileEmail: { fontSize: 16, color: colors.text, opacity: 0.7, marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, paddingHorizontal: 24, marginBottom: 12 },
  sectionContent: { backgroundColor: colors.cardBackground, marginHorizontal: 24, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  dangerItem: {},
  settingIcon: { width: 40, alignItems: 'center', marginRight: 16 },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 },
  dangerText: { color: colors.error },
  settingSubtitle: { fontSize: 14, color: colors.text, opacity: 0.7 },
  settingAction: { alignItems: 'center', justifyContent: 'center' },
  separator: { height: 1, backgroundColor: colors.border + '30', marginLeft: 76 },
});

