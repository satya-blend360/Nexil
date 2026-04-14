# Nexil - AI Companion App

## Project Overview

Nexil is an AI-powered Expo/React Native utility app that provides comprehensive device management through an intelligent assistant. The AI has a persistent personality that evolves through interactions and drives the entire UX through emotion-color mapping and contextual awareness.

## Code Style & Architecture

**Component Patterns**: Use functional components with TypeScript interfaces. Follow the established composition pattern where [app/index.tsx](app/index.tsx) orchestrates 13 specialized components rather than complex navigation.

**Architecture**: 
- **AI-First Design**: AIController singleton manages global AI state and personality
- **Event-Driven**: Components subscribe to AI service events for real-time updates  
- **Context + Hooks**: ThemeContext for global theming, useAI hook for AI interactions
- **File-Based Routing**: Simple Expo Router structure with minimal navigation complexity

**Naming Conventions**:
- Components: PascalCase descriptive names (`AIFriendOrb`, `BatteryStatus`)  
- Services: Singular + "Controller" (`AIController.ts`)
- Hooks: camelCase with "use" prefix (`useAI.ts`)

## Build and Test

```bash
# Install dependencies
npm install

# Development
npm start                # Start Expo development server
npm run android          # Run on Android device/emulator  
npm run ios             # Run on iOS device/simulator
npm run web             # Run in web browser

# Code quality
npm run lint            # Run ESLint

# Reset project structure (removes example code)
npm run reset-project
```

## TypeScript Conventions

- **Strict mode enabled** - always provide explicit types
- **Path aliases**: Use `@/*` for all internal imports (`@/services/AIController`)
- **Interfaces**: Define explicit interfaces for all component props and data structures
- **Union types** for controlled values: `type NexilEmotion = 'happy' | 'tired' | 'thinking'`

```typescript
// Standard import order
import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Battery from 'expo-battery';
import { useTheme } from '@/constants/ThemeContext';
import AIController from '@/services/AIController';
```

## AI & Personality System

**Core Pattern**: The AI personality drives the entire app experience through emotion-color mapping and contextual device awareness.

- **Singleton Service**: AIController manages persistent personality matrix (loyalty, socialEnergy, knowledgeLevel, favoriteColor)
- **Real-time Integration**: AI monitors device state (battery, sensors, clipboard) for contextual responses
- **Emotion-UI Mapping**: UI colors dynamically change based on AI emotional state (16 emotions supported)
- **Command Execution**: AI responses can trigger system actions via command tags `[TORCH_ON]`, `[BRIGHTNESS_MAX]`
- **Persistent Memory**: Conversation history and personality growth stored via AsyncStorage

**Critical**: AI personality state should persist across app restarts and influence all user interactions.

## Native Integration Patterns

**Permission Management**: Always check permissions before native feature usage
```typescript
const [permission, requestPermission] = useCameraPermissions();
if (!permission?.granted) {
  const { granted } = await requestPermission();
  if (!granted) return;
}
```

**Subscription Cleanup**: Always cleanup native subscriptions to prevent memory leaks
```typescript
useEffect(() => {
  const subscription = Battery.addBatteryLevelListener(callback);
  return () => subscription?.remove();
}, []);
```

**Android Specifics**: The app requires extensive Android permissions (notifications, camera, location, sensors). See [withAndroidNotificationListener.js](withAndroidNotificationListener.js) for required manifest modifications.

## Styling Approach

**Dynamic Theming**: Components use context-based theming with real-time AI-driven color updates
```typescript
const { accentColor, isDarkMode, setAccentColor } = useTheme();
style={[styles.card, { 
  backgroundColor: isDarkMode ? '#1A1A1A' : '#F9F9F9',
  borderColor: accentColor 
}]}
```

**Animation**: Use useRef + Animated API with proper cleanup for complex animations

## Common Pitfalls

1. **API Keys**: Currently hardcoded in AIController - should migrate to environment variables
2. **Platform Differences**: Camera/torch behavior varies between Android/iOS  
3. **Permission Races**: Multiple permission requests needed - handle gracefully
4. **Memory Management**: AI service maintains device state listeners - ensure proper cleanup
5. **Notification Access**: Android notification listener requires special manifest configuration

## Architecture Decisions

- **Composition over Navigation**: Single main screen composing multiple specialized components
- **AI as State Manager**: AIController acts as central state coordinator beyond just AI responses  
- **Sensor-Driven UX**: App UX responds to physical device state (orientation, battery, movement)
- **Persistent Personality**: AI grows and learns through usage, becoming more personalized over time

See [README.md](README.md) for basic Expo setup documentation.