import React, { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Orientation from 'react-native-orientation-locker';

import Home from './home';
import SearchPage from './srchPage';
import BookmarkPage from './bookmarkPage';

import AnimeDetails from './animeDetails';
import EpisodeViewerPage from './episodeViewerPage';

import { HomeIcon, SearchIcon, BookmarkIcon } from '../commonFuncs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Root = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: 'transparent',
            background: 'transparent',
            card: 'transparent',
            text: 'white',
            border: 'transparent',
            notification: 'transparent',
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: '400',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System',
              fontWeight: '700',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '900',
            },
          },
        }}
      >
          <Stack.Navigator screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'slide_from_right',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal'
          }}>
              <Stack.Screen name="tabHolder" component={TabHolder} />
              <Stack.Screen name="AnimeDetails" component={AnimeDetails} />
              <Stack.Screen name="EpisodeViewerPage" component={EpisodeViewerPage} />
          </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    );
}

export default Root;

const TabHolder = () => {
    const [isTabBarVisible, setIsTabBarVisible] = useState(true);
    const tabBarOpacity = useRef(new Animated.Value(1)).current;
    const tabBarTranslateY = useRef(new Animated.Value(0)).current;

    // Lock to portrait orientation on mount
    useEffect(() => {
        console.log('📱 TabHolder mounted - locking to portrait');
        Orientation.lockToPortrait();
        
        return () => {
            console.log('📱 TabHolder unmounting - unlocking orientations');
            Orientation.unlockAllOrientations();
        };
    }, []);

    // Function to set tab bar visibility with animation
    const setBarVisibility = (visible: boolean) => {
        // Reduced logging for performance
        // console.log('🎯 setBarVisibility called:', { 
        //   visible, 
        //   currentState: isTabBarVisible,
        //   shouldChange: isTabBarVisible !== visible 
        // });
        
        // Remove the early return check that's causing the bug
        // The animation should always run when called from scroll handler
        
        // console.log(visible ? '📱 Starting SHOW animation' : '📴 Starting HIDE animation');
        setIsTabBarVisible(visible);

        if (visible) {
            // Fade in from bottom
            Animated.parallel([
                Animated.timing(tabBarOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tabBarTranslateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => {
                // console.log('✅ SHOW animation completed');
            });
        } else {
            // Fade out upward
            Animated.parallel([
                Animated.timing(tabBarOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(tabBarTranslateY, {
                    toValue: 100, // Move down by 100 pixels
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => {
                // console.log('✅ HIDE animation completed');
            });
        }
    };

    // Expose the setBarVisibility function globally (you can call this from any component)
    useEffect(() => {
        (globalThis as any).setBarVisibility = setBarVisibility;
        
        // Cleanup when component unmounts
        return () => {
            if ((globalThis as any).setBarVisibility) {
                delete (globalThis as any).setBarVisibility;
            }
        };
    }, []);


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Tab.Navigator screenOptions={{ 
              headerShown: false,
              tabBarStyle: [
                { 
                  backgroundColor: 'rgba(64, 62, 84, 0.63)', // Dark purple with opacity
                  borderTopWidth: 0,
                  elevation: 0,
                  position: 'absolute',
                  bottom: 20, // Lift from bottom
                  marginHorizontal: '5%', // 5% margin on each side = 90% width
                  height: 55,
                  borderRadius: 30, // Capsule shape (half of height)
                  paddingBottom: 0,
                  paddingTop: 0,
                  shadowColor: '#7c3aed',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                },
                {
                  opacity: tabBarOpacity,
                  transform: [{ translateY: tabBarTranslateY }],
                } as any
              ],
              tabBarActiveTintColor: '#7ec9fcff', // Light purple for active
              tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', // Muted white for inactive
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                marginBottom: 8,
              },
              tabBarIconStyle: {
                marginTop: 0,
              },
              tabBarBackground: () => null,
            }}>
                <Tab.Screen 
                  name="Home" 
                  component={Home}
                  options={{
                    tabBarIcon: ({ focused, color, size }) => (
                      <HomeIcon 
                        focused={focused}
                        color={color} 
                        size={size}
                      />
                    ),
                  }}
                />
                <Tab.Screen 
                  name="Search" 
                  component={SearchPage}
                  options={{
                    tabBarIcon: ({ focused, color, size }) => (
                      <SearchIcon 
                        focused={focused}
                        color={color} 
                        size={size}
                      />
                    ),
                  }}
                />
                <Tab.Screen 
                  name="Bookmarks" 
                  component={BookmarkPage}
                  options={{
                    tabBarIcon: ({ focused, color, size }) => (
                      <BookmarkIcon 
                        focused={focused}
                        color={color} 
                        size={size}
                      />
                    ),
                  }}
                />
            </Tab.Navigator>
        </SafeAreaView>
    );
}

