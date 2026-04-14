import { useState, useEffect, useCallback } from 'react';
import AIController, { NexilEmotion, PersonalityMatrix } from '@/services/AIController';
import { useTheme } from '@/constants/ThemeContext';

export function useAI() {
  const [emotion, setEmotion] = useState<NexilEmotion>('stable');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [personality, setPersonality] = useState<PersonalityMatrix>(AIController.getPersonality());
  const { setAccentColor } = useTheme();

  const updateNexil = useCallback(async () => {
    const { emotion: newEmotion, message } = await AIController.updateEmotion();
    setEmotion(newEmotion);
    setPersonality({ ...AIController.getPersonality() });
    
    const color = AIController.getEmotionColor(newEmotion);
    setAccentColor(color);

    if (message && message !== lastMessage) {
      setLastMessage(message);
      setIsSpeaking(true);
      await AIController.speak(message);
      setTimeout(() => setIsSpeaking(false), 4000);
    }
  }, [lastMessage, setAccentColor]);

  const interact = async () => {
    setIsSpeaking(true);
    
    // Transcendent Sense: Check clipboard on tap
    const clipboardData = await AIController.senseClipboard();
    if (clipboardData) {
        setLastMessage(`Sensed data: "${clipboardData.substring(0, 20)}..."`);
        setTimeout(() => setIsSpeaking(false), 3000);
        return;
    }

    const state = await AIController.getDeviceState();
    const name = AIController.getUserName();
    const greeting = name ? `Core stable, ${name}.` : "Core stable.";
    const response = `${greeting} System energy is at ${Math.round(state.batteryLevel)}%.`;

    await AIController.speak(response);
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  const sendMessage = async (text: string) => {
    setIsSpeaking(true);
    const response = await AIController.processCommand(text);
    
    const currentEmotion = AIController.getEmotion();
    setEmotion(currentEmotion);
    setPersonality({ ...AIController.getPersonality() });
    setAccentColor(AIController.getEmotionColor(currentEmotion));

    setLastMessage(response);
    await AIController.speak(response);
    
    const duration = Math.max(2000, response.length * 80);
    setTimeout(() => setIsSpeaking(false), duration);
    return response;
  };

  useEffect(() => {
    updateNexil();
    const interval = setInterval(updateNexil, 5000); // Check more frequently for Singularity/Transcendent
    return () => clearInterval(interval);
  }, [updateNexil]);

  return {
    emotion,
    isSpeaking,
    interact,
    sendMessage,
    lastMessage,
    personality,
    updateNexil
  };
}
