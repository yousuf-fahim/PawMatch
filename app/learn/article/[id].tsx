import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, Eye, Heart, Share2, Bookmark, User, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { mockLearningArticles, learningCategories } from '@/data/learningContent';

export default function ArticleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Find the article by ID
  const article = mockLearningArticles.find(a => a.id === id);

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Article not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const category = learningCategories.find(cat => cat.id === article.category);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${article.title}`,
        title: article.title,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark functionality
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like functionality
  };

  const renderContent = () => {
    // Mock article content - in a real app, this would come from the article data
    const mockContent = [
      {
        type: 'paragraph',
        content: article.summary || 'This is a comprehensive guide about pet care and training.'
      },
      {
        type: 'heading',
        content: 'Understanding Your Pet'
      },
      {
        type: 'paragraph',
        content: 'Every pet is unique and has their own personality, needs, and preferences. Understanding these individual traits is crucial for building a strong bond and ensuring their well-being.'
      },
      {
        type: 'paragraph',
        content: 'Regular observation of your pet\'s behavior, eating habits, and activity levels can help you identify any changes that might indicate health issues or emotional distress.'
      },
      {
        type: 'heading',
        content: 'Key Tips for Success'
      },
      {
        type: 'list',
        items: [
          'Establish a consistent routine',
          'Provide positive reinforcement',
          'Be patient and understanding',
          'Seek professional help when needed'
        ]
      },
      {
        type: 'paragraph',
        content: 'Remember that building a relationship with your pet takes time and patience. Every small step forward is progress worth celebrating.'
      }
    ];

    return mockContent.map((section, index) => {
      switch (section.type) {
        case 'heading':
          return (
            <Text key={index} style={styles.contentHeading}>
              {section.content}
            </Text>
          );
        case 'paragraph':
          return (
            <Text key={index} style={styles.contentParagraph}>
              {section.content}
            </Text>
          );
        case 'list':
          return (
            <View key={index} style={styles.listContainer}>
              {section.items?.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.listItem}>
                  <Text style={styles.listBullet}>•</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          );
        default:
          return null;
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: article.featuredImage }} style={styles.heroImage} />
          
          {/* Overlay Header */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.3)']}
            style={styles.heroOverlay}
          >
            <View style={styles.header}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                  <Share2 size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.headerButton, isBookmarked && styles.bookmarkActive]} 
                  onPress={handleBookmark}
                >
                  <Bookmark 
                    size={22} 
                    color={isBookmarked ? "#FFD700" : "white"} 
                    fill={isBookmarked ? "#FFD700" : "transparent"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* Category Badge */}
          {category && (
            <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
              <Text style={styles.categoryBadgeText}>{category.name}</Text>
            </View>
          )}
        </View>

        {/* Article Content */}
        <View style={styles.contentContainer}>
          {/* Title and Meta */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{article.title}</Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.authorSection}>
                <User size={16} color="#666" />
                <Text style={styles.authorText}>By {article.author}</Text>
              </View>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.metaText}>{article.estimatedReadTime} min read</Text>
                </View>
                <View style={styles.metaItem}>
                  <Eye size={14} color="#666" />
                  <Text style={styles.metaText}>{article.views} views</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Article Content */}
          <View style={styles.articleContent}>
            {renderContent()}
          </View>

          {/* Engagement Section */}
          <View style={styles.engagementSection}>
            <TouchableOpacity 
              style={[styles.engagementButton, isLiked && styles.likeActive]}
              onPress={handleLike}
            >
              <Heart 
                size={20} 
                color={isLiked ? "#FF6B6B" : "#666"} 
                fill={isLiked ? "#FF6B6B" : "transparent"}
              />
              <Text style={[styles.engagementText, isLiked && styles.likeText]}>
                {article.likes + (isLiked ? 1 : 0)} likes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.engagementButton}>
              <MessageCircle size={20} color="#666" />
              <Text style={styles.engagementText}>Comment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.engagementButton} onPress={handleShare}>
              <Share2 size={20} color="#666" />
              <Text style={styles.engagementText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Related Articles */}
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related Articles</Text>
            <Text style={styles.relatedSubtitle}>More articles you might enjoy</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mockLearningArticles
                .filter(a => a.id !== article.id && a.category === article.category)
                .slice(0, 3)
                .map((relatedArticle) => (
                  <TouchableOpacity
                    key={relatedArticle.id}
                    style={styles.relatedCard}
                    onPress={() => router.push(`/learn/article/${relatedArticle.id}` as any)}
                  >
                    <Image source={{ uri: relatedArticle.featuredImage }} style={styles.relatedImage} />
                    <Text style={styles.relatedCardTitle} numberOfLines={2}>
                      {relatedArticle.title}
                    </Text>
                    <Text style={styles.relatedCardMeta}>
                      {relatedArticle.estimatedReadTime} min • {relatedArticle.views} views
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#FF6B6B',
  },
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    lineHeight: 32,
    marginBottom: 16,
  },
  metaContainer: {
    gap: 12,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  articleContent: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  contentHeading: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  contentParagraph: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#444',
    lineHeight: 24,
    marginBottom: 16,
  },
  listContainer: {
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listBullet: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FF6B6B',
    marginRight: 12,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#444',
    lineHeight: 24,
  },
  engagementSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 32,
  },
  engagementButton: {
    alignItems: 'center',
    gap: 8,
  },
  engagementText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
  },
  likeActive: {
    // Additional styling for active like state
  },
  likeText: {
    color: '#FF6B6B',
  },
  relatedSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  relatedTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  relatedSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginBottom: 16,
  },
  relatedCard: {
    width: 180,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  relatedCardTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    padding: 12,
    paddingBottom: 8,
  },
  relatedCardMeta: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});
