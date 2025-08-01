import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { 
  Search, 
  Clock, 
  Eye, 
  Heart, 
  BookOpen, 
  Play, 
  Star,
  GraduationCap,
  Stethoscope,
  AlertTriangle,
  MapPin,
  Bot,
  LucideIcon
} from 'lucide-react-native';
import { learningCategories, mockLearningArticles, getFeaturedArticles } from '@/data/learningContent';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedButton from '@/components/AnimatedButton';

// Icon mapping for category icons
const iconMap: Record<string, LucideIcon> = {
  Heart: Heart,
  GraduationCap: GraduationCap,
  Stethoscope: Stethoscope,
  BookOpen: BookOpen,
  AlertTriangle: AlertTriangle,
  MapPin: MapPin,
};

export default function LearnScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const featuredArticles = getFeaturedArticles();
  
  // Filter out pet-services from main categories - it will have its own section
  const mainCategories = learningCategories.filter(category => category.id !== 'pet-services');
  const petServicesCategory = learningCategories.find(category => category.id === 'pet-services');

  const handleCategoryPress = (categoryId: string) => {
    console.log('Navigate to category:', categoryId);
    // TODO: Navigate to category screen
  };

  const handleArticlePress = (articleId: string) => {
    router.push(`/learn/article/${articleId}` as any);
  };

  const renderCategoryCard = (category: typeof learningCategories[0]) => {
    const IconComponent = iconMap[category.icon];
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryCard, { borderLeftColor: category.color }]}
        onPress={() => handleCategoryPress(category.id)}
      >
        <View style={styles.categoryContent}>
          <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '20' }]}>
            {IconComponent && (
              <IconComponent 
                size={24} 
                color={category.color} 
                strokeWidth={2}
              />
            )}
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
            <Text style={styles.articleCount}>{category.articleCount} articles</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderArticleCard = (article: typeof mockLearningArticles[0], isLarge = false) => (
    <TouchableOpacity
      key={article.id}
      style={[styles.articleCard, isLarge && styles.largeArticleCard]}
      onPress={() => handleArticlePress(article.id)}
    >
      <Image source={{ uri: article.featuredImage }} style={[styles.articleImage, isLarge && styles.largeArticleImage]} />
      
      {article.videoUrl && (
        <View style={styles.videoIndicator}>
          <Play size={16} color="white" fill="white" />
        </View>
      )}
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={[styles.articleGradient, isLarge && styles.largeArticleGradient]}
      >
        <View style={styles.articleContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {learningCategories.find(cat => cat.id === article.category)?.name}
            </Text>
          </View>
          
          <Text style={[styles.articleTitle, isLarge && styles.largeArticleTitle]} numberOfLines={isLarge ? 3 : 2}>
            {article.title}
          </Text>
          
          {isLarge && (
            <Text style={styles.articleSummary} numberOfLines={2}>
              {article.summary}
            </Text>
          )}
          
          <View style={styles.articleMeta}>
            <View style={styles.metaItem}>
              <Clock size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{article.estimatedReadTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Eye size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{article.views}</Text>
            </View>
            <View style={styles.metaItem}>
              <Heart size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{article.likes}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Learning Center</Text>
          <Text style={styles.subtitle}>Become the best pet parent</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search articles, tips, guides..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Featured Article */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Star size={20} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Featured Article</Text>
          </View>
          {renderArticleCard(featuredArticles[0], true)}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore Topics</Text>
          <View style={styles.categoriesContainer}>
            {mainCategories.map(renderCategoryCard)}
          </View>
        </View>

        {/* Recent Articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Articles</Text>
          {mockLearningArticles.slice(1, 4).map(article => (
            <View key={article.id} style={styles.recentArticle}>
              <Image source={{ uri: article.featuredImage }} style={styles.recentArticleImage} />
              <View style={styles.recentArticleContent}>
                <Text style={styles.recentArticleTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.recentArticleAuthor}>By {article.author}</Text>
                <View style={styles.recentArticleMeta}>
                  <View style={styles.metaItem}>
                    <Clock size={12} color="#666" />
                    <Text style={styles.recentMetaText}>{article.estimatedReadTime} min</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Eye size={12} color="#666" />
                    <Text style={styles.recentMetaText}>{article.views}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pet Services Section */}
        <View style={styles.section}>
          <View style={styles.petServicesCard}>
            <LinearGradient
              colors={['#9013FE', '#6C1CE7']}
              style={styles.petServicesGradient}
            >
              <View style={styles.petServicesContent}>
                <View style={styles.petServicesIconContainer}>
                  <MapPin size={32} color="white" strokeWidth={2} />
                </View>
                <View style={styles.petServicesInfo}>
                  <Text style={styles.petServicesTitle}>Pet Services</Text>
                  <Text style={styles.petServicesDescription}>
                    Find trusted veterinarians, groomers, and pet shops near you
                  </Text>
                  <Text style={styles.petServicesCount}>
                    {petServicesCategory?.articleCount} helpful guides available
                  </Text>
                </View>
              </View>
              <View style={styles.petServicesButtonContainer}>
                <AnimatedButton 
                  title="Explore Services" 
                  onPress={() => handleCategoryPress('pet-services')}
                  variant="secondary"
                  size="medium"
                  icon="map-pin"
                />
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* AI Assistant Teaser */}
        <View style={styles.section}>
          <View style={styles.aiAssistantCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.aiAssistantGradient}
            >
              <View style={styles.aiAssistantContent}>
                <View style={styles.aiAssistantIconContainer}>
                  <Bot size={32} color="white" strokeWidth={2} />
                </View>
                <View style={styles.aiAssistantInfo}>
                  <Text style={styles.aiAssistantTitle}>AI Pet Counselor</Text>
                  <Text style={styles.aiAssistantDescription}>
                    Get expert veterinary advice 24/7. Ask about health, behavior, training, and emergency care.
                  </Text>
                </View>
              </View>
              <View style={styles.aiButtonContainer}>
                <AnimatedButton 
                  title="Chat with AI Vet" 
                  onPress={() => console.log('AI Assistant pressed')}
                  variant="secondary"
                  size="medium"
                  icon="bot"
                />
              </View>
            </LinearGradient>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#333',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginBottom: 4,
  },
  articleCount: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#FF6B6B',
  },
  articleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: 'white',
    width: 250,
  },
  largeArticleCard: {
    width: '100%',
  },
  articleImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  largeArticleImage: {
    height: 200,
  },
  videoIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    padding: 6,
  },
  articleGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
  },
  largeArticleGradient: {
    height: 140,
  },
  articleContent: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
  },
  articleTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    marginBottom: 8,
  },
  largeArticleTitle: {
    fontSize: 20,
  },
  articleSummary: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  recentArticle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentArticleImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  recentArticleContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recentArticleTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  recentArticleAuthor: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginBottom: 8,
  },
  recentArticleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentMetaText: {
    fontSize: 11,
    fontFamily: 'Nunito-Regular',
    color: '#666',
  },
  aiAssistantCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
  },
  aiAssistantGradient: {
    padding: 24,
  },
  aiAssistantContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiAssistantIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  aiAssistantInfo: {
    flex: 1,
  },
  aiAssistantTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    marginBottom: 6,
  },
  aiAssistantDescription: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
  },
  aiAssistantCta: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: 'white',
  },
  aiButtonContainer: {
    alignItems: 'flex-start',
  },
  petServicesCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  petServicesGradient: {
    padding: 24,
  },
  petServicesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  petServicesIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  petServicesInfo: {
    flex: 1,
  },
  petServicesTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: 'white',
    marginBottom: 6,
  },
  petServicesDescription: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
    marginBottom: 4,
  },
  petServicesCount: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  petServicesButtonContainer: {
    alignItems: 'flex-start',
  },
});
