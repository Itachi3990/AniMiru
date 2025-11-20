import { View, Text, FlatList, Dimensions, ActivityIndicator, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useFocusEffect } from '@react-navigation/native'

import AnimeCard from './animeCard'
import { animeCardInfo } from '../interfaces'
import { getAllBookmarks } from '../storageFuncs'
import { textStyles } from '../styles/textStyles'

const screenWidth = Dimensions.get('window').width;

const BookmarkPage = () => {
  const [bookmarks, setBookmarks] = useState<animeCardInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  // Load bookmarks
  const loadBookmarks = async () => {
    setIsLoading(true);
    const allBookmarks = await getAllBookmarks();
    setBookmarks(allBookmarks);
    setIsLoading(false);
  };

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks();
  }, []);

  // Reload bookmarks when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadBookmarks();
    }, [])
  );

  // Trigger fade-up animation when content loads
  useEffect(() => {
    if (!isLoading) {
      // Reset animation values
      fadeAnim.setValue(0);
      translateYAnim.setValue(30);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'transparent' 
      }}>
        <ActivityIndicator size="large" color="#fb7185" />
        <Text style={{ 
          color: 'rgba(255, 255, 255, 0.85)', 
          marginTop: 12,
          fontSize: 14
        }}>
          Loading bookmarks...
        </Text>
      </View>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Animated.View 
        style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'transparent',
          paddingHorizontal: 24,
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }]
        }}
      >
        <Text style={[
          textStyles.neonGlow,
          { 
            fontSize: 24, 
            fontWeight: 'bold',
            marginBottom: 12,
            textAlign: 'center'
          }
        ]}>
          No Bookmarks Yet
        </Text>
        <Text style={{ 
          color: 'rgba(255, 255, 255, 0.7)', 
          fontSize: 14,
          textAlign: 'center',
          lineHeight: 20
        }}>
          Start bookmarking your favorite anime to see them here!
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={{ 
        flex: 1, 
        backgroundColor: 'transparent',
        opacity: fadeAnim,
        transform: [{ translateY: translateYAnim }]
      }}
    >
      <FlatList
        data={bookmarks}
        keyExtractor={(item, index) => `${item.animeTitle}-${index}`}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: 40, 
          paddingHorizontal: 16,
          paddingBottom: 100 // Extra padding for tab bar
        }}
        columnWrapperStyle={{ 
          justifyContent: 'space-between',
          marginBottom: 16
        }}
        ListHeaderComponent={
          <Text style={[
            textStyles.neonGlow,
            { 
              fontSize: 24, 
              fontWeight: 'bold', 
              marginBottom: 24,
              paddingHorizontal: 8
            }
          ]}>
            My Bookmarks ({bookmarks.length})
          </Text>
        }
        renderItem={({ item }) => (
          <View style={{ width: (screenWidth - 48) / 3 }}>
            <AnimeCard details={item} />
          </View>
        )}
      />
    </Animated.View>
  )
}

export default BookmarkPage