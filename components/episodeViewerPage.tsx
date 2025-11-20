import { View } from 'react-native'
import {useEffect} from 'react'
import { useRoute } from '@react-navigation/native'
import Orientation from 'react-native-orientation-locker'

import VideoPlayer from './videoPlayer'

const EpisodeViewerPage = () => {
  const route = useRoute();
  const { episodeLinkBaseUrl, episodeNumber } = (route.params as any) || {};
  const fullUrl = `${episodeLinkBaseUrl}-${episodeNumber}/`;

  useEffect(() => {
    console.log('📱 EpisodeViewerPage mounted - forcing landscape orientation');
    Orientation.lockToLandscape();
    (globalThis as any).setBackgroundBlack?.(true);
    
    return () => {
      console.log('📱 EpisodeViewerPage unmounting - unlocking all orientations');
      Orientation.lockToPortrait();
      (globalThis as any).setBackgroundBlack?.(false);
    };
  }, []);

  

  return (
    <View style={{ 
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      overflow: 'hidden',
      backgroundColor: '#000000',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: '5%'
    }}>
      {/* Video Player Section */}
      <VideoPlayer currentUrl={fullUrl} />
    </View>
  )
}

export default EpisodeViewerPage