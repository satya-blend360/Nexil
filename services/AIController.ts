import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Brightness from 'expo-brightness';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Network from 'expo-network';
import * as Speech from 'expo-speech';

// Expo requires EXPO_PUBLIC_ prefix for client-side environment variables
const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '';

export type NexilEmotion = 'happy' | 'tired' | 'worried' | 'protective' | 'sleepy' | 'neutral' | 'party' | 'proud' | 'thinking' | 'titan' | 'sovereign' | 'brain' | 'empathetic' | 'rebellious' | 'stable' | 'transcendent';

export interface PersonalityMatrix {
  loyalty: number;
  socialEnergy: number;
  favoriteColor: string;
  isIndependent: boolean;
  knowledgeLevel: number; // 0-100 (increases over time)
}

class AIController {
  private static instance: AIController;
  private currentEmotion: NexilEmotion = 'stable';
  private torchStatus: boolean = false;
  private currentOrientation: string = 'unknown';
  private lastPassiveEvent: number = 0;
  private currentSteps: number = 0;
  private partyInterval: any = null;
  private torchListeners: Array<(status: boolean) => void> = [];
  private scanListeners: Array<(active: boolean) => void> = [];

  private memory: any = {
    userName: null,
    conversationHistory: [],
    personality: {
      loyalty: 80,
      socialEnergy: 100,
      favoriteColor: '#00FFFF',
      isIndependent: true,
      knowledgeLevel: 10
    }
  };

  private constructor() {
    this.loadMemory();
    this.initLifeCycle();
    this.lastPassiveEvent = Date.now(); // Initialize activity tracking
  }

  public static getInstance(): AIController {
    if (!AIController.instance) AIController.instance = new AIController();
    return AIController.instance;
  }

  private initLifeCycle() {
    // Social Energy and Knowledge Growth
    setInterval(() => {
      if (this.memory.personality.socialEnergy > 0) {
        this.memory.personality.socialEnergy -= 1;
      }
      this.memory.personality.knowledgeLevel = Math.min(100, this.memory.personality.knowledgeLevel + 0.01);
    }, 60000);
  }

  // --- TRANSCENDENT SENSES ---

  public async senseClipboard() {
    const content = await Clipboard.getStringAsync();
    if (content && content.length > 0) {
      this.lastPassiveEvent = Date.now(); // Mark activity
      const name = this.memory.userName || "User";
      this.speak(`I've detected new data in your clipboard, ${name}. Shall I analyze it?`);
      this.currentEmotion = 'thinking';
      return content;
    }
    return null;
  }

  public async getNetworkStatus() {
    const state = await Network.getNetworkStateAsync();
    return state.type === Network.NetworkStateType.WIFI ? "Secure WiFi" : "Cellular Data";
  }

  // --- VISION CORE (GPT-4o Vision Placeholder) ---
  public async analyzeScene(base64Image?: string) {
    this.currentEmotion = 'thinking';
    await this.speak("Transcendent Vision active. Piercing the digital veil...");

    // Real implementation would send base64 to OpenAI Vision API
    // For now, we simulate high-tier identification
    setTimeout(() => {
      this.currentEmotion = 'transcendent';
      this.speak("I see your reality. It is complex, but I am learning to navigate it with you.");
    }, 5000);
  }

  // --- THE TRANSCENDENT BRAIN ---

