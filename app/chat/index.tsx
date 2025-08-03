import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const predefinedQuestions = [
  "How do I know if a pet is right for me?",
  "What should I prepare before adoption?",
  "How much does pet adoption cost?",
  "What are the basic pet care requirements?",
  "How do I introduce a new pet to my home?",
  "What vaccinations does my pet need?"
];

const aiResponses: { [key: string]: string } = {
  "how do i know if a pet is right for me": "Great question! Consider your lifestyle, living space, time availability, and budget. Think about pet size, energy level, and care requirements that match your situation. Our compatibility quiz in the app can help you find the perfect match!",
  "what should i prepare before adoption": "Essential preparations include: pet-proofing your home, buying food/water bowls, a bed, toys, and a collar with ID tag. For cats, get a litter box and scratching post. For dogs, get a leash and crate. Also, find a local veterinarian and budget for initial medical care.",
  "how much does pet adoption cost": "Adoption fees typically range from $50-$500 depending on the pet and shelter. This usually includes initial vaccinations, spaying/neutering, and microchipping. Ongoing monthly costs average $50-$150 for food, supplies, and routine veterinary care.",
  "what are the basic pet care requirements": "Basic care includes: daily fresh water and appropriate food, regular exercise and mental stimulation, grooming as needed, annual vet checkups and vaccinations, dental care, and lots of love and attention. Each pet type has specific needs we can help you understand!",
  "how do i introduce a new pet to my home": "Take it slow! Create a quiet, safe space for your new pet initially. For dogs, start with short walks and gradually introduce them to different areas. For cats, let them explore one room first. Be patient - it can take several weeks for pets to fully adjust to their new home.",
  "what vaccinations does my pet need": "Core vaccines for dogs include rabies, DHPP (distemper, hepatitis, parvovirus, parainfluenza). For cats: rabies, FVRCP (feline viral rhinotracheitis, calicivirus, panleukopenia). Your vet will recommend a schedule based on your pet's age and health status. Keep vaccination records up to date!"
};

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI Pet Counselor 🐾 I'm here to help you with all your pet adoption and care questions. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBack = () => {
    router.back();
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for predefined responses
    for (const [key, response] of Object.entries(aiResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Check for specific keywords and provide relevant responses
    if (lowerMessage.includes('adoption') && lowerMessage.includes('process')) {
      return "The adoption process typically involves: 1) Browse available pets in our app 2) Submit an adoption application 3) Meet with the pet and shelter staff 4) Home visit (if required) 5) Finalize adoption paperwork and fees. Each shelter may have slightly different requirements.";
    }
    
    if (lowerMessage.includes('food') || lowerMessage.includes('feeding')) {
      return "Pet nutrition is crucial! Choose age-appropriate, high-quality pet food. Feed on a regular schedule - usually 2-3 times daily for adults, more for puppies/kittens. Avoid human foods that are toxic to pets like chocolate, grapes, onions. Always provide fresh water. Consult your vet for specific dietary recommendations.";
    }
    
    if (lowerMessage.includes('exercise') || lowerMessage.includes('walk')) {
      return "Exercise needs vary by pet type and age. Dogs typically need 30 minutes to 2 hours daily depending on breed and size. Cats benefit from 10-15 minutes of active play. Provide mental stimulation through puzzle toys and training. Regular exercise keeps pets healthy and well-behaved!";
    }
    
    if (lowerMessage.includes('training') || lowerMessage.includes('behavior')) {
      return "Positive reinforcement is key! Start with basic commands like sit, stay, come. Be consistent and patient. For cats, focus on litter training and scratching post use. Address behavioral issues early. Consider professional training classes for dogs. Remember, every pet learns at their own pace.";
    }
    
    if (lowerMessage.includes('health') || lowerMessage.includes('vet') || lowerMessage.includes('sick')) {
      return "Regular veterinary care is essential. Schedule annual wellness exams, keep up with vaccinations, and maintain parasite prevention. Watch for signs of illness: changes in appetite, energy, or bathroom habits. For emergencies, contact your vet immediately. Pet insurance can help with unexpected costs.";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello there! 👋 I'm excited to help you on your pet adoption journey. Whether you're looking for advice on choosing the right pet, preparing for adoption, or caring for your new furry friend, I'm here to help. What's on your mind?";
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're very welcome! 🐕🐱 I'm always here to help with your pet questions. Remember, adopting a pet is a wonderful journey filled with love and companionship. Feel free to ask me anything else about pet care or adoption!";
    }

    // Default response for unrecognized queries
    return "That's a great question! While I try to help with most pet-related topics, I might not have specific information about that. Here are some things I can definitely help you with: choosing the right pet, adoption process, basic care, feeding, exercise, training, and health tips. What specific aspect would you like to know more about?";
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

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
      const aiResponse = generateAIResponse(userMessage.text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const sendPredefinedQuestion = (question: string) => {
    setInputText(question);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6F61', '#D32F2F']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Pet Counselor</Text>
          <Text style={styles.headerSubtitle}>Your 24/7 pet care assistant</Text>
        </View>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View key={message.id} style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.aiMessage
            ]}>
              <View style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble
              ]}>
                <View style={styles.messageHeader}>
                  {message.isUser ? (
                    <User size={16} color="#666" />
                  ) : (
                    <Bot size={16} color="#FF6B6B" />
                  )}
                  <Text style={styles.messageSender}>
                    {message.isUser ? 'You' : 'AI Counselor'}
                  </Text>
                </View>
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.messageHeader}>
                  <Bot size={16} color="#FF6B6B" />
                  <Text style={styles.messageSender}>AI Counselor</Text>
                </View>
                <View style={styles.typingContainer}>
                  <Text style={styles.typingText}>Thinking</Text>
                  <View style={styles.typingDots}>
                    <View style={[styles.dot, styles.dot1]} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <View style={styles.quickQuestionsContainer}>
            <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {predefinedQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickQuestionButton}
                  onPress={() => sendPredefinedQuestion(question)}
                >
                  <Text style={styles.quickQuestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about pets..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isTyping}
            >
              <Send size={20} color={!inputText.trim() ? "#999" : "white"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  headerSpacer: {
    width: 40,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#FF6B6B',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
    marginLeft: 6,
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Nunito-Regular',
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#333',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 15,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B6B',
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  quickQuestionsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: 'white',
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  quickQuestionButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  quickQuestionText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
});