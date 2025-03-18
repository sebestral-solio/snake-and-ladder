import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Initialize Supabase client with environment variables or fallback to mock implementation
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://ovpqgrwcokmlnhcnlgbr.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cHFncndjb2ttbG5oY25sZ2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MDE4NzUsImV4cCI6MjA1NTQ3Nzg3NX0.qsFao7puB3DgxyBkxgw5DAkuD_kusPKhBgMa9l41jS0";

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Game-related database functions
export interface GameSession {
  id: string;
  created_at?: string;
  admin_id: string;
  current_player_id: string;
  game_state: {
    players: Player[];
    currentPlayerIndex: number;
    gameOver: boolean;
    winner?: Player;
    lastRoll?: number;
  };
  max_players: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  isCurrentTurn: boolean;
  isAdmin: boolean;
  isWinner?: boolean;
}

// Create a new game session
export const createGameSession = async (
  adminPlayer: Player,
): Promise<string | null> => {
  try {
    const gameId = generateGameId();

    const { data, error } = await supabase
      .from("game_sessions")
      .insert({
        id: gameId,
        admin_id: adminPlayer.id,
        current_player_id: adminPlayer.id,
        game_state: {
          players: [adminPlayer],
          currentPlayerIndex: 0,
          gameOver: false,
        },
        max_players: 5,
      })
      .select();

    if (error) {
      console.error("Error creating game session:", error);
      return null;
    }

    return gameId;
  } catch (error) {
    console.error("Error creating game session:", error);
    return null;
  }
};

