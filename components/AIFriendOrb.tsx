import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, TouchableOpacity, View, Text } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';
import AIController, { NexilEmotion } from '@/services/AIController';

interface AIFriendOrbProps {
  emotion: NexilEmotion;
  isSpeaking: boolean;
  onPress: () => void;
}

export default function AIFriendOrb({ emotion, isSpeaking, onPress }: AIFriendOrbProps) {
  const { accentColor } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const auraAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Faster pulse when speaking
    if (isSpeaking) {
      pulse.stop();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulse.start();
    }

    return () => pulse.stop();
  }, [isSpeaking, pulseAnim]);

  useEffect(() => {
    // Aura/Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(auraAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(auraAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Constant rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();
  }, [auraAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const auraScale = auraAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const auraOpacity = auraAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  const getEmotionColor = () => {
    switch (emotion) {
      case 'happy': return '#FFD700';
      case 'tired': return '#808080';
      case 'worried': return '#FF4500';
      case 'sleepy': return '#4169E1';
      case 'proud': return '#00FF7F';
      case 'party': return '#FF00FF';
      case 'thinking': return '#FFFFFF';
      default: return accentColor;
    }
  };

  const emotionColor = getEmotionColor();

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.touchArea}>
        {/* Aura Background */}
        <Animated.View style={[
          styles.aura,
          { 
            backgroundColor: emotionColor,
            transform: [{ scale: auraScale }],
            opacity: auraOpacity 
          }
        ]} />
        
        <Animated.View style={[
          styles.outerRing,
          { 
            borderColor: emotionColor,
            transform: [{ scale: pulseAnim }, { rotate: spin }] 
          }
        ]}>
          <View style={[styles.innerOrb, { backgroundColor: emotionColor }]} />
        </Animated.View>
      </TouchableOpacity>
      <Text style={[styles.emotionText, { color: emotionColor }]}>
        {emotion.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    width: 200,
    height: 200,
  },
  touchArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aura: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  outerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  innerOrb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  emotionText: {
    marginTop: 20,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 4,
    opacity: 0.8,
  },
});
