import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Heart, Zap, Stethoscope } from 'lucide-react-native';

// Mock AI responses for different pet topics
const aiResponses: Record<string, string> = {
  'feeding': "🍽️ Great question about feeding! For puppies, feed them 3-4 times daily with high-quality puppy food. Adult dogs should eat twice daily. Always provide fresh water and avoid giving chocolate, grapes, or onions!",
  'training': "🎾 Training tip: Start with basic commands like 'sit' and 'stay'. Use positive reinforcement with treats and praise. Keep sessions short (5-10 minutes) and be consistent. Remember, patience is key!",
  'health': "🏥 If you notice any unusual symptoms like loss of appetite, lethargy, or vomiting, it's best to consult your veterinarian. Regular check-ups every 6-12 months help maintain your pet's health!",
  'behavior': "🐕 Pet behavior issues often stem from boredom or anxiety. Ensure your pet gets enough exercise and mental stimulation. If problems persist, consider consulting a professional pet behaviorist.",
  'emergency': "🚨 For emergencies like choking, bleeding, or difficulty breathing, contact your nearest veterinary emergency clinic immediately. Keep their number handy and stay calm while helping your pet.",
  'default': "🐾 Hi there! I'm Dr. Pawsome, your friendly AI veterinary assistant! I'm here to help with basic pet care questions. What would you like to know about your furry friend today? Remember, for serious health concerns, always consult with a licensed veterinarian! 💕"
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIVetScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: aiResponses.default,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('feed') || message.includes('food') || message.includes('eat')) {
      return aiResponses.feeding;
    } else if (message.includes('train') || message.includes('command') || message.includes('behavior')) {
      return aiResponses.training;
    } else if (message.includes('sick') || message.includes('health') || message.includes('vet') || message.includes('symptom')) {
      return aiResponses.health;
    } else if (message.includes('aggressive') || message.includes('bark') || message.includes('bite')) {
      return aiResponses.behavior;
    } else if (message.includes('emergency') || message.includes('urgent') || message.includes('help')) {
      return aiResponses.emergency;
    } else {
      return "🤔 That's an interesting question! While I'd love to help with everything, I specialize in basic pet care guidance. For specific medical concerns or detailed advice, I recommend consulting with your veterinarian. Is there anything else about general pet care I can help you with? 🐾";
    }
  };

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(userMessage.text),
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const renderMessage = (message: Message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      {!message.isUser && (
        <View style={styles.aiAvatar}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=100&h=100' }}
            style={styles.avatarImage}
          />
          <View style={styles.stethoscopeIcon}>
            <Stethoscope size={12} color="#FF6B6B" />
          </View>
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        message.isUser ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userText : styles.aiText
        ]}>
          {message.text}
        </Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  const quickQuestions = [
    "How often should I feed my puppy?",
    "What are signs of a healthy pet?",
    "How to train my dog to sit?",
    "Emergency first aid for pets"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Dr. Pawsome</Text>
          <Text style={styles.headerSubtitle}>AI Veterinary Assistant</Text>
        </View>
        <View style={styles.onlineIndicator}>
          <Zap size={16} color="#10B981" />
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={styles.aiAvatar}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=100&h=100' }}
                  style={styles.avatarImage}
                />
                <View style={styles.stethoscopeIcon}>
                  <Stethoscope size={12} color="#FF6B6B" />
                </View>
              </View>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {messages.length === 1 && (
          <View style={styles.quickQuestionsContainer}>
            <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
            {quickQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickQuestionButton}
                onPress={() => handleQuickQuestion(question)}
              >
                <Text style={styles.quickQuestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask Dr. Pawsome anything about your pet..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim() !== '' && styles.sendButtonActive]}
            onPress={handleSend}
            disabled={inputText.trim() === ''}
          >
            <Send size={20} color={inputText.trim() !== '' ? "white" : "#CCC"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          💡 Dr. Pawsome provides general pet care guidance. For medical emergencies or specific health concerns, please consult a licensed veterinarian.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  onlineIndicator: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 20,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    position: 'relative',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  stethoscopeIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#FF6B6B',
    marginLeft: 'auto',
  },
  aiBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    lineHeight: 20,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    fontFamily: 'Nunito-Regular',
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  quickQuestionsContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  quickQuestionButton: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  quickQuestionText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#333',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  disclaimer: {
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFE5E5',
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#FF6B6B',
    textAlign: 'center',
    lineHeight: 16,
  },
});
