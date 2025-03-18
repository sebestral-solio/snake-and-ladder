import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Events that can be emitted or listened to
export enum GameEvents {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  JOIN_GAME = "join_game",
  PLAYER_JOINED = "player_joined",
  PLAYER_LEFT = "player_left",
  GAME_STARTED = "game_started",
  DICE_ROLLED = "dice_rolled",
  PLAYER_MOVED = "player_moved",
  TURN_CHANGED = "turn_changed",
  GAME_OVER = "game_over",
  CHAT_MESSAGE = "chat_message",
}

// Initialize socket connection
export const initializeSocket = (
  url: string = "https://your-socket-server.com",
): Socket => {
  if (!socket) {
    socket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Setup default listeners
    socket.on(GameEvents.CONNECT, () => {
      console.log("Socket connected");
    });

    socket.on(GameEvents.DISCONNECT, () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  return socket;
};

// Join a game room
export const joinGameRoom = (gameId: string, player: any): void => {
  if (!socket) return;

  socket.emit(GameEvents.JOIN_GAME, { gameId, player });
};

// Listen for game events
export const listenForGameEvents = (
  gameId: string,
  callbacks: {
    onPlayerJoin?: (player: any) => void;
    onPlayerLeave?: (playerId: string) => void;
    onGameStart?: () => void;
    onDiceRoll?: (playerId: string, value: number) => void;
    onPlayerMove?: (playerId: string, position: number) => void;
    onTurnChange?: (playerId: string) => void;
    onGameOver?: (winner: any) => void;
    onChatMessage?: (message: any) => void;
  },
): (() => void) => {
  if (!socket) return () => {};

  // Setup event listeners
  if (callbacks.onPlayerJoin) {
    socket.on(GameEvents.PLAYER_JOINED, callbacks.onPlayerJoin);
  }

  if (callbacks.onPlayerLeave) {
    socket.on(GameEvents.PLAYER_LEFT, callbacks.onPlayerLeave);
  }

  if (callbacks.onGameStart) {
    socket.on(GameEvents.GAME_STARTED, callbacks.onGameStart);
  }

  if (callbacks.onDiceRoll) {
    socket.on(GameEvents.DICE_ROLLED, ({ playerId, value }) => {
      callbacks.onDiceRoll!(playerId, value);
    });
  }

  if (callbacks.onPlayerMove) {
    socket.on(GameEvents.PLAYER_MOVED, ({ playerId, position }) => {
      callbacks.onPlayerMove!(playerId, position);
    });
  }

  if (callbacks.onTurnChange) {
    socket.on(GameEvents.TURN_CHANGED, ({ playerId }) => {
      callbacks.onTurnChange!(playerId);
    });
  }

  if (callbacks.onGameOver) {
    socket.on(GameEvents.GAME_OVER, callbacks.onGameOver);
  }

  if (callbacks.onChatMessage) {
    socket.on(GameEvents.CHAT_MESSAGE, callbacks.onChatMessage);
  }

  // Return cleanup function
  return () => {
    socket?.off(GameEvents.PLAYER_JOINED);
    socket?.off(GameEvents.PLAYER_LEFT);
    socket?.off(GameEvents.GAME_STARTED);
    socket?.off(GameEvents.DICE_ROLLED);
    socket?.off(GameEvents.PLAYER_MOVED);
    socket?.off(GameEvents.TURN_CHANGED);
    socket?.off(GameEvents.GAME_OVER);
    socket?.off(GameEvents.CHAT_MESSAGE);
  };
};

// Emit game events
export const emitDiceRoll = (
  gameId: string,
  playerId: string,
  value: number,
): void => {
  if (!socket) return;
  socket.emit(GameEvents.DICE_ROLLED, { gameId, playerId, value });
};

export const emitPlayerMove = (
  gameId: string,
  playerId: string,
  position: number,
): void => {
  if (!socket) return;
  socket.emit(GameEvents.PLAYER_MOVED, { gameId, playerId, position });
};

export const emitTurnChange = (gameId: string, playerId: string): void => {
  if (!socket) return;
  socket.emit(GameEvents.TURN_CHANGED, { gameId, playerId });
};

export const emitGameOver = (gameId: string, winner: any): void => {
  if (!socket) return;
  socket.emit(GameEvents.GAME_OVER, { gameId, winner });
};

export const emitChatMessage = (gameId: string, message: any): void => {
  if (!socket) return;
  socket.emit(GameEvents.CHAT_MESSAGE, { gameId, message });
};

export const emitGameStarted = (gameId: string): void => {
  if (!socket) return;
  socket.emit(GameEvents.GAME_STARTED, { gameId });
};

// Disconnect socket
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
