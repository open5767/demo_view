<template>
  <div ref="pixiContainer" class="w-full h-screen bg-slate-900 overflow-hidden relative touch-none">
    <!-- UI Overlay -->
    <div class="absolute top-4 left-4 text-white z-10 pointer-events-none">
      <h1 class="text-xl font-bold">Touch Table Card Demo</h1>
      <p class="text-sm opacity-70">Status: {{ store.gameState?.status || 'Connecting...' }}</p>
    </div>

    <!-- User Info (Top Right) -->
   <div class="absolute top-4 right-4 z-20 flex items-center gap-3">
     <div v-if="authStore.isAuthenticated" class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 flex items-center gap-3">
       <img :src="authStore.user?.avatar" alt="Avatar" class="w-8 h-8 rounded-full" />
       <div class="text-white">
         <div class="text-sm font-semibold">{{ authStore.user?.username }}</div>
         <div class="text-xs text-gray-300">{{ authStore.user?.email }}</div>
       </div>
       <button @click="handleLogout" 
               class="ml-2 px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white text-xs rounded transition">
         登出
       </button>
     </div>
   </div>

    <!-- Settings Button (Top Left) -->
    <div class="absolute top-16 left-4 z-20">
        <button @click="showSettings = !showSettings" 
                class="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 text-sm">
          {{ showSettings ? '关闭设置' : '打开设置' }}
        </button>
    </div>

    <!-- Settings Panel -->
    <div v-if="showSettings" class="absolute top-28 left-4 bg-white/90 p-4 rounded-lg shadow-xl z-30 w-80 text-black">
        <h3 class="font-bold mb-3 border-b pb-2">演示设置</h3>
        
        <div class="mb-4">
            <label class="block text-xs font-bold mb-1">桌面背景图片 URL</label>
            <input v-model="localSettings.backgroundImage" 
                   @change="updateSetting('backgroundImage', localSettings.backgroundImage)"
                   class="w-full text-xs p-1 border rounded" />
        </div>

        <div class="mb-4">
            <label class="block text-xs font-bold mb-1">特效停留时间 (秒)</label>
            <input type="number" v-model.number="localSettings.effectDuration" 
                   @change="updateSetting('effectDuration', localSettings.effectDuration)"
                   step="0.5" min="0.5" max="10"
                   class="w-full text-xs p-1 border rounded" />
        </div>
        
        <div class="mb-4 border-t pt-2 bg-gray-50 p-2 rounded">
            <label class="block text-xs font-bold mb-2">卡牌特效配置 (按名称)</label>
            
            <select v-model="selectedCardName" class="w-full text-xs p-1 border rounded mb-2">
                <option value="" disabled>选择卡牌...</option>
                <option v-for="name in knownCardNames" :key="name" :value="name">{{ name }}</option>
            </select>
            
            <div v-if="selectedCardName">
                <label class="block text-[10px] font-bold mb-1">特效 URL ({{ selectedCardName }})</label>
                
                <!-- File Input for Local Video -->
                <div class="mb-2">
                    <label class="block text-[10px] text-gray-600 mb-1">选择本地文件 (推荐)</label>
                    <input type="file" accept="video/*,image/*" @change="handleFileUpload" 
                           class="w-full text-xs p-1 border rounded bg-white" />
                </div>

                <div class="text-xs text-red-500 mb-1" v-if="currentCardEffect.url && currentCardEffect.url.includes('C:')">
                     注意: 浏览器无法直接访问本地绝对路径
                </div>
                <input v-model="currentCardEffect.url" 
                       placeholder="或输入网络 URL..."
                       class="w-full text-xs p-1 border rounded mb-1" />
                       
                <div class="flex space-x-2 mb-2">
                    <label class="text-xs flex items-center">
                        <input type="radio" v-model="currentCardEffect.type" value="image" class="mr-1"> 图片
                    </label>
                    <label class="text-xs flex items-center">
                        <input type="radio" v-model="currentCardEffect.type" value="video" class="mr-1"> 视频
                    </label>
                </div>
                
                <button @click="saveCardEffect" class="w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700">
                    保存配置
                </button>
            </div>
        </div>

        <div class="mb-4">
            <label class="block text-xs font-bold mb-1">卡牌背面图片 URL</label>
            <input v-model="localSettings.cardBackImage" 
                   @change="updateSetting('cardBackImage', localSettings.cardBackImage)"
                   class="w-full text-xs p-1 border rounded" />
        </div>
        
        <p class="text-xs text-gray-500 mt-2">* 修改后即时生效</p>
    </div> 
    <!-- Start Button Overlay -->
    <div v-if="store.isConnected && (!store.gameState || store.gameState.status === 'waiting')" 
         class="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
      <div class="bg-white p-8 rounded-xl shadow-2xl text-center">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">准备开始</h2>
        <div class="space-x-4">
          <button @click="store.startGame(8, 5)" 
                  class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow-lg">
            开始 8 人演示
          </button>
          <button @click="store.startGame(12, 3)" 
                  class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold text-lg shadow-lg">
            开始 12 人演示
          </button>
        </div>
      </div>
    </div>

    <!-- Reset Button (Top Right) -->
    <div v-if="store.gameState && store.gameState.status === 'playing'" 
         class="absolute top-4 right-4 z-20">
        <button @click="store.resetGame()" 
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold shadow-lg">
          重置演示
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as PIXI from 'pixi.js';
import { useGameStore, type Card, type Player } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'vue-router';

