import { Text, View, Image, TouchableOpacity } from 'react-native'
import React, { memo, useCallback } from 'react'
import { quickSearchItem } from '../interfaces';

import { decodeHtmlEntities } from '../commonFuncs';

const QuickSearchCard = memo(({details, onPress} : {details : quickSearchItem, onPress: (postLink: string) => void}) => {

  // Memoize the press handler
  const handlePress = useCallback(() => {
    onPress(details.post_link);
  }, [details.post_link, onPress]);



  return (
    <TouchableOpacity 
      style={{flexDirection: 'row', width: '100%', backgroundColor: 'transparent', padding: 10, borderRadius: 10}}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Image Section - 35% */}
      <View style={{width: '35%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#FFF'}}>
        <Image 
          source={{ uri: details.post_image }} 
          style={{width: '100%', aspectRatio: 3/4}}
          resizeMode="cover"
        />
      </View>
      
      {/* Title Section - 65% */}
      <View style={{width: '65%', justifyContent: 'center', paddingHorizontal: 12}}>
        <Text style={{fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 4}}>
          {decodeHtmlEntities(details.post_title)}
        </Text>
        <Text style={{fontSize: 14, fontWeight: '400', color: '#AAA', marginTop: 2}}>
          {details.post_type}{'  \u00B7  '}{details.post_ep}{'  \u00B7  '}{details.post_sub}
        </Text>
        <Text style={{fontSize: 14, fontWeight: '400', color: '#AAA', marginTop: 2}}>
          {details.post_genres}
        </Text>
      </View>
    </TouchableOpacity>
  )
});

QuickSearchCard.displayName = 'QuickSearchCard';

export default QuickSearchCard