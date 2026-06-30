import { EventEmitter } from 'events';

// Data Models
export interface Card {
  id: string;
  name: string;
  type: 'deduction' | 'prop' | 'ai';
  description: string;
  icon: string;
  rotation: number;
  image: string; // URL for card image
  effectImage?: string; // URL for effect/background image when played
}

export interface Player {
  id: string;
  name: string;
  avatar: string; // URL or identifier
  role: string;   // e.g., 'Detective', 'Suspect', 'Witness'
  zone: number;
  cards: Card[];
  isActive: boolean;
}

export interface GameState {
  gameId: string;
  status: 'waiting' | 'playing' | 'ended';
  currentPlayer: number; // zone index
  players: Player[];
  publicCards: Card[];
  discardPile: Card[];
  lastPlayedCard?: Card; // Track last played card for effects
}

// Mock Data - Electric Emergency Command System Theme
const CARD_TEMPLATES = [
  { 
    name: '故障报告', 
    type: 'deduction', 
    description: '收到变电站跳闸报告', 
    icon: 'file-text',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&q=80',
    effectImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' 
  },
  { 
    name: '现场勘查', 
    type: 'deduction', 
    description: '无人机传回受损画面', 
    icon: 'camera',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300&q=80',
    effectImage: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&q=80'
  },
  { 
    name: '负荷研判', 
    type: 'deduction', 
    description: '分析当前电网负荷趋势', 
    icon: 'activity',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&q=80',
    effectImage: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80'
  },
  { 
    name: '应急发电车', 
    type: 'prop', 
    description: '部署临时保电措施', 
    icon: 'truck',
    image: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=300&q=80',
    effectImage: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&q=80'
  },
  { 
    name: '道路受阻', 
    type: 'prop', 
    description: '抢修车辆通行困难', 
    icon: 'alert-triangle',
    image: 'https://images.unsplash.com/photo-1545459720-aac3e5c2d0c1?w=300&q=80',
    effectImage: 'https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=800&q=80'
  },
  { 
    name: '物资调配', 
    type: 'prop', 
    description: '紧急调拨抢修变压器', 
    icon: 'box',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&q=80',
    effectImage: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80'
  },
  { 
    name: '灾情推演', 
    type: 'ai', 
    description: 'AI预测次生灾害风险', 
    icon: 'cpu',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&q=80',
    effectImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
  },
  { 
    name: '舆情监测', 
    type: 'ai', 
    description: 'AI分析社交媒体关注度', 
    icon: 'globe',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&q=80',
    effectImage: 'https://images.unsplash.com/photo-1526304640152-d4619684e484?w=800&q=80'
  },
];

// Electric Emergency Roles
const ROLES = [
  '应急总指挥', 
  '电网调度员', 
  '现场抢修长', 
  '物资保障员', 
  '通信保障员', 
  '新闻发言人', 
  '安全监察员', 
  '客户服务员'
];

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Molly',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Pepper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Willow',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Garfield',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lola',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
];

class GameService extends EventEmitter {
  private gameState: GameState | null = null;
  
  constructor() {
    super();
  }

  // Initialize Game
  startGame(playerCount: number, cardsPerPlayer: number): GameState {
    const players: Player[] = [];
    
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: `player_${i}`,
        name: `指挥席位 ${i + 1}`,
        avatar: AVATARS[i % AVATARS.length],
        role: ROLES[i % ROLES.length],
        zone: i,
        cards: this.generateCards(cardsPerPlayer),
        isActive: false
      });
    }

    this.gameState = {
      gameId: `game_${Date.now()}`,
      status: 'playing',
      currentPlayer: 0,
      players,
      publicCards: [],
      discardPile: [],
      lastPlayedCard: undefined
    };

    // Set first player active
    this.gameState.players[0].isActive = true;

    return this.gameState;
  }

  getGameState(): GameState | null {
    return this.gameState;
  }

  resetGame(): GameState | null {
      this.gameState = null;
      return null;
  }

  // Play Card
  playCard(playerId: string, cardId: string): GameState | null {
    if (!this.gameState) return null;

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return null;

    const cardIndex = player.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return null;

    const [card] = player.cards.splice(cardIndex, 1);
    
    // Add to public area
    this.gameState.publicCards.push(card);
    
    // Set last played card to trigger effects
    this.gameState.lastPlayedCard = card;

    // End turn logic (simple: next player)
    this.nextTurn();

    return this.gameState;
  }

  // Discard Card
  discardCard(playerId: string, cardId: string): GameState | null {
    if (!this.gameState) return null;

    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return null;

    const cardIndex = player.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return null;

    const [card] = player.cards.splice(cardIndex, 1);
    this.gameState.discardPile.push(card);

    this.nextTurn();

    return this.gameState;
  }

  private nextTurn() {
    if (!this.gameState) return;
    
    // Deactivate current
    const currentZone = this.gameState.currentPlayer;
    const currentPlayer = this.gameState.players.find(p => p.zone === currentZone);
    if (currentPlayer) currentPlayer.isActive = false;

    // Activate next
    const nextZone = (currentZone + 1) % this.gameState.players.length;
    this.gameState.currentPlayer = nextZone;
    const nextPlayer = this.gameState.players.find(p => p.zone === nextZone);
    if (nextPlayer) nextPlayer.isActive = true;
  }

  private generateCards(count: number): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < count; i++) {
      const template = CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)];
      cards.push({
        id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: template.name,
        type: template.type as any,
        description: template.description,
        icon: template.icon,
        image: template.image,
        effectImage: template.effectImage,
        rotation: 0 // Will be set by frontend based on zone
      });
    }
    return cards;
  }
}

export const gameService = new GameService();
