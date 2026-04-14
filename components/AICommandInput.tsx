import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Keyboard } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface AICommandInputProps {
  onSend: (text: string) => void;
  isSpeaking: boolean;
  accentColor: string;
}

export default function AICommandInput({ onSend, isSpeaking, accentColor }: AICommandInputProps) {
  const [text, setText] = useState('');
  const { isDarkMode } = useTheme();

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
      Keyboard.dismiss();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#111' : '#F5F5F5' }]}>
      <TextInput
        style={[styles.input, { color: isDarkMode ? '#FFF' : '#000' }]}
        placeholder="Ask Nexil something..."
        placeholderTextColor="#666"
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSend}
        returnKeyType="send"
      />
      <TouchableOpacity 
        onPress={handleSend} 
        disabled={isSpeaking || !text.trim()}
        style={[styles.sendBtn, { backgroundColor: text.trim() ? accentColor : '#333' }]}
      >
        <Ionicons name="arrow-up" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    width: '90%',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