const store = useGameStore();
const authStore = useAuthStore();
const router= useRouter();
const pixiContainer = ref<HTMLDivElement | null>(null);
let app: PIXI.Application | null = null;

// Handle logout
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
   authStore.logout();
   router.push('/login');
  }
};

// Settings State
const showSettings = ref(false);
const localSettings = ref({ ...store.settings });

// Card Effect Config State
const knownCardNames = [
  '故障报告', '现场勘查', '负荷研判', '应急发电车', 
  '道路受阻', '物资调配', '灾情推演', '舆情监测'
];
const selectedCardName = ref('');
const currentCardEffect = ref({ url: '', type: 'image' as 'image'|'video' });

// Watch selection to load existing config
watch(selectedCardName, (name) => {
    if (!name) return;
    const existing = store.settings.cardEffects?.[name];
    if (existing) {
        currentCardEffect.value = { ...existing };
    } else {
        currentCardEffect.value = { url: '', type: 'image' };
    }
});

function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const url = URL.createObjectURL(file);
        
        // Auto-detect type
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        
        currentCardEffect.value = {
            url: url,
            type: type
        };
    }
}

function saveCardEffect() {
    if (!selectedCardName.value) return;
    
    // Get current effects map (ensure it exists)
    const newEffects = { ...(store.settings.cardEffects || {}) };
    
    if (currentCardEffect.value.url) {
        newEffects[selectedCardName.value] = { ...currentCardEffect.value };
    } else {
        delete newEffects[selectedCardName.value]; // Remove if empty
    }
    
    store.updateSettings({ cardEffects: newEffects });
    alert(`已保存 [${selectedCardName.value}] 的特效配置`);
}

// Watch store settings changes (from server)
watch(() => store.settings, (newSettings) => {
    localSettings.value = { ...newSettings };
    // Update background immediately
    updateBackground();
}, { deep: true });

function updateSetting(key: string, value: any) {
    store.updateSettings({ [key]: value });
}

// Graphics Groups
let cardContainer: PIXI.Container;
let uiContainer: PIXI.Container;
let zoneContainer: PIXI.Container;

// Constants
const CARD_WIDTH = 60;
const CARD_HEIGHT = 90;

onMounted(() => {
  store.connect();
  initPixi();
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  if (app) {
    app.destroy(true, { children: true });
  }
  window.removeEventListener('resize', onResize);
});

