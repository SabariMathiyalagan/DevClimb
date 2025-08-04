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
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/Colors';
import { mockUser } from '@/constants/MockData';

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
  const [darkMode, setDarkMode] = useState(true); // DevClimb uses dark theme
  const [notifications, setNotifications] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [questNotifications, setQuestNotifications] = useState(true);

  const handleUpdateResume = () => {
    // Navigate to resume update screen
    router.push('/resume-update');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // Navigate back to onboarding
            router.replace('/onboarding/welcome');
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => Alert.alert('Account Deleted', 'Your account has been deleted.')
        },
      ]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'Need help? Contact us at support@devclimb.com or visit our help center.',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About DevClimb',
      'DevClimb v1.0.0\n\nAI-powered gamified learning for developers.\n\nBuilt with React Native and lots of ❤️',
      [{ text: 'OK' }]
    );
  };

  const settingSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Profile',
      items: [
        {
          id: 'update-resume',
          title: 'Update Resume',
          subtitle: 'Refresh your skill assessment',
          icon: 'file-text',
          type: 'navigation',
          onPress: handleUpdateResume,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'dark-mode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme (recommended)',
          icon: 'moon-o',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Get updates about your progress',
          icon: 'bell',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: 'streak-reminders',
          title: 'Streak Reminders',
          subtitle: 'Daily reminders to maintain your streak',
          icon: 'fire',
          type: 'toggle',
          value: streakReminders,
          onToggle: setStreakReminders,
        },
        {
          id: 'quest-notifications',
          title: 'Quest Updates',
          subtitle: 'Notifications about new quests',
          icon: 'tasks',
          type: 'toggle',
          value: questNotifications,
          onToggle: setQuestNotifications,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help & Support',
          subtitle: 'Get help or contact us',
          icon: 'question-circle',
          type: 'action',
          onPress: handleSupport,
        },
        {
          id: 'about',
          title: 'About',
          subtitle: 'App version and info',
          icon: 'info-circle',
          type: 'action',
          onPress: handleAbout,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'logout',
          title: 'Logout',
          subtitle: 'Sign out of your account',
          icon: 'sign-out',
          type: 'action',
          onPress: handleLogout,
        },
        {
          id: 'delete',
          title: 'Delete Account',
          subtitle: 'Permanently delete your account',
          icon: 'trash',
          type: 'action',
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  const SettingItemComponent = ({ item }: { item: SettingItem }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        item.id === 'delete' && styles.dangerItem,
      ]}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
      activeOpacity={0.8}
    >
      <View style={styles.settingIcon}>
        <FontAwesome 
          name={item.icon as any} 
          size={20} 
          color={item.id === 'delete' ? colors.error : colors.primary} 
        />
      </View>
      
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, item.id === 'delete' && styles.dangerText]}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>

      <View style={styles.settingAction}>
        {item.type === 'toggle' && item.onToggle && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
        )}
        {item.type === 'navigation' && (
          <FontAwesome name="chevron-right" size={16} color={colors.border} />
        )}
        {item.type === 'action' && item.id !== 'delete' && (
          <FontAwesome name="chevron-right" size={16} color={colors.border} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {mockUser.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{mockUser.name}</Text>
            <Text style={styles.profileEmail}>{mockUser.email}</Text>
            <View style={styles.profileStats}>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>Level {mockUser.level}</Text>
                <Text style={styles.profileStatLabel}>Current Level</Text>
              </View>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{mockUser.totalXP.toLocaleString()}</Text>
                <Text style={styles.profileStatLabel}>Total XP</Text>
              </View>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{mockUser.streak} days</Text>
                <Text style={styles.profileStatLabel}>Current Streak</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, index) => (
                <View key={item.id}>
                  <SettingItemComponent item={item} />
                  {index < section.items.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>DevClimb v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 DevClimb. All rights reserved.</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileCard: {
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
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 16,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
    fontFamily: 'SpaceMono',
  },
  profileStatLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dangerItem: {
    // Optional: add danger styling
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  dangerText: {
    color: colors.error,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  settingAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border + '30',
    marginLeft: 76,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.5,
  },
});