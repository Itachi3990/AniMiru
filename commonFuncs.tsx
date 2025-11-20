export   // Decode HTML entities
  const decodeHtmlEntities = (text: string | null) => {
    if (!text) return '';
    return text
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&apos;/g, "'")
      .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  };

      // Episode square styles
export const episodeSquareStyle = {
  width: 40,
  height: 40,
  backgroundColor: 'rgba(139, 69, 19, 0.3)',
  borderRadius: 8,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  marginBottom: 8,
  borderWidth: 1,
  borderColor: 'rgba(139, 69, 19, 0.5)'
};

export const episodeTextStyle = {
  color: '#d2691e',
  fontSize: 14,
  fontWeight: 'bold' as const
};

export const currentEpisodeSquareStyle = {
  width: 40,
  height: 40,
  backgroundColor: 'rgba(52, 211, 153, 0.4)', // Brighter emerald background
  borderRadius: 8,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  marginBottom: 8,
  borderWidth: 2,
  borderColor: '#10b981' // Solid emerald border
};

export const currentEpisodeTextStyle = {
  color: '#ffffff', // White text for better contrast
  fontSize: 14,
  fontWeight: 'bold' as const
};

import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Custom SVG Icons
export const HomeIcon = ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d= "M12 5.69L19 11.19V20H15V14H9V20H5V11.19L12 5.69ZM12 2.1L1 12H4V21H20V12H23L12 2.1Z"
      fill={color}
    />
  </Svg>
);

export const SearchIcon = ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L20 21.49L21.49 20L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z"
      fill={color}
    />
  </Svg>
);

export const BookmarkIcon = ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3ZM17 18L12 15.82L7 18V5H17V18Z"
      fill={color}
    />
  </Svg>
);

// Filled bookmark icon for bookmarked state
export const BookmarkFilledIcon = ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z"
      fill={color}
    />
  </Svg>
);

interface EpisodeGridProps {
  maxEpisodeCount: number;
  onEpisodePress: (episodeNumber: number) => void;
  currentEpisode?: number;
}

export const EpisodeGrid = ({ maxEpisodeCount, onEpisodePress, currentEpisode }: EpisodeGridProps) => {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={Array.from({ length: Math.ceil(maxEpisodeCount / 2) }, (_, index) => index)}
      keyExtractor={(item) => item.toString()}
      style={{ margin: 0, padding: 0 }}
      contentContainerStyle={{ paddingVertical: 0 }}
      renderItem={({ item: columnIndex }) => {
        const firstEpisode = columnIndex * 2 + 1;
        const secondEpisode = columnIndex * 2 + 2;
        
        return (
          <View style={{ marginRight: 8 }}>
            {/* First episode in column */}
            <TouchableOpacity
              style={firstEpisode === currentEpisode ? currentEpisodeSquareStyle : episodeSquareStyle}
              onPress={() => onEpisodePress(firstEpisode)}
            >
              <Text style={firstEpisode === currentEpisode ? currentEpisodeTextStyle : episodeTextStyle}>
                {firstEpisode}
              </Text>
            </TouchableOpacity>
            
            {/* Second episode in column (if it exists) */}
            {secondEpisode <= maxEpisodeCount && (
              <TouchableOpacity
                style={secondEpisode === currentEpisode ? currentEpisodeSquareStyle : episodeSquareStyle}
                onPress={() => onEpisodePress(secondEpisode)}
              >
                <Text style={secondEpisode === currentEpisode ? currentEpisodeTextStyle : episodeTextStyle}>
                  {secondEpisode}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      }}
      initialNumToRender={20}
      maxToRenderPerBatch={10}
      windowSize={10}
      getItemLayout={(data, index) => ({
        length: 48, // width: 40 + marginRight: 8
        offset: 48 * index,
        index,
      })}
    />
  );
};

