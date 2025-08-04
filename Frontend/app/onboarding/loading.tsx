import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';

const loadingSteps = [
  'Analyzing your resume...',
  'Identifying your skills...',
  'Mapping learning paths...',
  'Creating personalized quests...',
  'Setting up your dashboard...',
];

export default function LoadingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progressAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Start progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Update loading steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    // Auto-navigate to dashboard after 3 seconds
    const navigationTimer = setTimeout(() => {
      // Navigate to main app (dashboard)
      router.replace('/(tabs)/dashboard');
    }, 3000);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(navigationTimer);
      pulseAnimation.stop();
    };
  }, [router, progressAnim, pulseAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* AI Brain Animation */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.brainIcon,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Text style={styles.brainEmoji}>🧠</Text>
          </Animated.View>
          
          {/* Orbiting dots */}
          <View style={styles.orbitContainer}>
            <View style={[styles.orbitDot, styles.dot1]} />
            <View style={[styles.orbitDot, styles.dot2]} />
            <View style={[styles.orbitDot, styles.dot3]} />
          </View>
        </View>

        {/* Loading Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>DevClimb AI</Text>
          <Text style={styles.subtitle}>
            {loadingSteps[currentStep]}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(((currentStep + 1) / loadingSteps.length) * 100)}%
          </Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipTitle}>💡 Did you know?</Text>
          <Text style={styles.tipText}>
            DevClimb uses advanced AI to create learning paths that adapt to your pace and preferred learning style.
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: 48,
  },
  brainIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  brainEmoji: {
    fontSize: 36,
  },
  orbitContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  orbitDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  dot1: {
    top: 10,
    right: 30,
  },
  dot2: {
    bottom: 20,
    left: 15,
  },
  dot3: {
    top: 40,
    left: 5,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
    minHeight: 24, // Prevent layout shift
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 48,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.cardBackground,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
  tipsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    lineHeight: 20,
  },
});