import { View, Text, ActivityIndicator, ScrollView, Animated } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useIsFocused } from '@react-navigation/native';

import AnimeCard from './animeCard'
import { animeCardInfo } from '../interfaces';
import { textStyles } from '../styles/textStyles';
import { decodeHtmlEntities } from '../commonFuncs';

const Home = () => {

  const dom = (globalThis as any).dom;

  const isFocused = useIsFocused();
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false);
  const pop_today = useRef<animeCardInfo[]>([]);
  const latest_releases = useRef<animeCardInfo[]>([]);
  const lastScrollY = useRef(0);
  const isTabBarHidden = useRef(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  const extractDivContent = (html: string, className: string): string[] => {
    const results: string[] = [];
    let searchIndex = 0;
    
    while (searchIndex < html.length) {
      // Find the opening tag starting from searchIndex
      const openingRegex = new RegExp(`<div\\s+class="${className}"[^>]*>`, 'i');
      const remainingHtml = html.substring(searchIndex);
      const openingMatch = remainingHtml.match(openingRegex);
      
      if (!openingMatch || openingMatch.index === undefined) break;
      
      const absoluteStartIndex = searchIndex + openingMatch.index + openingMatch[0].length;
      let depth = 1;
      let currentIndex = absoluteStartIndex;
      
      // Loop through the string to find the matching closing tag
      while (depth > 0 && currentIndex < html.length) {
        const nextOpenIndex = html.indexOf('<div', currentIndex);
        const nextCloseIndex = html.indexOf('</div>', currentIndex);
        
        if (nextCloseIndex === -1) break;
        
        if (nextOpenIndex !== -1 && nextOpenIndex < nextCloseIndex) {
          // Found another opening div
          depth++;
          currentIndex = nextOpenIndex + 4; // Move past '<div'
        } else {
          // Found a closing div
          depth--;
          if (depth === 0) {
            // This is our matching closing tag
            results.push(html.substring(absoluteStartIndex, nextCloseIndex));
            searchIndex = nextCloseIndex + 6; // Move past '</div>' to search for next match
            break;
          }
          currentIndex = nextCloseIndex + 6; // Move past '</div>'
        }
      }
      
      // If we didn't find a matching closing tag, break to avoid infinite loop
      if (depth !== 0) break;
    }
    
    return results;
  };

  const extractArticleData = (article: string) => {
    // Extract href from <a> tag
    const hrefRegex = /<a\s+href="([^"]+)"/i;
    const hrefMatch = article.match(hrefRegex);
    const href = hrefMatch ? hrefMatch[1] : null;

    // Extract title from <div class="tt"> (text only, excluding inner tags)
    const ttRegex = /<div\s+class="tt"[^>]*>([\s\S]*?)<\/div>/i;
    const ttMatch = article.match(ttRegex);
    let title = null;
    if (ttMatch) {
      // Remove all complete HTML tags with their content (like <h2>...</h2>)
      let ttContent = ttMatch[1];
      // First, remove complete tag pairs (e.g., <h2>...</h2>)
      ttContent = ttContent.replace(/<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
      // Then remove any remaining standalone tags
      ttContent = ttContent.replace(/<[^>]+>/g, '');
      title = ttContent.trim();
    }

    // Extract img src
    const imgRegex = /<img\s+[^>]*src="([^"]+)"/i;
    const imgMatch = article.match(imgRegex);
    const imgSrc = imgMatch ? imgMatch[1] : null;

    return { animeLink: href, animeTitle: decodeHtmlEntities(title), animeImage: imgSrc } as animeCardInfo;
  };

  // Scroll handler to toggle tab bar visibility
  const handleScroll = (event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const difference = currentY - lastScrollY.current;
    
    // Significant scroll movement required (reduce jitter)
    if (Math.abs(difference) > 10) {
      if (difference > 0 && currentY > 100 && !isTabBarHidden.current) {
        // Scrolling down significantly - hide tab bar
        isTabBarHidden.current = true;
        if ((globalThis as any).setBarVisibility) {
          (globalThis as any).setBarVisibility(false);
        }
      } else if (difference < 0 && isTabBarHidden.current) {
        // Scrolling up significantly - show tab bar
        isTabBarHidden.current = false;
        if ((globalThis as any).setBarVisibility) {
          (globalThis as any).setBarVisibility(true);
        }
      }
      
      lastScrollY.current = currentY;
    }
  };


  const init = async () => {
    const response = await fetch(`https://${dom}/`);
    const htmlData = await response.text();

    const contents = extractDivContent(htmlData, 'excstf');
    console.log("Number of excstf divs found:", contents.length);
    
    if (contents.length == 2) {
      // Use the first matching div (or you can combine all of them)
      const content = contents[0];
      
      // Now extract all articles from the content
      const regex = /<article\s+class="bs"\s+itemscope="itemscope"[^>]*>([\s\S]*?)<\/article>/gi;
      const pop_today_article_matches = content.match(regex);

      if (pop_today_article_matches) {
        console.log("Number of articles found:", pop_today_article_matches.length);

        // Extract data from each article
        const pop_today_: animeCardInfo[] = pop_today_article_matches.map((article: string) => extractArticleData(article));
        pop_today.current = pop_today_;
      }

      const latest_content = contents[1];

      if (latest_content) {
        // Now extract all articles from the content
        const regex = /<article\s+class="bs"\s+itemscope="itemscope"[^>]*>([\s\S]*?)<\/article>/gi;
        const latest_article_matches = latest_content.match(regex);

        if (latest_article_matches) {
          console.log("Number of latest articles found:", latest_article_matches.length);

          // Extract data from each article
          const latest_releases_: animeCardInfo[] = latest_article_matches.map((article: string) => extractArticleData(article));
          latest_releases.current = latest_releases_;
        }
      }
    }

    setIsLoadingCompleted(true);

  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (isFocused) {
      // Force show tab bar when home screen is focused
      isTabBarHidden.current = false;
      if ((globalThis as any).setBarVisibility) {
        (globalThis as any).setBarVisibility(true);
      }
    }
  }, [isFocused]);

  // Trigger fade-up animation when content loads
  useEffect(() => {
    if (isLoadingCompleted) {
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
  }, [isLoadingCompleted]);

  if (!isLoadingCompleted) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'transparent' 
      }}>
        <ActivityIndicator size="large" color="#7ec9fcff" />
        <Text style={{ 
          color: 'rgba(255, 255, 255, 0.85)', 
          marginTop: 12,
          fontSize: 14
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: 'transparent' }}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <Animated.View 
        style={{ 
          paddingTop: 40,
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }]
        }}
      >
        {/* Popular Today Section */}
        <Text style={[
          textStyles.neonGlow,
          { 
            fontSize: 24, 
            fontWeight: 'bold', 
            marginBottom: 16,
            paddingHorizontal: 24
          }
        ]}>
          Popular Today
        </Text>

        {/* Horizontal ScrollView for Popular Today */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingHorizontal: 24,
            gap: 16
          }}
          style={{ marginBottom: 32 }}
        >
          {pop_today.current.map((anime, index) => (
            <AnimeCard key={index} details={anime}/>
          ))}
        </ScrollView>

        {/* Latest Releases Section */}
        <Text style={[
          textStyles.neonGlow,
          { 
            fontSize: 24, 
            fontWeight: 'bold', 
            marginBottom: 16,
            paddingHorizontal: 24
          }
        ]}>
          Latest Releases
        </Text>

        {/* Two-row horizontal ScrollView for Latest Releases */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingHorizontal: 24,
            flexDirection: 'column',
            gap: 16
          }}
          style={{ marginBottom: 32 }}
        >
          {/* First Row */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {latest_releases.current
              .filter((_, index) => index % 2 === 0)
              .map((anime, index) => (
                <AnimeCard key={`latest-row1-${index}`} details={anime}/>
              ))
            }
          </View>

          {/* Second Row */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {latest_releases.current
              .filter((_, index) => index % 2 === 1)
              .map((anime, index) => (
                <AnimeCard key={`latest-row2-${index}`} details={anime}/>
              ))
            }
          </View>
        </ScrollView>
      </Animated.View>
    </ScrollView>
  )
}

export default Home