// Join an existing game session
export const joinGameSession = async (
  gameId: string,
  player: Player,
): Promise<boolean> => {
  try {
    // First get the current game state
    const { data: gameData, error: fetchError } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("id", gameId)
      .single();

    if (fetchError || !gameData) {
      console.error("Error fetching game session:", fetchError);
      return false;
    }

    // Check if the game is full
    if (gameData.game_state.players.length >= gameData.max_players) {
      return false;
    }

    // Check if player already exists
    if (gameData.game_state.players.some((p) => p.id === player.id)) {
      return true; // Player already in game
    }

    // Add the player to the game
    const updatedPlayers = [...gameData.game_state.players, player];

    const { error: updateError } = await supabase
      .from("game_sessions")
      .update({
        game_state: {
          ...gameData.game_state,
          players: updatedPlayers,
        },
      })
      .eq("id", gameId);

    if (updateError) {
      console.error("Error updating game session:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error joining game session:", error);
    return false;
  }
};

// Get players in a game session
export const getGameSession = async (
  gameId: string,
): Promise<GameSession | null> => {
  try {
    const { data, error } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("id", gameId)
      .single();

    if (error) {
      console.error("Error fetching game session:", error);
      return null;
    }

    return data as GameSession;
  } catch (error) {
    console.error("Error fetching game session:", error);
    return null;
  }
};

// Update player position
export const updatePlayerPosition = async (
  gameId: string,
  playerId: string,
  newPosition: number,
): Promise<boolean> => {
  try {
    // Get current game state
    const { data: gameData, error: fetchError } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("id", gameId)
      .single();

    if (fetchError || !gameData) {
      console.error("Error fetching game session:", fetchError);
      return false;
    }

    // Update player position
    const updatedPlayers = gameData.game_state.players.map((player) =>
      player.id === playerId ? { ...player, position: newPosition } : player,
    );

    const { error: updateError } = await supabase
      .from("game_sessions")
      .update({
        game_state: {
          ...gameData.game_state,
          players: updatedPlayers,
        },
      })
      .eq("id", gameId);

    if (updateError) {
      console.error("Error updating player position:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating player position:", error);
    return false;
  }
};

// Update current player turn
export const updateCurrentPlayerTurn = async (
  gameId: string,
  nextPlayerId: string,
): Promise<boolean> => {
  try {
    // Get current game state
    const { data: gameData, error: fetchError } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("id", gameId)
      .single();

    if (fetchError || !gameData) {
      console.error("Error fetching game session:", fetchError);
      return false;
    }

    // Update player turns
    const updatedPlayers = gameData.game_state.players.map((player) => ({
      ...player,
      isCurrentTurn: player.id === nextPlayerId,
    }));

    const nextPlayerIndex = updatedPlayers.findIndex(
      (p) => p.id === nextPlayerId,
    );

    const { error: updateError } = await supabase
      .from("game_sessions")
      .update({
        current_player_id: nextPlayerId,
        game_state: {
          ...gameData.game_state,
          players: updatedPlayers,
          currentPlayerIndex: nextPlayerIndex !== -1 ? nextPlayerIndex : 0,
        },
      })
      .eq("id", gameId);

    if (updateError) {
      console.error("Error updating player turn:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating player turn:", error);
    return false;
  }
};

// Record dice roll
export const recordDiceRoll = async (
  gameId: string,
  playerId: string,
  value: number,
): Promise<boolean> => {
  try {
    // Get current game state
    const { data: gameData, error: fetchError } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("id", gameId)
      .single();

    if (fetchError || !gameData) {
      console.error("Error fetching game session:", fetchError);
      return false;
    }

    // Verify it's this player's turn
    if (gameData.current_player_id !== playerId) {
      return false;
    }

    const { error: updateError } = await supabase
      .from("game_sessions")
      .update({
        game_state: {
          ...gameData.game_state,
          lastRoll: value,
        },
      })
      .eq("id", gameId);

    if (updateError) {
      console.error("Error recording dice roll:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error recording dice roll:", error);
    return false;
  }
};

// Set game over and winner
export const setGameOver = async (
  gameId: string,
  winnerId: string,
): Promise<boolean> => {
  try {
    // Get current game state
    const { data: gameData, error: fetchError } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("id", gameId)
      .single();

    if (fetchError || !gameData) {
      console.error("Error fetching game session:", fetchError);
      return false;
    }

    // Update winner and game over status
    const updatedPlayers = gameData.game_state.players.map((player) => ({
      ...player,
      isWinner: player.id === winnerId,
    }));

    const winner = updatedPlayers.find((p) => p.id === winnerId);

    if (!winner) {
      return false;
    }

    const { error: updateError } = await supabase
      .from("game_sessions")
      .update({
        game_state: {
          ...gameData.game_state,
          players: updatedPlayers,
          gameOver: true,
          winner: winner,
        },
      })
      .eq("id", gameId);

    if (updateError) {
      console.error("Error setting game over:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error setting game over:", error);
    return false;
  }
};

// Helper function to generate a random game ID
const generateGameId = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Function to create the necessary tables in Supabase
export const setupSupabaseTables = async (): Promise<boolean> => {
  try {
    // Check if the game_sessions table exists, if not create it
    const { error } = await supabase.rpc("create_game_sessions_if_not_exists");

    if (error) {
      console.error("Error setting up tables:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error setting up Supabase tables:", error);
    return false;
  }
};

// Function to subscribe to real-time updates for a game session
export const subscribeToGameUpdates = (
  gameId: string,
  callbacks: {
    onPlayerJoin?: (player: Player) => void;
    onPlayerMove?: (playerId: string, position: number) => void;
    onTurnChange?: (playerId: string) => void;
    onDiceRoll?: (value: number) => void;
    onGameOver?: (winner: Player) => void;
  },
) => {
  const channel = supabase
    .channel(`game-room-${gameId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "game_sessions",
        filter: `id=eq.${gameId}`,
      },
      (payload) => {
        const newState = payload.new as GameSession;
        const oldState = payload.old as GameSession;

        // Check for new players
        if (
          callbacks.onPlayerJoin &&
          newState.game_state.players.length >
            oldState.game_state.players.length
        ) {
          const newPlayers = newState.game_state.players.filter(
            (newPlayer) =>
              !oldState.game_state.players.some(
                (oldPlayer) => oldPlayer.id === newPlayer.id,
              ),
          );

          newPlayers.forEach((player) => {
            callbacks.onPlayerJoin!(player);
          });
        }

        // Check for player movement
        if (callbacks.onPlayerMove) {
          newState.game_state.players.forEach((newPlayer) => {
            const oldPlayer = oldState.game_state.players.find(
              (p) => p.id === newPlayer.id,
            );
            if (oldPlayer && newPlayer.position !== oldPlayer.position) {
              callbacks.onPlayerMove!(newPlayer.id, newPlayer.position);
            }
          });
        }

        // Check for turn changes
        if (
          callbacks.onTurnChange &&
          newState.current_player_id !== oldState.current_player_id
        ) {
          callbacks.onTurnChange(newState.current_player_id);
        }

        // Check for dice rolls
        if (
          callbacks.onDiceRoll &&
          newState.game_state.lastRoll !== oldState.game_state.lastRoll
        ) {
          callbacks.onDiceRoll(newState.game_state.lastRoll!);
        }

        // Check for game over
        if (
          callbacks.onGameOver &&
          newState.game_state.gameOver &&
          !oldState.game_state.gameOver
        ) {
          callbacks.onGameOver(newState.game_state.winner!);
        }
      },
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};
