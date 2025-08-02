import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Bell, CheckCheck, X, MessageCircle, Clock } from 'lucide-react-native';

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    type: 'adoption_approved',
    title: 'Adoption Request Approved! 🎉',
    message: 'Your request to adopt Max has been approved! Please contact the shelter to arrange pickup.',
    timestamp: '1 hour ago',
    read: false,
    petId: '1',
    petName: 'Max',
    petImage: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&h=400'
  },
  {
    id: '2',
    type: 'adoption_pending',
    title: 'Application Under Review',
    message: 'Your application for Luna is being reviewed. We will contact you within 2-3 days.',
    timestamp: '2 days ago',
    read: true,
    petId: '2',
    petName: 'Luna',
    petImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&h=400'
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message from Happy Paws Rescue',
    message: 'Thank you for your interest in adopting Charlie. We have a few questions about your living situation.',
    timestamp: '3 days ago',
    read: true,
    petId: '3',
    petName: 'Charlie',
    petImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&h=400'
  },
  {
    id: '4',
    type: 'adoption_rejected',
    title: 'Application Update',
    message: 'Unfortunately, your application for Buddy was not selected. Please consider applying for other pets.',
    timestamp: '1 week ago',
    read: true,
    petId: '4',
    petName: 'Buddy',
    petImage: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=400&h=400'
  },
];

// Icon components for different notification types
const NotificationIcon = ({ type, read }: { type: string; read: boolean }) => {
  const color = read ? '#9CA3AF' : '#FF6B6B';
  
  switch (type) {
    case 'adoption_approved':
      return <Heart size={20} color="#10B981" fill="#10B981" />;
    case 'adoption_pending':
      return <Clock size={20} color="#F59E0B" />;
    case 'adoption_rejected':
      return <X size={20} color="#EF4444" />;
    case 'message':
      return <MessageCircle size={20} color={color} />;
    default:
      return <Bell size={20} color={color} />;
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleNotificationPress = (notification: typeof mockNotifications[0]) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type.includes('adoption')) {
      router.push({
        pathname: '/pet-details/[id]',
        params: { id: notification.petId }
      });
    } else if (notification.type === 'message') {
      router.push('/chat');
    }
  };

  const renderNotificationItem = ({ item }: { item: typeof mockNotifications[0] }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <NotificationIcon type={item.type} read={item.read} />
          </View>
          <Image source={{ uri: item.petImage }} style={styles.petImage} />
        </View>
        
        <View style={styles.textContent}>
          <Text style={[styles.title, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <CheckCheck size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyMessage}>
              We'll notify you about adoption updates and messages here
            </Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  markAllButton: {
    padding: 8,
  },
  unreadBanner: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5E5',
  },
  unreadText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationHeader: {
    marginRight: 12,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  petImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  unreadTitle: {
    fontFamily: 'Nunito-Bold',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
