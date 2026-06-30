import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { gameService } from './gameService.js';

const PORT = process.env.PORT || 3001;

// Create HTTP server from Express app
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for demo
    methods: ["GET", "POST"]
  }
});

// Settings Store (Memory)
let currentSettings: any = null;

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current state on connection
  const state = gameService.getGameState();
  if (state) {
    socket.emit('gameState', state);
  }
  
  // Send current settings if available
  if (currentSettings) {
      socket.emit('updateSettings', currentSettings);
  }

  // Handle Game Start
  socket.on('startGame', ({ playerCount, cardsPerPlayer }) => {
    console.log(`Starting game with ${playerCount} players, ${cardsPerPlayer} cards each`);
    const newState = gameService.startGame(playerCount, cardsPerPlayer);
    io.emit('gameState', newState);
  });

  // Handle Game Reset
  socket.on('resetGame', () => {
    console.log('Resetting game');
    gameService.resetGame();
    io.emit('gameState', null);
  });

  // Handle Settings Update
  socket.on('updateSettings', (newSettings) => {
    console.log('Updating settings', newSettings);
    // Update memory store
    if (!currentSettings) currentSettings = {};
    currentSettings = { ...currentSettings, ...newSettings };
    // Broadcast to all clients
    io.emit('updateSettings', newSettings);
  });

  // Handle Play Card
  socket.on('playCard', ({ playerId, cardId }) => {
    console.log(`Player ${playerId} playing card ${cardId}`);
    const newState = gameService.playCard(playerId, cardId);
    if (newState) {
      io.emit('gameState', newState);
    }
  });

  // Handle Discard Card
  socket.on('discardCard', ({ playerId, cardId }) => {
    console.log(`Player ${playerId} discarding card ${cardId}`);
    const newState = gameService.discardCard(playerId, cardId);
    if (newState) {
      io.emit('gameState', newState);
    }
  });
  
  // Handle AI Requests (Placeholder)
  socket.on('aiAction', ({ action }) => {
     socket.emit('aiResponse', { 
       status: 'pending', 
       message: 'AI功能待上线，Demo暂不支持' 
     });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start Server
httpServer.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
