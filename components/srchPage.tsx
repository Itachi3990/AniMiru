import { useEffect, useState, useRef, useCallback } from 'react'
import { ScrollView, Text, FlatList, View, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { quickSearchItem } from '../interfaces'

import SearchBar from './srchBar'
import QuickSearchCard from './quickSearchCard'

import { textStyles } from '../styles/textStyles'

const SearchPage = () => {
  const navigation = useNavigation();
  const [quickSearchResults, setQuickSearchResults] = useState<quickSearchItem[]>([])
  const [isShowingAllResults, setIsShowingAllResults] = useState<boolean>(false)
  const [showLoadingIndicator, setShowLoadingIndicator] = useState<boolean>(false);
  const [fetchNextBatch, setFetchNextBatch] = useState<(() => Promise<boolean>) | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [currentScrollOffset, setCurrentScrollOffset] = useState(0);
  const endOfListOffset = useRef(0);
  const lastScrollY = useRef(0);
  const isTabBarHidden = useRef(false);

  // Navigation handler - memoized to prevent re-renders
  const handleCardPress = useCallback((postLink: string) => {
    (navigation as any).navigate('AnimeDetails', { postLink });
  }, [navigation]);

  // Function to scroll FlatList downward from current position
  const scrollDown = () => {
    if (flatListRef.current) {
      const newOffset = endOfListOffset.current + 350; // Add 350 pixels to current position
      flatListRef.current.scrollToOffset({
        offset: newOffset,
        animated: true,
      });
    }
  };

  // Scroll handler with improved logic
  const handleScroll = (event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const difference = currentY - lastScrollY.current;
    
    // Reduced logging for better performance
    // console.log('📍 Scroll Event:', { 
    //   currentY: currentY.toFixed(0), 
    //   lastY: lastScrollY.current.toFixed(0), 
    //   diff: difference.toFixed(0),
    //   hidden: isTabBarHidden.current 
    // });
    
    // Significant scroll movement required (reduce jitter)
    if (Math.abs(difference) > 10) {
      if (difference > 0 && currentY > 100 && !isTabBarHidden.current) {
        // Scrolling down significantly - hide tab bar
        console.log('🔽 Scroll DOWN detected - calling setBarVisibility(false)');
        isTabBarHidden.current = true;
        if ((globalThis as any).setBarVisibility) {
          (globalThis as any).setBarVisibility(false);
        } else {
          console.error('❌ setBarVisibility not found on globalThis');
        }
      } else if (difference < 0 && isTabBarHidden.current) {
        // Scrolling up significantly - show tab bar
        console.log('🔼 Scroll UP detected - calling setBarVisibility(true)');
        isTabBarHidden.current = false;
        if ((globalThis as any).setBarVisibility) {
          (globalThis as any).setBarVisibility(true);
        } else {
          console.error('❌ setBarVisibility not found on globalThis');
        }
      }
      
      lastScrollY.current = currentY;
    }
    
    setCurrentScrollOffset(currentY);
  };


  useEffect(() => {
    if(quickSearchResults.length < 4) (globalThis as any).setBarVisibility(true);
  }, [quickSearchResults]);


  return (
    <View style={{flex: 1, paddingTop: 40, paddingHorizontal: 24, backgroundColor: 'transparent'}}>
      <SearchBar 
        setQuickSearchResults={setQuickSearchResults}
        setIsShowingAllResults={setIsShowingAllResults} 
        setShowLoadingIndicator={setShowLoadingIndicator}
        onFetchNextBatch={(fetchFunction) => setFetchNextBatch(() => fetchFunction)}
      />


      <View style={{height: 50, justifyContent: 'center', alignItems: 'center'}}>
        {!showLoadingIndicator ?
          <Text style={[textStyles.neonGlow, {textAlign: 'center'}]}>Press Enter for full search</Text>
        :
          <ActivityIndicator size="large" color="#abddefff" />
        }
      </View>

      {isShowingAllResults ? (
        <FlatList
          ref={flatListRef}
          data={quickSearchResults}
          keyExtractor={(item) => item.post_link + item.ID.toString()}
          renderItem={({item}) => <QuickSearchCard details={item} onPress={handleCardPress} />}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={8}
          getItemLayout={(data, index) => (
            {length: 120, offset: 120 * index, index}
          )}
          onEndReached={async () => {
            console.log('reached');
            endOfListOffset.current = currentScrollOffset;
            if (fetchNextBatch) {
              setShowLoadingIndicator(true);
              const hasMore = await fetchNextBatch();
              if(hasMore) scrollDown();
              setShowLoadingIndicator(false);
            }
          }}
          onEndReachedThreshold={0.3}
        />
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {quickSearchResults.map((details) => (
            <QuickSearchCard key={details.post_link} details={details} onPress={handleCardPress} />
          ))}
        </ScrollView>
      )}
    </View>
  )
}

export default SearchPage