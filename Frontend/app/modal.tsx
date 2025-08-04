import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/Colors';
import { mockChatMessages, ChatMessage } from '@/constants/MockData';
import ChatBubble from '@/components/ChatBubble';

export default function ModalScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const generateResponse = (userMessage: string): string => {
    const responses = [
      "That's a great question! Let me help you with that.",
      "I understand your concern. Here's what I suggest...",
      "Based on your current progress, I recommend focusing on...",
      "You're making excellent progress! Keep up the great work.",
      "That skill is important for your development path. Try starting with...",
      "I can see you're working on challenging concepts. Remember, practice makes perfect!",
      "Great choice! That quest will help you build foundational skills in...",
      "I'm here to help you succeed. What specific area would you like to focus on?",
    ];
    
    // Simple response logic based on keywords
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('react') || lowerMessage.includes('frontend')) {
      return "React is a powerful library! I suggest starting with component basics, then moving to hooks and state management. The React quest in your list is perfect for this!";
    } else if (lowerMessage.includes('backend') || lowerMessage.includes('api')) {
      return "Backend development is crucial! Focus on understanding REST APIs, databases, and server architecture. The Node.js quests will give you a solid foundation.";
    } else if (lowerMessage.includes('stuck') || lowerMessage.includes('help')) {
      return "No worries, everyone gets stuck sometimes! Try breaking the problem into smaller parts, and don't hesitate to look up documentation. You've got this! 💪";
    } else if (lowerMessage.includes('thank')) {
      return "You're very welcome! I'm always here to help you on your coding journey. Keep up the amazing work! 🚀";
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        text: generateResponse(userMessage.text),
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      // Scroll to bottom after AI response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const suggestedQuestions = [
    "What should I learn next?",
    "How do I improve my React skills?",
    "Help me with backend development",
    "I'm stuck on this quest",
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🤖</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AI Coach</Text>
            <Text style={styles.headerSubtitle}>
              {isTyping ? 'Typing...' : 'Online • Ready to help'}
            </Text>
          </View>
          <View style={styles.headerStatus}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          </View>
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <View style={styles.typingIndicator}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.dot1]} />
                  <View style={[styles.typingDot, styles.dot2]} />
                  <View style={[styles.typingDot, styles.dot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggested Questions */}
        {messages.length <= 3 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Try asking:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.suggestions}>
                {suggestedQuestions.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestedQuestion(question)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.suggestionText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask your AI coach anything..."
              placeholderTextColor={colors.border}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isTyping}
              activeOpacity={0.8}
            >
              <FontAwesome 
                name="send" 
                size={16} 
                color={inputText.trim() ? colors.text : colors.border} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <StatusBar style="light" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiAvatarText: {
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  headerStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  typingBubble: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  dot1: {
    // Animation would be added here in a real app
  },
  dot2: {
    // Animation would be added here in a real app
  },
  dot3: {
    // Animation would be added here in a real app
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  suggestionsTitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 8,
  },
  suggestions: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.text,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});
