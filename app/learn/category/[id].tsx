import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, Eye, Heart, BookOpen } from 'lucide-react-native';
import { mockLearningArticles, learningCategories } from '@/data/learningContent';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [likedArticles, setLikedArticles] = useState<string[]>([]);

  // Find the category
  const category = learningCategories.find(cat => cat.id === id);
  
  // Filter articles by category
  const categoryArticles = mockLearningArticles.filter(article => article.category === id);

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Category</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Category not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleArticlePress = (articleId: string) => {
    router.push({
      pathname: '/learn/article/[id]',
      params: { id: articleId }
    });
  };

  const toggleLike = (articleId: string) => {
    setLikedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const renderArticleItem = ({ item }: { item: typeof mockLearningArticles[0] }) => (
    <TouchableOpacity style={styles.articleCard} onPress={() => handleArticlePress(item.id)}>
      <Image source={{ uri: item.featuredImage }} style={styles.articleImage} />
      <View style={styles.articleContent}>
        <View style={styles.articleHeader}>
          <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
          <TouchableOpacity onPress={() => toggleLike(item.id)}>
            <Heart 
              size={20} 
              color="#FF6B6B" 
              fill={likedArticles.includes(item.id) ? "#FF6B6B" : "none"} 
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.articleSummary} numberOfLines={3}>{item.summary}</Text>
        
        <View style={styles.articleMeta}>
          <View style={styles.metaItem}>
            <Clock size={14} color="#666" />
            <Text style={styles.metaText}>{item.estimatedReadTime} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Eye size={14} color="#666" />
            <Text style={styles.metaText}>{item.views}</Text>
          </View>
          <View style={styles.metaItem}>
            <Heart size={14} color="#666" />
            <Text style={styles.metaText}>{item.likes}</Text>
          </View>
        </View>
        
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
          <BookOpen size={24} color={category.color} />
        </View>
        <Text style={styles.categoryDescription}>{category.description}</Text>
        <Text style={styles.articleCount}>
          {categoryArticles.length} article{categoryArticles.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={categoryArticles}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No articles yet</Text>
            <Text style={styles.emptyMessage}>
              Articles for this category will be added soon!
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
  categoryHeader: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryDescription: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  articleCount: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#FF6B6B',
  },
  listContainer: {
    padding: 16,
  },
  articleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  articleContent: {
    padding: 16,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  articleTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginRight: 12,
  },
  articleSummary: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
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