function initPixi() {
  if (!pixiContainer.value) return;

  app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x000000, // Default black, will be covered by image
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true
  });

  pixiContainer.value.appendChild(app.view as any);

  // Background Sprite
  const bgSprite = new PIXI.Sprite();
  bgSprite.name = 'background';
  bgSprite.anchor.set(0.5);
  bgSprite.x = app.screen.width / 2;
  bgSprite.y = app.screen.height / 2;
  app.stage.addChild(bgSprite);
  
  // Initialize Background
  updateBackground();

  // Setup Layers
  const stageCenter = new PIXI.Container();
  stageCenter.name = 'stageCenter';
  stageCenter.x = app.screen.width / 2;
  stageCenter.y = app.screen.height / 2;
  app.stage.addChild(stageCenter);

  zoneContainer = new PIXI.Container();
  cardContainer = new PIXI.Container();
  uiContainer = new PIXI.Container();
  
  // Sortable for dragging
  cardContainer.sortableChildren = true;

  stageCenter.addChild(zoneContainer);
  stageCenter.addChild(uiContainer); // Public area hints
  stageCenter.addChild(cardContainer);

  // Draw Static UI
  drawPublicArea();
}

function onResize() {
  if (!app) return;
  app.renderer.resize(window.innerWidth, window.innerHeight);
  
  // Resize Background
  updateBackground();

  const stageCenter = app.stage.getChildByName('stageCenter');
  if (stageCenter) {
    stageCenter.x = app.screen.width / 2;
    stageCenter.y = app.screen.height / 2;
    renderGame();
  }
}

function updateBackground() {
    if (!app) return;
    
    const bgSprite = app.stage.getChildByName('background') as PIXI.Sprite;
    if (bgSprite && store.settings.backgroundImage) {
        try {
            const texture = PIXI.Texture.from(store.settings.backgroundImage);
            bgSprite.texture = texture;
            
            // Cover mode
            const ratio = Math.max(app.screen.width / texture.width, app.screen.height / texture.height);
            bgSprite.scale.set(ratio);
            
            bgSprite.x = app.screen.width / 2;
            bgSprite.y = app.screen.height / 2;
            
            // Add subtle overlay to ensure text readability
            bgSprite.tint = 0x888888; // Darken background slightly
        } catch (e) {
            console.error('Background load error', e);
        }
    }
}

  // Watch state and re-render
watch(() => store.gameState, (newState) => {
  if (newState && app) {
    renderGame();
    
    // Check for last played card to show effect
    if (newState.lastPlayedCard) {
        showPublicEffect(newState.lastPlayedCard);
    }
  } else if (!newState && app) {
      // Game Reset
      resetVisuals();
  }
}, { deep: true });

function resetVisuals() {
    if (!app) return;
    cardContainer.removeChildren();
    zoneContainer.removeChildren();
    drawPublicArea();
}

