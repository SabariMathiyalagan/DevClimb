import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/Colors';
import { ChatMessage } from '@/constants/MockData';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, message.isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, message.isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, message.isUser ? styles.userText : styles.aiText]}>
          {message.text}
        </Text>
        <Text style={[styles.timestamp, message.isUser ? styles.userTimestamp : styles.aiTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.cardBackground,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userText: {
    color: colors.text,
  },
  aiText: {
    color: colors.text,
  },
  timestamp: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: colors.text,
    opacity: 0.8,
  },
  aiTimestamp: {
    color: colors.text,
    opacity: 0.6,
  },
});