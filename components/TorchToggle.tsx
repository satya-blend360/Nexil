import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

interface TorchToggleProps {
  size?: number;
  onColor?: string;
  offColor?: string;
}

export default function TorchToggle({ 
  size = 80, 
  onColor = '#000', 
  offColor = '#F0F0F0' 
}: TorchToggleProps) {
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const toggleTorch = async () => {
    if (!permission || !permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsTorchOn(!isTorchOn);
  };

  return (
    <View style={styles.container}>
      {permission?.granted && (
        <CameraView
          style={{ width: 0, height: 0, position: 'absolute' }}
          enableTorch={isTorchOn}
          facing="back"
        />
      )}

      <TouchableOpacity 
        style={[
          styles.button, 
          { width: size, height: size, borderRadius: size / 2 },
          isTorchOn ? { backgroundColor: onColor, borderColor: onColor } : { borderColor: offColor }
        ]} 
        onPress={toggleTorch}
        activeOpacity={0.8}
      >
        <View style={[
          styles.innerCircle, 
          { width: size * 0.375, height: size * 0.375, borderRadius: (size * 0.375) / 2 },
          isTorchOn ? styles.innerCircleOn : styles.innerCircleOff
        ]} />
      </TouchableOpacity>

      {!permission?.granted && (
        <Text style={styles.permissionText}>Tap to enable Torch</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  innerCircle: {
    backgroundColor: '#F0F0F0',
  },
  innerCircleOn: {
    backgroundColor: '#FFF',
  },
  innerCircleOff: {
    backgroundColor: '#F0F0F0',
  },
  permissionText: {
    marginTop: 12,
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
