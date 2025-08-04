import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/Colors';

export default function ErrorScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    // Navigate to dashboard
    router.replace('/(tabs)/dashboard');
  };

  const handleGoBack = () => {
    // Go back to previous screen
    router.back();
  };

  const handleRetry = () => {
    // Reload the current route
    router.replace(router.pathname);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <FontAwesome name="exclamation-triangle" size={64} color={colors.warning} />
        </View>

        {/* Error Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.subtitle}>
            We encountered an unexpected error. Don't worry, your progress is safe!
          </Text>
        </View>

        {/* Error Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>What happened?</Text>
          <View style={styles.detailItem}>
            <FontAwesome name="info-circle" size={16} color={colors.primary} />
            <Text style={styles.detailText}>
              The app encountered an unexpected error and couldn't complete your request.
            </Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome name="shield" size={16} color={colors.success} />
            <Text style={styles.detailText}>
              Your progress and data are safe and automatically saved.
            </Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome name="refresh" size={16} color={colors.accent} />
            <Text style={styles.detailText}>
              Try refreshing or going back to continue your learning journey.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <FontAwesome name="refresh" size={16} color={colors.text} />
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <FontAwesome name="home" size={16} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <FontAwesome name="arrow-left" size={16} color={colors.border} />
            <Text style={styles.tertiaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>

        {/* Support Info */}
        <View style={styles.supportContainer}>
          <Text style={styles.supportTitle}>Still having issues?</Text>
          <Text style={styles.supportText}>
            Contact our support team at{' '}
            <Text style={styles.supportLink}>support@devclimb.com</Text>
          </Text>
          <Text style={styles.supportText}>
            Include details about what you were doing when this error occurred.
          </Text>
        </View>

        {/* DevClimb Branding */}
        <View style={styles.brandingContainer}>
          <Text style={styles.brandingText}>DevClimb - Keep Climbing! 🚀</Text>
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
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    padding: 20,
    borderRadius: 50,
    backgroundColor: colors.warning + '20',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
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
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  tertiaryButtonText: {
    fontSize: 16,
    color: colors.border,
    marginLeft: 8,
  },
  supportContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  supportLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  brandingContainer: {
    alignItems: 'center',
  },
  brandingText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.5,
    fontWeight: '500',
  },
});