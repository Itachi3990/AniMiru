import { View, Text, Image, StyleSheet, TouchableOpacity, DimensionValue } from 'react-native'
import React from 'react'
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'
import { useNavigation } from '@react-navigation/native'
import { animeCardInfo } from '../interfaces';



const AnimeCard = ({details, width_} : {details: animeCardInfo, width_: DimensionValue}) => {

    const navigation = useNavigation();

    const handlePress = () => {
      (navigation as any).navigate('AnimeDetails', { postLink: details.animeLink });
    };
    
    return (
      <TouchableOpacity 
        style={[styles.card, { width: width_ }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Image */}
        <Image 
          source={{ uri: details.animeImage }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay using SVG */}
        <Svg style={styles.gradient} width="100%" height="100%">
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="black" stopOpacity="0" />
              <Stop offset="70%" stopColor="black" stopOpacity="0" />
              <Stop offset="100%" stopColor="black" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
        </Svg>
        
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {details.animeTitle}
          </Text>
        </View>
      </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 3 / 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
})

export default AnimeCard