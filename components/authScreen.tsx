import { View, Text, TextInput, StyleSheet, Image } from 'react-native'
import React, { useState } from 'react'
import { textStyles } from '../styles/textStyles'
import { analyzePwd } from '../encryption'
import { storePassword } from '../storageFuncs'

const AuthScreen = () => {
  const [inputValue, setInputValue] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Validate password whenever input changes
  const handleSubmit = (text: string) => {
    const res = analyzePwd(text);
    if(res === 'ok') {

    storePassword(text).then(() => {
        (globalThis as any).setIsAuthorized(true);
    });
    }
    else setStatusMessage(res);
  };  return (
    <View style={styles.container}>
      <Image 
        source={require('../icon.png')} 
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={[textStyles.neonGlow, styles.helloText]}>Piracy is Bad!</Text>
      <Text style={styles.subText}>This App is for Demonstration Purposes Only!</Text>
      
      {statusMessage && (
        <Text style={[
          styles.statusText,
          statusMessage === 'Authorized' ? styles.statusAuthorized : styles.statusError
        ]}>
          {statusMessage}
        </Text>
      )}
      
      <TextInput
        style={styles.input}
        value={inputValue}
        onSubmitEditing={() => handleSubmit(inputValue)}
        onChangeText={setInputValue}
        placeholder="Enter Password"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 90,
  },
  icon: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  helloText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusAuthorized: {
    color: '#4ade80', // Green for authorized
  },
  statusError: {
    color: '#ef4444', // Red for wrong/expired
  },
  input: {
    width: '100%',
    maxWidth: 400,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 16,
  },
});

export default AuthScreen