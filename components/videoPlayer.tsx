import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
interface VideoPlayerProps {
  currentUrl: string;
}

const VideoPlayer = ({ currentUrl }: VideoPlayerProps) => {
  const webViewRef = useRef<any>(null);
  const [isInjectionComplete, setIsInjectionComplete] = useState(false);

  useEffect(() => {
    setIsInjectionComplete(false);
  }, [currentUrl]);

  // Helper to extract origin (protocol + // + host) without relying on URL.origin
  const getOrigin = (url: string): string | null => {
    const match = url.match(/^(https?:)\/\/([^\/\?#]+)(?:[\/\?#]|$)/i);
    return match ? `${match[1]}//${match[2]}` : null;
  };

  // Store allowed origin to block external redirects
  const allowedOriginRef = useRef<string | null>(getOrigin(currentUrl));

  // Function to get current page HTML and hide everything except #pembed
  const getPageSource = () => {
    webViewRef.current?.injectJavaScript(`
      (function() {
        // Hide everything except the pembed div
        var pembed = document.getElementById('pembed');
        if (pembed) {
          // Set black background on pembed
          pembed.style.backgroundColor = '#000000';
          
          // Hide all direct children of body except pembed's ancestors
          var bodyChildren = document.body.children;
          for (var i = 0; i < bodyChildren.length; i++) {
            var child = bodyChildren[i];
            // Check if this element contains pembed
            if (!child.contains(pembed) && child !== pembed) {
              child.style.display = 'none';
            }
          }
          
          // Hide siblings and ancestors' siblings of pembed
          var current = pembed;
          while (current && current !== document.body) {
            var parent = current.parentElement;
            if (parent) {
              var siblings = parent.children;
              for (var j = 0; j < siblings.length; j++) {
                var sibling = siblings[j];
                if (sibling !== current && !sibling.contains(pembed)) {
                  sibling.style.display = 'none';
                }
              }
            }
            current = parent;
          }
          
          // Remove padding/margin and set black background on body and html
          document.body.style.margin = '0';
          document.body.style.padding = '0';
          document.body.style.backgroundColor = '#000000';
          document.documentElement.style.margin = '0';
          document.documentElement.style.padding = '0';
          document.documentElement.style.backgroundColor = '#000000';
        }

        // Notify React Native that injection is complete
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'INJECTION_COMPLETE' }));
      })();
    `);
  };

  // Handle messages from WebView (for fullscreen requests)
  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'INJECTION_COMPLETE') {
        setIsInjectionComplete(true);
      }
    } catch (e) {
      console.log('Error parsing message:', e);
    }
  };

  // Prevent navigation to different origin and block popups
  const handleShouldStartLoadWithRequest = (request: any) => {
    const { url } = request;
    
    // Allow about:blank and initial load
    if (!url || url === 'about:blank') return true;
    
    // Check if same origin
    const reqOrigin = getOrigin(url);
    if (allowedOriginRef.current && reqOrigin === allowedOriginRef.current) {
      return true;
    }
    
    // Block external navigation
    console.log(`Blocked navigation to ${url}`);
    return false;
  };

  // Fallback: stop and revert if navigation still happens
  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    if (!url) return;
    
    const navOrigin = getOrigin(url);
    if (allowedOriginRef.current && navOrigin && navOrigin !== allowedOriginRef.current) {
      // Stop loading and go back
      webViewRef.current?.stopLoading?.();
      webViewRef.current?.goBack?.();
      console.log(`Detected external navigation to ${url} — reverted.`);
    }
  };

  return (
    <View style={styles.container}>
      {/* WebView Section */}
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          onLoadEnd={getPageSource}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onNavigationStateChange={handleNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          setSupportMultipleWindows={false}
          allowsFullscreenVideo={true}
          style={[
            styles.webview,
            !isInjectionComplete && styles.hiddenWebview
          ]}
        />
        
        {/* Loading Overlay */}
        {!isInjectionComplete && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#000',
  },
  webviewContainer: {
    height: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  webview: {
    flex: 1,
  },
  hiddenWebview: {
    opacity: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default VideoPlayer;