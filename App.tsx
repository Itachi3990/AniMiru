import React, { useState, useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle, ActivityIndicator } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { getPassword } from './storageFuncs';
import { analyzePwd } from './encryption';

import Root from './components/root';
import AuthScreen from './components/authScreen';

type GradientStop = {
  offset: string;
  color: string;
  opacity: number;
};

type GlowConfig = {
  id: string;
  style: StyleProp<ViewStyle>;
  stops: GradientStop[];
};

function Glow({ id, style, stops }: GlowConfig) {
  return (
    <Svg style={[styles.glowBase, style]} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <RadialGradient
          id={id}
          cx="50%"
          cy="50%"
          rx="50%"
          ry="50%"
          fx="50%"
          fy="50%"
          gradientUnits="userSpaceOnUse"
        >
          {stops.map((stop) => (
            <Stop
              key={`${id}-${stop.offset}`}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

function App(): React.JSX.Element {
  const [isBackgroundBlack, setIsBackgroundBlack] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);

  // Function to set background to black or neon
  const setBackgroundBlack = (value: boolean) => {
    console.log(`🎨 Setting background to ${value ? 'BLACK' : 'NEON'}`);
    setIsBackgroundBlack(value);
  };

  // Expose the setBackgroundBlack function globally
  useEffect(() => {
    (globalThis as any).setBackgroundBlack = setBackgroundBlack;
    (globalThis as any).setIsAuthorized = setIsAuthorized;
    
    verifyAuthorization();

    return () => {
      if ((globalThis as any).setBackgroundBlack) {
        delete (globalThis as any).setBackgroundBlack;
      }
    };
  }, []);

  const verifyAuthorization = async () => {
    const storedPwd = await getPassword();
    const status = analyzePwd(storedPwd);
    setIsAuthorized(status === 'ok');
    setIsVerificationComplete(true);
  }

  return (
    <View style={[
      styles.container,
      isBackgroundBlack && styles.containerBlack
    ]}>
      {!isBackgroundBlack && (
        <View style={styles.backgroundLayer}>
          {GLOW_CONFIGS.map((config) => (
            <Glow key={config.id} {...config} />
          ))}
        </View>
      )}

      {/* Content */}
      {isVerificationComplete ?
      (<View style={styles.content}>
        {isAuthorized ? <Root /> : <AuthScreen />} 
      </View>)
      :(<View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7ec9fcff" />
      </View>)
      }
     

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a15',
  },
  containerBlack: {
    backgroundColor: '#000000',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f0f1e',
  },
  glowBase: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
  },
  glowPurpleTop: {
    top: -200,
    left: -100,
    width: 180,
    height: 160,
    borderRadius: 120,
    transform: [{ rotate: '12deg' }, { scaleX: 0.94 }, { scaleY: 0.76 }],
  },
  glowPurpleCenter: {
    top: '40.5%',
    left: '50%',
    width: 120,
    height: 120,
    marginLeft: -66,
    marginTop: -78,
    borderRadius: 100,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.62 }],
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const GLOW_CONFIGS: GlowConfig[] = [
  {
    id: 'glow-purple-top',
    style: styles.glowPurpleTop,
    stops: [
      { offset: '0%', color: '#c694fcff', opacity: 0.2 },
      { offset: '35%', color: '#c084fc', opacity: 0.12 },
      { offset: '100%', color: '#7c3aed', opacity: 0 },
    ],
  },
  {
    id: 'glow-purple-center',
    style: styles.glowPurpleCenter,
    stops: [
      { offset: '0%', color: '#73adf9ff', opacity: 0.16 },
      { offset: '48%', color: '#a5b4fc', opacity: 0.08 },
      { offset: '100%', color: '#4338ca', opacity: 0 },
    ],
  }
];

export default App;
