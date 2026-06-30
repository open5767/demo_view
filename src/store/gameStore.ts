import { defineStore } from 'pinia';
import { io, type Socket } from 'socket.io-client';
import { ref } from 'vue';

// Types
export interface Card {
  id: string;
  name: string;
  type: 'deduction' | 'prop' | 'ai';
  description: string;
  icon: string;
  rotation: number;
  image: string;
  effectImage?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  role: string;
  zone: number;
  cards: Card[];
  isActive: boolean;
}

export interface GameState {
  gameId: string;
  status: 'waiting' | 'playing' | 'ended';
  currentPlayer: number;
  players: Player[];
  publicCards: Card[];
  discardPile: Card[];
  lastPlayedCard?: Card;
}

export interface CardEffectConfig {
    url: string;
    type: 'image' | 'video';
}

export interface GameSettings {
  backgroundImage: string;
  effectDuration: number; // seconds
  cardBackImage: string;
  // Per-card effects: key is card name, value is config
  cardEffects: Record<string, CardEffectConfig>;
}

export const useGameStore = defineStore('game', () => {
  const socket = ref<Socket | null>(null);
  const gameState = ref<GameState | null>(null);
  const isConnected = ref(false);
  
  // Settings
  // Load from localStorage if available
  const savedSettings = localStorage.getItem('gameSettings');
  const defaultSettings: GameSettings = {
    backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    effectDuration: 2.0,
    cardBackImage: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2000&auto=format&fit=crop',
    cardEffects: {}
  };
  
  const settings = ref<GameSettings>(savedSettings ? JSON.parse(savedSettings) : defaultSettings);

  function connect() {
    // Connect to backend server
    socket.value = io();

    socket.value.on('connect', () => {
      console.log('Connected to server');
      isConnected.value = true;
    });

    socket.value.on('disconnect', () => {
      console.log('Disconnected from server');
      isConnected.value = false;
    });

    socket.value.on('gameState', (state: GameState | null) => {
      // console.log('Game State Updated:', state);
      gameState.value = state;
    });
    
    socket.value.on('aiResponse', (res: any) => {
        alert(res.message); // Simple alert for demo
    });
    
    // Listen for settings updates from server (if we implement server-side settings)
    socket.value.on('updateSettings', (newSettings: GameSettings) => {
        settings.value = { ...settings.value, ...newSettings };
    });
  }

  function startGame(playerCount: number, cardsPerPlayer: number) {
    socket.value?.emit('startGame', { playerCount, cardsPerPlayer });
  }

  function resetGame() {
      socket.value?.emit('resetGame');
  }

  function playCard(playerId: string, cardId: string) {
    socket.value?.emit('playCard', { playerId, cardId });
  }

  function discardCard(playerId: string, cardId: string) {
    socket.value?.emit('discardCard', { playerId, cardId });
  }

  function aiAction(action: string) {
    socket.value?.emit('aiAction', { action });
  }

  function updateSettings(newSettings: Partial<GameSettings>) {
      settings.value = { ...settings.value, ...newSettings };
      // Save to localStorage
      localStorage.setItem('gameSettings', JSON.stringify(settings.value));
      // Ideally sync with server so all clients see same background
      socket.value?.emit('updateSettings', settings.value);
  }

  return {
    socket,
    gameState,
    isConnected,
    settings,
    connect,
    startGame,
    resetGame,
    playCard,
    discardCard,
    aiAction,
    updateSettings
  };
});
