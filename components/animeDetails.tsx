import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, FlatList, Animated } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'

import { decodeHtmlEntities, EpisodeGrid, BookmarkIcon, BookmarkFilledIcon } from '../commonFuncs';
import { toggleBookmark, isBookmarked } from '../storageFuncs';
import { textStyles } from '../styles/textStyles';

const AnimeDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { postLink } = (route.params as any) || {};

    const [isLoadingComplete, setIsLoadingComplete] = useState<boolean>(false);
    const [isBookmarkedState, setIsBookmarkedState] = useState<boolean>(false);

    const title = useRef<string>('');
    const alternativeTitle = useRef<string>('');
    const status = useRef<string>('');
    const studio = useRef<string>('');
    const released = useRef<string>('');
    const genres = useRef<string>('');
    const duration = useRef<string>('');
    const synopsis = useRef<string[]>([]);
    const imageUrl = useRef<string>('');
    const season = useRef<string>('');
    const type = useRef<string>('');
    const episodes = useRef<string>('');
    const producers = useRef<string[]>([]);
    const episodeLinkBaseUrl = useRef<string>('');
    const maxEpisodeCount_ = useRef<number>(1);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(30)).current;

    // Bookmark handler
    const handleBookmarkPress = async () => {
      const animeData = {
        animeTitle: title.current,
        animeLink: postLink,
        animeImage: imageUrl.current,
      };
      
      const newBookmarkState = await toggleBookmark(animeData);
      setIsBookmarkedState(newBookmarkState);
    };

    // Episode press handler
    const handleEpisodePress = (episodeNumber: number) => {
      (navigation as any).navigate('EpisodeViewerPage', {
        episodeLinkBaseUrl: episodeLinkBaseUrl.current,
        episodeNumber: episodeNumber
      });
    };

  if(!postLink)
  return (
    <View style={{ paddingTop: 40, paddingHorizontal: 24, backgroundColor: 'transparent' }}>
      <Text style={{ color: 'white', fontSize: 18, marginBottom: 16 }}>AnimeDetails</Text>
      <Text style={{ color: 'white', fontSize: 14 }}>Something went wrong!</Text>
    </View>
  )

    const init = async () => {
        try {
            const response = await fetch(postLink);
            const htmlData = await response.text();

            // Regex to extract img src from <div class="thumb">
            const thumbRegex = /<div\s+class="thumb"[^>]*>([\s\S]*?)<\/div>/i;
            const imgSrcRegex = /<img[^>]+src=["']([^"']+)["']/i;
            
            const thumbMatch = thumbRegex.exec(htmlData);
            if (thumbMatch) {
                const thumbContent = thumbMatch[1];
                const imgMatch = imgSrcRegex.exec(thumbContent);
                if (imgMatch) imageUrl.current = imgMatch[1];
            }

            // Regex to extract title from <h1 class="entry-title">
            const titleRegex = /<h1\s+class="entry-title"[^>]*>([\s\S]*?)<\/h1>/i;
            const titleMatch = titleRegex.exec(htmlData);
            if (titleMatch)                 
                title.current = decodeHtmlEntities(titleMatch[1].trim());
            
            // Regex to extract alternate names from <span class="alter">
            const alterRegex = /<span\s+class="alter"[^>]*>([\s\S]*?)<\/span>/i;
            const alterMatch = alterRegex.exec(htmlData);
            if (alterMatch) {
                const alterContent = alterMatch[1]
                    .replace(/<[^>]*>/g, '') // Remove HTML tags
                    .trim();
                alternativeTitle.current = decodeHtmlEntities(alterContent);
            }

            // Regex to extract status from <span><b>Status:</b> ...</span>
            const statusRegex = /<span[^>]*>[\s\S]*?<b>Status:?<\/b>\s*([^<]+?)<\/span>/i;
            const statusMatch = statusRegex.exec(htmlData);
            if (statusMatch) {
                const statusContent = statusMatch[1]
                    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
                    .trim();
                status.current = decodeHtmlEntities(statusContent);
            }

            // Regex to extract studio name from <span><b>Studio:</b> <a href="...">Studio Name</a></span>
            const studioRegex = /<span[^>]*>[\s\S]*?<b>Studio:?<\/b>\s*<a[^>]*>([^<]+)<\/a>[\s\S]*?<\/span>/i;
            const studioMatch = studioRegex.exec(htmlData);
            if (studioMatch) {
                const studioContent = studioMatch[1]
                    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
                    .trim();
                studio.current = decodeHtmlEntities(studioContent);
            }

            // Regex to extract released date from <span...><b>Released:</b> ...</span>
            const releasedRegex = /<span[^>]*>[\s\S]*?<b>Released:?<\/b>\s*([^<]+?)<\/span>/i;
            const releasedMatch = releasedRegex.exec(htmlData);
            if (releasedMatch) {
                const releasedContent = releasedMatch[1]
                    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
                    .trim();
                released.current = decodeHtmlEntities(releasedContent);
                // console.log('Extracted released date:', released.current);
            }

            // Regex to extract duration from <span><b>Duration:</b> ...</span>
            const durationRegex = /<span[^>]*>[\s\S]*?<b>Duration:?<\/b>\s*([^<]+?)<\/span>/i;
            const durationMatch = durationRegex.exec(htmlData);
            if (durationMatch) {
                const durationContent = durationMatch[1]
                    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
                    .trim();
                duration.current = decodeHtmlEntities(durationContent);
                // console.log('Extracted duration:', duration.current);
            }

            // Regex to extract season from <span><b>Season:</b> <a href="...">Season Name</a></span>
            const seasonRegex = /<span[^>]*>[\s\S]*?<b>Season:?<\/b>\s*<a[^>]*>([^<]+)<\/a>[\s\S]*?<\/span>/i;
            const seasonMatch = seasonRegex.exec(htmlData);
            if (seasonMatch) {
                const seasonContent = seasonMatch[1]
                    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
                    .trim();
                season.current = decodeHtmlEntities(seasonContent);
                // console.log('Extracted season:', season.current);
            }

            // Regex to extract type from <span><b>Type:</b> ...</span>
            const typeRegex = /<span[^>]*>[\s\S]*?<b>Type:?<\/b>\s*([^<]+?)<\/span>/i;
            const typeMatch = typeRegex.exec(htmlData);
            if (typeMatch) {
                const typeContent = typeMatch[1]
                    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
                    .trim();
                type.current = decodeHtmlEntities(typeContent);
                // console.log('Extracted type:', type.current);
            }

            // Regex to extract episodes from <span><b>Episodes:</b> ...</span>
            const episodesRegex = /<span[^>]*>[\s\S]*?<b>Episodes:?<\/b>\s*([^<]+?)<\/span>/i;
            const episodesMatch = episodesRegex.exec(htmlData);
            if (episodesMatch) {
                const episodesContent = episodesMatch[1]
                    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
                    .trim();
                episodes.current = decodeHtmlEntities(episodesContent);
                // console.log('Extracted episodes:', episodes.current);
            }

            // Regex to extract producers from <span class="split"><b>Producers:</b> <a>...</a>, <a>...</a></span>
            const producersSpanRegex = /<span\s+class="split"[^>]*>[\s\S]*?<b>Producers:?<\/b>([\s\S]*?)<\/span>/i;
            const producersSpanMatch = producersSpanRegex.exec(htmlData);
            if (producersSpanMatch) {
                const producersContent = producersSpanMatch[1];
                // Extract all producer names from <a> tags within the span
                const producerLinkRegex = /<a[^>]*>([^<]+)<\/a>/g;
                const producerNames: string[] = [];
                let producerMatch;
                while ((producerMatch = producerLinkRegex.exec(producersContent)) !== null) {
                    const producerName = decodeHtmlEntities(producerMatch[1].trim());
                    producerNames.push(producerName);
                }
                producers.current = producerNames;
                //console.log('Extracted producers:', producers.current);
            }

            // Regex to extract genres from <div class="genxed"><a>...</a> <a>...</a></div>
            const genresRegex = /<div\s+class="genxed"[^>]*>([\s\S]*?)<\/div>/i;
            const genresMatch = genresRegex.exec(htmlData);
            if (genresMatch) {
                const genresContent = genresMatch[1];
                // Extract all genre names from <a> tags within the div
                const genreLinkRegex = /<a[^>]*>([^<]+)<\/a>/g;
                const genreNames: string[] = [];
                let genreMatch;
                while ((genreMatch = genreLinkRegex.exec(genresContent)) !== null) {
                    const genreName = decodeHtmlEntities(genreMatch[1].trim());
                    genreNames.push(genreName);
                }
                genres.current = genreNames.join(', ');
                //console.log('Extracted genres:', genres.current);
            }

            // Regex to extract synopsis from <div class="entry-content" itemprop="description">...</div>
            const synopsisRegex = /<div\s+class="entry-content"\s+itemprop="description"[^>]*>([\s\S]*?)<\/div>/i;
            const synopsisMatch = synopsisRegex.exec(htmlData);
            if (synopsisMatch) {
                const synopsisContent = synopsisMatch[1];
                // Extract all paragraphs from <p> tags within the div
                const paragraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
                const paragraphs: string[] = [];
                let paragraphMatch;
                while ((paragraphMatch = paragraphRegex.exec(synopsisContent)) !== null) {
                    const paragraphText = paragraphMatch[1]
                        .replace(/<[^>]*>/g, '') // Remove any HTML tags within the paragraph
                        .trim();
                    if (paragraphText) { // Only add non-empty paragraphs
                        paragraphs.push(decodeHtmlEntities(paragraphText));
                    }
                }
                synopsis.current = paragraphs;

            }

            // Regex to extract href from <a href="..." class="item ep-item" data-number="1" ...>
            const episodeLinkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*class="[^"]*item\s+ep-item[^"]*"[^>]*data-number="1"[^>]*>/i;
            const episodeLinkMatch = episodeLinkRegex.exec(htmlData);
            if (episodeLinkMatch) {
                let baseUrl = episodeLinkMatch[1];
                // Remove "-1/" or "-1" FROM THE END strictly, to create base URL
                baseUrl = baseUrl.replace(/-1\/?$/, '');
                episodeLinkBaseUrl.current = baseUrl;
            }


            //logic above was for animedetails urls, now for episode urls
            if(isEpisodeURL(postLink)){
              //remove the last part "-xx" from the postLink to get the base url
              const baseUrl = postLink.replace(/-\d+\/?$/i, '').replace(/\/+$/,'');
              episodeLinkBaseUrl.current = baseUrl;
              

              // Extract title from <h2 itemprop="partOfSeries">
              const episodeTitleRegex = /<h2\s+itemprop="partOfSeries"[^>]*>([\s\S]*?)<\/h2>/i;
              const episodeTitleMatch = episodeTitleRegex.exec(htmlData);
              if (episodeTitleMatch) {
                const episodeTitle = episodeTitleMatch[1]
                  .replace(/<[^>]*>/g, '') // Remove any HTML tags
                  .trim();
                title.current = decodeHtmlEntities(episodeTitle);
              }

              // Extract synopsis from <div class="desc mindes alldes">
              //console.log('htmlData for episode synopsis:', htmlData);
              const episodeSynopsisRegex = /<div\s+class="desc mindes"[^>]*>([\s\S]*?)<\/div>/i;
              const episodeSynopsisMatch = episodeSynopsisRegex.exec(htmlData);
              //console.log('episodeSynopsisMatch:', episodeSynopsisMatch);
              if (episodeSynopsisMatch) {
                let synopsisContent = episodeSynopsisMatch[1];
                // Remove all complete HTML tags with their content (like <span>...</span>)
                synopsisContent = synopsisContent.replace(/<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
                // Remove any remaining standalone tags
                synopsisContent = synopsisContent.replace(/<[^>]+>/g, '');
                const cleanedSynopsis = synopsisContent.trim();
                if (cleanedSynopsis) {
                  synopsis.current = [decodeHtmlEntities(cleanedSynopsis)];
                }
              }
              
              
            }



            // Regex to get max episodes from <li class="ep-page-item"> or <li class="ep-page-item active">
            const episodePageRegex = /<li[^>]*class="[^"]*ep-page-item[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
            const episodeRanges: string[] = [];
            let episodePageMatch;
            
            while ((episodePageMatch = episodePageRegex.exec(htmlData)) !== null) {
                const rangeText = episodePageMatch[1]
                    .replace(/<[^>]*>/g, '') // Remove HTML tags
                    .trim();
                if (rangeText && rangeText.includes('-')) {
                    episodeRanges.push(rangeText);
                }
            }
            
            let maxEpisodeCount = 0;
            episodeRanges.forEach(range => {
                // Extract the second number from ranges like "1101-1150"
                const rangeMatch = range.match(/(\d+)-(\d+)/);
                if (rangeMatch) {
                    const endEpisode = parseInt(rangeMatch[2]);
                    if (endEpisode > maxEpisodeCount) {
                        maxEpisodeCount = endEpisode;
                    }
                }
            });
            
            maxEpisodeCount_.current = maxEpisodeCount;          

        } catch (error) {
            console.error('Error fetching anime details:', error);
        } finally {
            setIsLoadingComplete(true);
        }
    }

  useEffect(() => {
    init();
  }, [postLink]);

  // Check bookmark status when component loads
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (title.current) {
        const bookmarked = await isBookmarked(title.current);
        setIsBookmarkedState(bookmarked);
      }
    };
    
    if (isLoadingComplete) {
      checkBookmarkStatus();
    }
  }, [isLoadingComplete]);

  // Trigger fade-up animation when content loads
  useEffect(() => {
    if (isLoadingComplete) {
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
  }, [isLoadingComplete]);

  const isEpisodeURL = (url :string) => {
    return /episode-\d+\/?$/.test(url);
  }


  if(!isLoadingComplete)
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40, paddingHorizontal: 24, backgroundColor: 'transparent' }}>
            <ActivityIndicator size="large" color="#d2691e" />
            <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 12 }}>Loading...</Text>
        </View>
    )


    return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: 'transparent' }}
      contentContainerStyle={{ paddingTop: 40, paddingHorizontal: 24, paddingBottom: 15 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }]
        }}
      >
      {/* Header section with image and title */}
      <View style={{ flexDirection: 'row', width: '100%', marginBottom: 24 }}>
        {/* Image section */}
        <View style={{ width: '35%', paddingRight: 16 }}>
          <View style={{ 
            aspectRatio: 3/4, 
            borderRadius: 12, 
            overflow: 'hidden', 
            backgroundColor: '#333' 
          }}>
            {imageUrl.current ? (
              <Image 
                source={{ uri: imageUrl.current }} 
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                  No Image
                </Text>
              </View>
            )}
          </View>
          
          {/* Bookmark Button */}
          <TouchableOpacity
            style={{
              backgroundColor: isBookmarkedState ? 'rgba(251, 113, 133, 0.3)' : 'rgba(251, 113, 133, 0.2)',
              borderWidth: 1.5,
              borderColor: '#fb7185',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 18,
              flexDirection: 'row',
              gap: 6,
            }}
            activeOpacity={0.7}
            onPress={handleBookmarkPress}
          >
            {isBookmarkedState ? (
              <BookmarkFilledIcon color="#fb7185" size={16} focused={false} />
            ) : (
              <BookmarkIcon color="#fb7185" size={16} focused={false} />
            )}
            <Text style={{
              color: '#fb7185',
              fontSize: 12,
              fontWeight: '600',
            }}>
              {isBookmarkedState ? 'Bookmarked' : 'Bookmark'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title section */}
        <View style={{ width: '65%', justifyContent: 'flex-start' }}>
          <Text style={[
            textStyles.neonGlow,
            { 
              fontSize: 20, 
              fontWeight: 'bold', 
              marginBottom: 8,
              lineHeight: 26
            }
          ]}>
            {title.current || 'Loading...'}
          </Text>
          
          {alternativeTitle.current ? (
            <Text style={{ 
              fontSize: 14, 
              color: 'rgba(255, 255, 255, 0.7)', 
              marginBottom: 12,
              fontStyle: 'italic'
            }}>
              {alternativeTitle.current}
            </Text>
          ) : null}

          {/* Status, Type, Episodes in a row */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {status.current ? (
              <Text style={{ 
                fontSize: 12, 
                color: '#4ade80', // Green for status
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                marginRight: 8,
                marginBottom: 4,
                fontWeight: '600'
              }}>
                {status.current}
              </Text>
            ) : null}

            {type.current ? (
              <Text style={{ 
                fontSize: 12, 
                color: '#60a5fa', // Blue for type
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                marginRight: 8,
                marginBottom: 4,
                fontWeight: '600'
              }}>
                {type.current}
              </Text>
            ) : null}

            {episodes.current ? (
              <Text style={{ 
                fontSize: 12, 
                color: '#f59e0b', // Orange for episodes
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                marginRight: 8,
                marginBottom: 4,
                fontWeight: '600'
              }}>
                {episodes.current} eps
              </Text>
            ) : null}
          </View>

          {/* Studio and Season */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {studio.current ? (
              <Text style={{ 
                fontSize: 12, 
                color: '#a78bfa', // Purple for studio
                backgroundColor: 'rgba(167, 139, 250, 0.1)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                marginRight: 8,
                marginBottom: 4,
                fontWeight: '600'
              }}>
                {studio.current}
              </Text>
            ) : null}

            {season.current ? (
              <Text style={{ 
                fontSize: 12, 
                color: '#fb7185', // Pink for season
                backgroundColor: 'rgba(251, 113, 133, 0.1)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                marginRight: 8,
                marginBottom: 4,
                fontWeight: '600'
              }}>
                {season.current}
              </Text>
            ) : null}
          </View>

          {/* Duration and Released */}
          {(duration.current || released.current) ? (
            <View style={{ marginTop: 4 }}>
              {duration.current ? (
                <Text style={{ 
                  fontSize: 11, 
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: 2
                }}>
                  Duration: {duration.current}
                </Text>
              ) : null}

              {released.current ? (
                <Text style={{ 
                  fontSize: 11, 
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  Released: {released.current}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      {/* Episode Count Section */}
      {maxEpisodeCount_.current > 0 ? (
        <View style={{ marginBottom: 24 }}>
          <Text style={[
            textStyles.neonGlow,
            { 
              fontSize: 18, 
              fontWeight: 'bold', 
              marginBottom: 12
            }
          ]}>
            Episodes ({maxEpisodeCount_.current})
          </Text>
          
          <EpisodeGrid
            maxEpisodeCount={maxEpisodeCount_.current}
            onEpisodePress={handleEpisodePress}
          />
        </View>
      ) : null}

      {/* Synopsis Section */}
      {synopsis.current.length > 0 ? (
        <View style={{ marginBottom: 24 }}>
          <Text style={[
            textStyles.neonGlow,
            { 
              fontSize: 18, 
              fontWeight: 'bold', 
              marginBottom: 12
            }
          ]}>
            Synopsis
          </Text>
          
          {synopsis.current.map((paragraph, index) => (
            <Text 
              key={index}
              style={{ 
                fontSize: 14, 
                color: 'rgba(255, 255, 255, 0.85)', 
                lineHeight: 22,
                marginBottom: index < synopsis.current.length - 1 ? 16 : 0,
                textAlign: 'justify'
              }}
            >
              {paragraph}
            </Text>
          ))}
        </View>
      ) : null}

      {/* Genres Section */}
      {genres.current ? (
        <View style={{ marginBottom: 24 }}>
          <Text style={[
            textStyles.neonGlow,
            { 
              fontSize: 18, 
              fontWeight: 'bold', 
              marginBottom: 12
            }
          ]}>
            Genres
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {genres.current.split(', ').map((genre, index) => (
              <Text 
                key={index}
                style={{ 
                  fontSize: 12, 
                  color: '#34d399', // Emerald green for genres
                  backgroundColor: 'rgba(52, 211, 153, 0.1)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  marginRight: 8,
                  marginBottom: 8,
                  fontWeight: '500',
                  lineHeight: 16, // Fixed line height for consistent height
                  textAlignVertical: 'center', // Center text vertically
                  includeFontPadding: false, // Remove extra font padding on Android
                  height: 28 // Fixed height for all capsules
                }}
              >
                {genre.trim()}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      {/* Producers Section */}
      {producers.current.length > 0 ? (
        <View style={{ marginBottom: 24 }}>
          <Text style={[
            textStyles.neonGlow,
            { 
              fontSize: 18, 
              fontWeight: 'bold', 
              marginBottom: 12
            }
          ]}>
            Producers
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {producers.current.map((producer, index) => (
              <Text 
                key={index}
                style={{ 
                  fontSize: 12, 
                  color: '#14b8a6', // Teal for producers
                  backgroundColor: 'rgba(20, 184, 166, 0.1)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  marginRight: 8,
                  marginBottom: 8,
                  fontWeight: '500',
                  lineHeight: 16, // Fixed line height for consistent height
                  textAlignVertical: 'center', // Center text vertically
                  includeFontPadding: false, // Remove extra font padding on Android
                  height: 28 // Fixed height for all capsules
                }}
              >
                {producer.trim()}
              </Text>
            ))}
          </View>
        </View>
      ) : null}
      </Animated.View>
    </ScrollView>
  )
}

export default AnimeDetails