function showPublicEffect(card: Card) {
    if (!app) return;
    
    // Determine Source
    // Check per-card config first
    const cardConfig = store.settings.cardEffects?.[card.name];
    
    const sourceUrl = cardConfig?.url || card.effectImage;
    const isVideo = cardConfig ? (cardConfig.type === 'video') : false; // Default effects are images
    
    if (!sourceUrl) return;
    
    let effectSprite: PIXI.Sprite;
    let videoElement: HTMLVideoElement | null = null;

    try {
        if (isVideo) {
            // Video Handling
            videoElement = document.createElement('video');
            videoElement.crossOrigin = 'anonymous'; // Important for CORS, but local files might need object URL
            
            // Note: If using local file path like "C:\..." it will fail in browser.
            // User should use a valid URL or place file in public folder.
            videoElement.referrerPolicy = 'no-referrer'; // Try to bypass some hotlink protections
            
            videoElement.src = sourceUrl;
            videoElement.muted = true; // Required for autoplay usually
            videoElement.loop = true;
            videoElement.playsInline = true;
            
            // Wait for canplay event to create texture, avoiding PIXI crash on error
            videoElement.oncanplay = () => {
                if (!app || !videoElement) return;
                
                // Now it's safe to play
                videoElement.play().catch(e => console.warn('Play blocked', e));

                const texture = PIXI.Texture.from(videoElement);
                effectSprite = new PIXI.Sprite(texture);
                
                effectSprite.anchor.set(0.5);
                effectSprite.width = app.screen.width;
                effectSprite.height = app.screen.height;
                effectSprite.alpha = 0;
                
                // Add to background of public area
                uiContainer.addChildAt(effectSprite, 0); 
                
                startFadeAnimation(effectSprite, videoElement);
            };

            // Error handling for video loading
            videoElement.onerror = (e) => {
                console.error('Video load failed', sourceUrl, e);
                // Fallback to error text?
            };
            
        } else {
            // Image Handling
            effectSprite = PIXI.Sprite.from(sourceUrl);
            effectSprite.anchor.set(0.5);
            effectSprite.width = app.screen.width;
            effectSprite.height = app.screen.height;
            effectSprite.alpha = 0;
            
            // Add to background of public area
            uiContainer.addChildAt(effectSprite, 0); 
            
            startFadeAnimation(effectSprite);
        }
    } catch (e) {
        console.error('Effect load error', e);
    }
}

function startFadeAnimation(sprite: PIXI.Sprite, videoEl?: HTMLVideoElement) {
    let ticker = 0;
    const duration = store.settings.effectDuration * 60; // Approx 60fps
    const fade = () => {
        ticker++;
        if (ticker < duration) {
            // Fade in quickly, stay, fade out slowly
            const progress = ticker / duration;
            if (progress < 0.1) {
                sprite.alpha = progress * 10;
            } else if (progress > 0.8) {
                sprite.alpha = (1 - progress) * 5;
            } else {
                sprite.alpha = 1;
            }
            requestAnimationFrame(fade);
        } else {
            if (uiContainer.children.includes(sprite)) {
                uiContainer.removeChild(sprite);
            }
            
            // Cleanup Video
            if (videoEl) {
                videoEl.pause();
                videoEl.src = '';
                sprite.destroy({ texture: true, baseTexture: true });
            }
        }
    };
    fade();
}

function drawPublicArea() {
  if (!app) return;
  
  // Clear previous
  uiContainer.removeChildren();

  // Draw Center Circle (Public Area)
  const radius = Math.min(app.screen.width, app.screen.height) * 0.5 / 2;
  const graphics = new PIXI.Graphics();
  
  // Public Area Background
  graphics.lineStyle(4, 0xffd700, 1); // Gold border
  graphics.beginFill(0x283593, 0.5);
  graphics.drawCircle(0, 0, radius);
  graphics.endFill();

  // AI Buttons (Placeholder Visualization)
  const btnAI = new PIXI.Graphics();
  btnAI.beginFill(0xffffff, 0.2);
  btnAI.drawRoundedRect(-60, -20, 120, 40, 20);
  btnAI.endFill();
  
  const text = new PIXI.Text('Public Zone', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xffd700,
    align: 'center'
  });
  text.anchor.set(0.5);
  
  uiContainer.addChild(graphics);
  uiContainer.addChild(text);
  
  // Add AI Buttons functionality can be added here as interactive sprites
}

