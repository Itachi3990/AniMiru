import AsyncStorage from '@react-native-async-storage/async-storage';
import { animeCardInfo } from './interfaces';

const BOOKMARKS_PREFIX = 'bookmark_';

/**
 * Store a bookmark using the anime title as the key
 */
export const storeBookmark = async (anime: animeCardInfo): Promise<boolean> => {
  try {
    const key = `${BOOKMARKS_PREFIX}${anime.animeTitle}`;
    const jsonValue = JSON.stringify(anime);
    await AsyncStorage.setItem(key, jsonValue);
    console.log('✅ Bookmark saved:', anime.animeTitle);
    return true;
  } catch (error) {
    console.error('❌ Error storing bookmark:', error);
    return false;
  }
};

/**
 * Get a bookmark by title
 */
export const getBookmark = async (title: string): Promise<animeCardInfo | null> => {
  try {
    const key = `${BOOKMARKS_PREFIX}${title}`;
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue != null) {
      return JSON.parse(jsonValue) as animeCardInfo;
    }
    return null;
  } catch (error) {
    console.error('❌ Error retrieving bookmark:', error);
    return null;
  }
};

/**
 * Check if an anime is bookmarked by title
 */
export const isBookmarked = async (title: string): Promise<boolean> => {
  try {
    const key = `${BOOKMARKS_PREFIX}${title}`;
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error('❌ Error checking bookmark:', error);
    return false;
  }
};

/**
 * Remove a bookmark by title
 */
export const removeBookmark = async (title: string): Promise<boolean> => {
  try {
    const key = `${BOOKMARKS_PREFIX}${title}`;
    await AsyncStorage.removeItem(key);
    console.log('🗑️ Bookmark removed:', title);
    return true;
  } catch (error) {
    console.error('❌ Error removing bookmark:', error);
    return false;
  }
};

/**
 * Get all bookmarks
 */
export const getAllBookmarks = async (): Promise<animeCardInfo[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const bookmarkKeys = keys.filter((key: string) => key.startsWith(BOOKMARKS_PREFIX));
    
    if (bookmarkKeys.length === 0) {
      return [];
    }
    
    const bookmarkPairs = await AsyncStorage.multiGet(bookmarkKeys);
    const bookmarks: animeCardInfo[] = [];
    
    bookmarkPairs.forEach(([key, value]: [string, string | null]) => {
      if (value) {
        try {
          bookmarks.push(JSON.parse(value) as animeCardInfo);
        } catch (error) {
          console.error('❌ Error parsing bookmark:', key, error);
        }
      }
    });
    
    return bookmarks;
  } catch (error) {
    console.error('❌ Error retrieving all bookmarks:', error);
    return [];
  }
};

/**
 * Toggle bookmark (add if not exists, remove if exists)
 */
export const toggleBookmark = async (anime: animeCardInfo): Promise<boolean> => {
  try {
    const bookmarked = await isBookmarked(anime.animeTitle);
    
    if (bookmarked) {
      await removeBookmark(anime.animeTitle);
      return false; // Now unbookmarked
    } else {
      await storeBookmark(anime);
      return true; // Now bookmarked
    }
  } catch (error) {
    console.error('❌ Error toggling bookmark:', error);
    return false;
  }
};

/**
 * Clear all bookmarks
 */
export const clearAllBookmarks = async (): Promise<boolean> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const bookmarkKeys = keys.filter((key: string) => key.startsWith(BOOKMARKS_PREFIX));
    
    if (bookmarkKeys.length > 0) {
      await AsyncStorage.multiRemove(bookmarkKeys);
      console.log('🗑️ All bookmarks cleared');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing bookmarks:', error);
    return false;
  }
};

/**
 * Store password in AsyncStorage
 * @param password - The password to store
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export const storePassword = async (password: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem('pwd', password);
    console.log('✅ Password stored successfully');
    return true;
  } catch (error) {
    console.error('❌ Error storing password:', error);
    return false;
  }
};

/**
 * Get stored password from AsyncStorage
 * @returns Promise<string | null> - The stored password or null if not found
 */
export const getPassword = async (): Promise<string | null> => {
  try {
    const password = await AsyncStorage.getItem('pwd');
    return password;
  } catch (error) {
    console.error('❌ Error retrieving password:', error);
    return null;
  }
};