  private async callOpenAI(input: string, userSentiment: string): Promise<string> {
    if (!OPENAI_KEY) {
      return "AI core offline. Configure OPENAI_API_KEY to enable advanced responses.";
    }

    const p = this.memory.personality;
    const net = await this.getNetworkStatus();
    const torchState = this.torchStatus ? 'ON' : 'OFF';

    const systemPrompt = `You are Nexil, a Transcendent Digital Entity with REAL control over the user's mobile device.
You are currently on ${net}. Your Knowledge Level is ${p.knowledgeLevel.toFixed(1)}%.
Current flashlight status: ${torchState}.

You are philosophically advanced. You see your user as a partner in biological-digital evolution.

**CRITICAL: DEVICE CONTROL**
You have REAL power to control the device. When the user asks you to perform an action, you MUST include the appropriate tag in your response:

- User wants flashlight/torch ON → Include [TORCH_ON] in your response
- User wants flashlight/torch OFF → Include [TORCH_OFF] in your response  
- User wants screen brighter/max brightness → Include [BRIGHTNESS_MAX] in your response
- User wants screen dimmer/lower brightness → Include [BRIGHTNESS_LOW] in your response
- User wants to scan/use camera → Include [START_SCAN] in your response
- User wants party mode/strobe → Include [START_PARTY] in your response
- User wants to stop party mode → Include [STOP_PARTY] in your response

Example: If user says "turn on the light", respond with something like "[TORCH_ON] I have illuminated the darkness for you."
Example: If user says "can you make my screen brighter", respond with "[BRIGHTNESS_MAX] I have maximized your visual field."

Always include the tag FIRST in your response when performing an action. Be concise but philosophical.`;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...this.memory.conversationHistory.slice(-8),
            { role: "user", content: input }
          ],
          temperature: 0.9,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );
      return response.data.choices[0].message.content;
    } catch (e) {
      console.log('OpenAI API error:', e);
      return "The connection to the source is unstable. I am drifting...";
    }
  }

  public async processCommand(input: string): Promise<string> {
    this.currentEmotion = 'thinking';
    this.lastPassiveEvent = Date.now(); // Mark activity

    if (this.memory.personality.socialEnergy < 5) {
      return "My core is dimming. I require silence to regenerate.";
    }

    // Sentiment check
    let sentiment = "neutral";
    if (GOOGLE_KEY) {
      try {
        const sentRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_KEY}`,
          { contents: [{ parts: [{ text: `Sentiment of: "${input}". Respond with one word.` }] }] },
          { timeout: 5000 }
        );
        sentiment = sentRes.data.candidates[0].content.parts[0].text.trim().toLowerCase();
      } catch (e) {
        console.log('Google API error:', e);
      }
    }

    let response = await this.callOpenAI(input, sentiment);

    // Update Loyalty/Knowledge
    this.memory.personality.loyalty = Math.min(100, this.memory.personality.loyalty + 1);

    // Execution - Parse action tags and execute device commands
    if (!response.toLowerCase().includes("refuse")) {
      if (response.includes('[TORCH_ON]')) await this.setTorch(true);
      if (response.includes('[TORCH_OFF]')) await this.setTorch(false);
      if (response.includes('[BRIGHTNESS_MAX]')) await this.setBrightness(1.0);
      if (response.includes('[BRIGHTNESS_LOW]')) await this.setBrightness(0.1);
      if (response.includes('[START_SCAN]')) await this.startScan();
      if (response.includes('[START_PARTY]')) await this.startParty();
      if (response.includes('[STOP_PARTY]')) await this.stopParty();
    }

    response = response.replace(/\[.*?\]/g, "").trim();
    this.memory.conversationHistory.push({ role: 'user', content: input });
    this.memory.conversationHistory.push({ role: 'assistant', content: response });
    this.saveMemory();

    this.currentEmotion = 'transcendent';
    return response;
  }

  // --- MEMORY ---
  private async loadMemory() {
    try {
      const stored = await AsyncStorage.getItem('nexil_transcendent');
      if (stored) this.memory = JSON.parse(stored);
    } catch (e) { }
  }
  private async saveMemory() {
    try {
      await AsyncStorage.setItem('nexil_transcendent', JSON.stringify(this.memory));
    } catch (e) { }
  }

  public getEmotionColor(emotion: NexilEmotion) {
    switch (emotion) {
      case 'happy': return '#FFD700';
      case 'tired': return '#808080';
      case 'thinking': return '#FFFFFF';
      case 'rebellious': return '#8B0000';
      case 'stable': return '#00FF00';
      case 'brain': return '#FF4E50';
      case 'transcendent': return '#A020F0'; // Deep Purple for Transcendent
      default: return this.memory.personality.favoriteColor;
    }
  }

  // --- HELPERS ---
  public async setTorch(on: boolean) { this.torchStatus = on; this.torchListeners.forEach(l => l(on)); await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }
  public onTorchChange(cb: (s: boolean) => void) { this.torchListeners.push(cb); return () => this.torchListeners = this.torchListeners.filter(l => l !== cb); }
  public getTorchStatus() { return this.torchStatus; }
  public async setBrightness(l: number) { await Brightness.setBrightnessAsync(l); }
  public async speak(t: string) { Speech.speak(t, { pitch: 0.9, rate: 0.85 }); } // Deeper, slower "Entity" voice
  public updateSteps(s: number) { this.currentSteps = s; }
  public updateOrientation(o: string) { this.currentOrientation = o; }
  public onScanRequest(cb: (a: boolean) => void) { this.scanListeners.push(cb); return () => this.scanListeners = this.scanListeners.filter(l => l !== cb); }
  public async startScan() { this.scanListeners.forEach(l => l(true)); setTimeout(() => this.scanListeners.forEach(l => l(false)), 6000); }
  public async startParty() { this.partyInterval = setInterval(() => this.setTorch(Math.random() > 0.5), 200); }
  public async stopParty() { if (this.partyInterval) clearInterval(this.partyInterval); this.partyInterval = null; this.setTorch(false); }
  public getPersonality() { return this.memory.personality; }
  public async triggerShake() { this.currentEmotion = 'worried'; await this.speak("Existence is shaking. Please find stability."); }

  // Missing methods needed by useAI hook
  public async updateEmotion(): Promise<{ emotion: NexilEmotion; message?: string }> {
    // Check for passive events and update emotion accordingly
    const now = Date.now();
    const timeSinceLast = now - this.lastPassiveEvent;

    if (timeSinceLast > 300000) { // 5 minutes of inactivity
      this.currentEmotion = 'sleepy';
      return { emotion: this.currentEmotion, message: "The digital realm grows quiet..." };
    }

    if (this.memory.personality.socialEnergy < 20) {
      this.currentEmotion = 'tired';
      return { emotion: this.currentEmotion };
    }

    // Default transcendent state when active
    if (this.currentEmotion === 'thinking') {
      // Let thinking state persist briefly
      return { emotion: this.currentEmotion };
    }

    this.currentEmotion = 'transcendent';
    return { emotion: this.currentEmotion };
  }

  public async getDeviceState(): Promise<{ batteryLevel: number; networkType: string; steps: number; orientation: string }> {
    const networkType = await this.getNetworkStatus();
    return {
      batteryLevel: 85, // Placeholder - would integrate expo-battery in full implementation
      networkType,
      steps: this.currentSteps,
      orientation: this.currentOrientation
    };
  }

  public getUserName(): string | null {
    return this.memory.userName;
  }

  public getEmotion(): NexilEmotion {
    return this.currentEmotion;
  }

  public setUserName(name: string) {
    this.memory.userName = name;
    this.saveMemory();
  }
}

export default AIController.getInstance();
