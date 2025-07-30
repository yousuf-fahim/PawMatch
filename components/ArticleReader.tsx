import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Eye, Heart, Share2, BookmarkPlus, Play } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { LearningArticle } from '@/data/learningContent';

const { width: screenWidth } = Dimensions.get('window');

interface ArticleReaderProps {
  article: LearningArticle;
  onBack: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onLike?: () => void;
}

export default function ArticleReader({ 
  article, 
  onBack, 
  onBookmark, 
  onShare, 
  onLike 
}: ArticleReaderProps) {
  
  const markdownStyles = {
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'Nunito-Regular',
      color: '#333',
    },
    heading1: {
      fontSize: 28,
      fontFamily: 'Poppins-Bold',
      color: '#333',
      marginTop: 24,
      marginBottom: 16,
    },
    heading2: {
      fontSize: 24,
      fontFamily: 'Poppins-SemiBold',
      color: '#333',
      marginTop: 20,
      marginBottom: 12,
    },
    heading3: {
      fontSize: 20,
      fontFamily: 'Poppins-SemiBold',
      color: '#444',
      marginTop: 16,
      marginBottom: 8,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'Nunito-Regular',
      color: '#333',
      marginBottom: 12,
    },
    list_item: {
      fontSize: 16,
      fontFamily: 'Nunito-Regular',
      color: '#333',
      marginBottom: 4,
    },
    strong: {
      fontFamily: 'Nunito-Bold',
      color: '#FF6B6B',
    },
    em: {
      fontFamily: 'Nunito-Italic',
      color: '#666',
    },
    code_inline: {
      backgroundColor: '#F5F5F5',
      color: '#FF6B6B',
      fontSize: 14,
      fontFamily: 'Courier',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    blockquote: {
      backgroundColor: '#F8F9FA',
      borderLeftColor: '#FF6B6B',
      borderLeftWidth: 4,
      paddingLeft: 16,
      paddingVertical: 12,
      marginVertical: 12,
      borderRadius: 8,
    },
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#666';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic-care': return '#FF6B6B';
      case 'training': return '#4ECDC4';
      case 'health': return '#45B7D1';
      case 'breed-guide': return '#96CEB4';
      case 'emergency': return '#FECA57';
      default: return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: article.featuredImage }} style={styles.headerImage} />
        
        {/* Video Play Button */}
        {article.videoUrl && (
          <TouchableOpacity style={styles.videoPlayButton}>
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
              style={styles.videoPlayGradient}
            >
              <Play size={32} color="white" fill="white" />
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <View style={styles.backButtonBackground}>
            <ArrowLeft size={24} color="#333" />
          </View>
        </TouchableOpacity>
        
        {/* Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onBookmark}>
            <BookmarkPlus size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Share2 size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Article Header */}
        <View style={styles.articleHeader}>
          <View style={styles.badges}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(article.category) }]}>
              <Text style={styles.badgeText}>
                {article.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(article.difficulty) }]}>
              <Text style={styles.badgeText}>{article.difficulty}</Text>
            </View>
          </View>
          
          <Text style={styles.title}>{article.title}</Text>
          
          <Text style={styles.summary}>{article.summary}</Text>
          
          <View style={styles.authorSection}>
            <Text style={styles.author}>By {article.author}</Text>
            <Text style={styles.date}>
              {article.createdAt.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          
          <View style={styles.metaStats}>
            <View style={styles.statItem}>
              <Clock size={16} color="#666" />
              <Text style={styles.statText}>{article.estimatedReadTime} min read</Text>
            </View>
            <View style={styles.statItem}>
              <Eye size={16} color="#666" />
              <Text style={styles.statText}>{article.views.toLocaleString()} views</Text>
            </View>
            <TouchableOpacity style={styles.statItem} onPress={onLike}>
              <Heart size={16} color="#FF6B6B" />
              <Text style={styles.statText}>{article.likes} likes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.articleContent}>
          <Markdown style={markdownStyles}>
            {article.content}
          </Markdown>
        </View>

        {/* Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.tagsTitle}>Related Topics</Text>
          <View style={styles.tags}>
            {article.tags.map((tag, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.likeButton} onPress={onLike}>
            <Heart size={24} color="#FF6B6B" />
            <Text style={styles.likeButtonText}>Like this article</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton} onPress={onShare}>
            <Share2 size={20} color="#666" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Spacing for bottom */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  videoPlayGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  backButtonBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
  },
  headerActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  articleHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 12,
    lineHeight: 36,
  },
  summary: {
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    lineHeight: 26,
    marginBottom: 16,
  },
  authorSection: {
    marginBottom: 16,
  },
  author: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  metaStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  articleContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  tagsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tagsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  likeButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#FF6B6B',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
  },
  bottomSpacing: {
    height: 20,
  },
});