function renderGame() {
  if (!store.gameState || !app) return;

  const { players, publicCards, discardPile } = store.gameState;
  const radius = Math.min(app.screen.width, app.screen.height) * 0.45; // Player circle radius

  // 1. Draw Zones
  zoneContainer.removeChildren();
  const zoneGraphics = new PIXI.Graphics();
  
  const totalPlayers = players.length;
  const anglePerPlayer = 360 / totalPlayers;
  const screenWidth = app.screen.width;
  const screenHeight = app.screen.height;

  // Function to calculate edge position for a given angle
  const getEdgePosition = (angleDeg: number, margin: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    // Ray casting to rectangle bounds
    // x = t * cos, y = t * sin
    // Bound lines: x = +/- w/2, y = +/- h/2 (relative to center)
    
    const halfW = screenWidth / 2 - margin;
    const halfH = screenHeight / 2 - margin;
    
    let t = Infinity;
    
    if (cos !== 0) {
      const tx = (cos > 0 ? halfW : -halfW) / cos;
      if (tx > 0) t = Math.min(t, tx);
    }
    
    if (sin !== 0) {
      const ty = (sin > 0 ? halfH : -halfH) / sin;
      if (ty > 0) t = Math.min(t, ty);
    }
    
    return {
      x: t * cos,
      y: t * sin,
      t: t
    };
  };

  players.forEach((player, index) => {
    const angle = index * anglePerPlayer;
    
    // Draw separator lines (optional) - Ray to far corner
    const rad = (angle * Math.PI) / 180;
    const maxDist = Math.max(screenWidth, screenHeight);
    const endX = Math.cos(rad) * maxDist;
    const endY = Math.sin(rad) * maxDist;
    
    zoneGraphics.lineStyle(2, 0xffffff, 0.05);
    zoneGraphics.moveTo(0, 0);
    zoneGraphics.lineTo(endX, endY);
    
    // Position for Avatar/Label (Near edge)
    const labelPos = getEdgePosition(angle + anglePerPlayer / 2, 80);
    
    const playerGroup = new PIXI.Container();
    playerGroup.x = labelPos.x;
    playerGroup.y = labelPos.y;
    // Rotate to face center
    const rotationRad = ((angle + anglePerPlayer / 2) * Math.PI) / 180;
    playerGroup.rotation = rotationRad - Math.PI / 2; 

    // Avatar
    try {
        const avatarSize = 40;
        const avatar = PIXI.Sprite.from(player.avatar);
        avatar.anchor.set(0.5);
        avatar.width = avatarSize;
        avatar.height = avatarSize;
        avatar.y = -30;
        
        // Circular Mask
        const mask = new PIXI.Graphics();
        mask.beginFill(0xffffff);
        mask.drawCircle(0, -30, avatarSize / 2);
        mask.endFill();
        playerGroup.addChild(mask);
        avatar.mask = mask;
        playerGroup.addChild(avatar);
    } catch (e) {
        console.error('Avatar load error', e);
    }
    
    // Name
    const text = new PIXI.Text(player.name, {
      fontSize: 14,
      fill: player.isActive ? 0x00ff00 : 0xffffff,
      fontWeight: 'bold',
      stroke: 0x000000,
      strokeThickness: 2
    });
    text.anchor.set(0.5);
    text.y = 0;
    playerGroup.addChild(text);

    // Role
    const roleText = new PIXI.Text(`[${player.role}]`, {
      fontSize: 12,
      fill: 0xffd700,
      fontStyle: 'italic'
    });
    roleText.anchor.set(0.5);
    roleText.y = 15;
    playerGroup.addChild(roleText);
    
    zoneContainer.addChild(playerGroup);
  });
  
  zoneContainer.addChild(zoneGraphics);

  // 2. Draw Cards
  // Re-creating cards every frame is expensive, for demo it's fine.
  // Optimization: Diffs. For now, full re-render for simplicity.
  cardContainer.removeChildren();

  // Draw Player Hands
  players.forEach((player, pIndex) => {
    const startAngle = pIndex * anglePerPlayer;
    const centerAngle = startAngle + anglePerPlayer / 2;
    
    // Position for Cards (Closer to edge than avatar)
    // Avatar is at margin 80, Cards should be around there too but offset
    // Let's put cards slightly inward from avatar so avatar is "behind" cards from center perspective?
    // Or cards closer to center? Usually cards are in front of player.
    // So cards should be closer to center than the avatar.
    // Avatar is at edge (margin 80).
    // Cards should be at margin ~200?
    const cardBasePos = getEdgePosition(centerAngle, 220);

    player.cards.forEach((card, cIndex) => {
      // Calculate position in arc relative to cardBasePos
      // Linear spread instead of arc for better table feel?
      // Or slight arc. Let's keep arc but centered on cardBasePos
      
      const cardSpan = 8; // degrees between cards
      const totalSpan = (player.cards.length - 1) * cardSpan;
      const cardAngle = centerAngle - totalSpan / 2 + cIndex * cardSpan;
      
      // We want to position cards along an arc that is "flat" against the edge
      // But simple arc is easier.
      // Recalculate position based on angle but same "distance" logic?
      // No, let's just use the getEdgePosition with margin 220 for each card angle
      // This will make them follow the table shape!
      
      const pos = getEdgePosition(cardAngle, 220);
      
      const rad = (cardAngle * Math.PI) / 180;
      
      // Card Rotation: Face Center (Top points to center)
      const rotation = rad - Math.PI / 2;
      
      const sprite = createCardSprite(card, pos.x, pos.y, rotation, player.id);
      cardContainer.addChild(sprite);
    });
  });

  // Draw Public Cards (Center)
  publicCards.forEach((card, index) => {
    // Random scatter in center
    // Deterministic based on index to avoid jitter
    const x = (Math.sin(index) * 50);
    const y = (Math.cos(index) * 50);
    const rotation = (index % 360) * (Math.PI / 180); // Arbitrary rotation
    
    const sprite = createCardSprite(card, x, y, rotation, 'public', false); // Not interactive if public? Or maybe draggable back?
    cardContainer.addChild(sprite);
  });
}

function createCardSprite(card: Card, x: number, y: number, rotation: number, ownerId: string, interactive = true) {
  const container = new PIXI.Container();
  container.x = x;
  container.y = y;
  container.rotation = rotation;
  
  // Card Visuals
  const graphics = new PIXI.Graphics();
  
  // Background
  // graphics.lineStyle(2, 0xffd700);
  // graphics.beginFill(0xffffff);
  // graphics.drawRoundedRect(-CARD_WIDTH/2, -CARD_HEIGHT/2, CARD_WIDTH, CARD_HEIGHT, 10);
  // graphics.endFill();
  
  // Card Image
  // Use cardBack if it's not the owner or if it's in a hidden state (optional future feature)
  // For now, always show front for demo
  const imageUrl = card.image;
  // If we wanted to show back for other players:
  // const imageUrl = (ownerId === 'public' || ownerId === myId) ? card.image : store.settings.cardBackImage;

  try {
      const cardSprite = PIXI.Sprite.from(imageUrl);
      cardSprite.width = CARD_WIDTH;
      cardSprite.height = CARD_HEIGHT;
      cardSprite.anchor.set(0.5);
      
      // Mask for rounded corners
      const mask = new PIXI.Graphics();
      mask.beginFill(0xffffff);
      mask.drawRoundedRect(-CARD_WIDTH/2, -CARD_HEIGHT/2, CARD_WIDTH, CARD_HEIGHT, 6);
      mask.endFill();
      cardSprite.mask = mask;
      container.addChild(mask); // Add mask to container so it transforms with it
      
      container.addChild(cardSprite);
  } catch (e) {
      console.error('Card image load error', e);
      // Fallback
      graphics.beginFill(0xcccccc);
      graphics.drawRoundedRect(-CARD_WIDTH/2, -CARD_HEIGHT/2, CARD_WIDTH, CARD_HEIGHT, 10);
      graphics.endFill();
      container.addChild(graphics);
  }

  // Border
  const border = new PIXI.Graphics();
  border.lineStyle(2, 0xffd700);
  border.drawRoundedRect(-CARD_WIDTH/2, -CARD_HEIGHT/2, CARD_WIDTH, CARD_HEIGHT, 6);
  container.addChild(border);
  
  // Type Color (Small indicator)
  const typeColor = card.type === 'deduction' ? 0x2196f3 : (card.type === 'prop' ? 0x4caf50 : 0x9c27b0);
  const typeIndicator = new PIXI.Graphics();
  typeIndicator.beginFill(typeColor);
  typeIndicator.drawCircle(CARD_WIDTH/2 - 10, -CARD_HEIGHT/2 + 10, 5);
  typeIndicator.endFill();
  container.addChild(typeIndicator);

  // Text Background
  const textBg = new PIXI.Graphics();
  textBg.beginFill(0x000000, 0.6);
  textBg.drawRect(-CARD_WIDTH/2, CARD_HEIGHT/2 - 25, CARD_WIDTH, 25);
  container.addChild(textBg);

  // Text
  const text = new PIXI.Text(card.name, {
    fontSize: 10,
    fontWeight: 'bold',
    fill: 0xffffff,
    wordWrap: true,
    wordWrapWidth: CARD_WIDTH - 5,
    align: 'center'
  });
  text.anchor.set(0.5);
  text.y = CARD_HEIGHT/2 - 12.5; // Bottom aligned
  container.addChild(text);

  // Interaction
  if (interactive) {
    container.eventMode = 'static';
    container.cursor = 'pointer';
    
    let dragData: any = null;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originalX = 0;
    let originalY = 0;

    // Click Handler (for non-drag interactions or tap-to-play)
    container.on('pointertap', (event) => {
        // Prevent click if it was a drag
        if (Math.abs(container.x - originalX) > 5 || Math.abs(container.y - originalY) > 5) return;
        
        // Simple tap to play (for demo convenience, especially on touch screens)
        // Check if player is active (optional, for now allow all for demo fluidity)
        store.playCard(ownerId, card.id);
    });

    container.on('pointerdown', (event) => {
      dragData = event.data;
      container.alpha = 0.8;
      dragging = true;
      const pos = dragData.getLocalPosition(container.parent);
      startX = pos.x;
      startY = pos.y;
      originalX = container.x;
      originalY = container.y;
      
      // Bring to front
      container.zIndex = 1000;
    });

    container.on('pointerup', onDragEnd);
    container.on('pointerupoutside', onDragEnd);

    function onDragEnd() {
      if (!dragging) return;
      dragging = false;
      container.alpha = 1;
      dragData = null;
      container.zIndex = 0; // Reset zIndex (or keep higher?)

      // Check Drop Zone (Distance to center)
      // Use global coordinates for accurate distance check
      const globalPos = container.getGlobalPosition();
      const centerX = app!.screen.width / 2;
      const centerY = app!.screen.height / 2;
      const dx = globalPos.x - centerX;
      const dy = globalPos.y - centerY;
      const distToCenter = Math.sqrt(dx * dx + dy * dy);
      
      const publicRadius = Math.min(app!.screen.width, app!.screen.height) * 0.5 / 2;

      if (distToCenter < publicRadius + 50) { // Add some buffer margin
        // Dropped in Public Zone
        store.playCard(ownerId, card.id);
      } else {
        // Return to hand (visual snap back handled by re-render from state update, 
        // but if state doesn't update, we should snap back manually)
        // For demo, the state update triggers re-render which resets position.
        // So we just leave it, re-render will fix it.
        // Or animate back?
        container.x = originalX;
        container.y = originalY;
      }
    }

    container.on('pointermove', (event) => {
      if (dragging) {
        const newPos = dragData.getLocalPosition(container.parent);
        container.x = originalX + (newPos.x - startX);
        container.y = originalY + (newPos.y - startY);
      }
    });
  }

  return container;
}
</script>
