import React, { useState, useEffect } from "react";
import MainMenu from "./game/MainMenu";
import CreateGroup from "./game/CreateGroup";
import JoinGroup from "./game/JoinGroup";
import GameLobby from "./game/GameLobby";
import GameBoard from "./game/GameBoard";
import GameSummary from "./game/GameSummary";
import PlayerNameInput from "./game/PlayerNameInput";
// Import the real database and socket modules
import * as supabaseClient from "@/lib/supabase";
import * as socketClient from "@/lib/socket";

// Define game states
type GameState =
  | "menu"
  | "enter-name"
  | "create-group"
  | "join-group"
  | "lobby"
  | "game"
  | "summary";

// Define player interface
interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  isCurrentTurn: boolean;
  rank?: number;
}

const Home = () => {
  // Game state management
  const [gameState, setGameState] = useState<GameState>("menu");
  const [groupId, setGroupId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>(""); // The current user's player ID
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Track if current player is admin
  const [winner, setWinner] = useState<Player | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentDiceValue, setCurrentDiceValue] = useState<number>(1);
  const [pendingAction, setPendingAction] = useState<"create" | "join" | null>(
    null,
  );

  // This would be where real-time player updates from a backend would be handled
  useEffect(() => {
    // In a real implementation, we would connect to a real-time service here
    // and listen for player join/leave events
    // For example with a WebSocket or Supabase subscription:
    // const subscription = supabase
    //  .channel('game-room-' + groupId)
    //  .on('presence', { event: 'join' }, handlePlayerJoinFromServer)
    //  .on('presence', { event: 'leave' }, handlePlayerLeaveFromServer)
    //  .subscribe()
    // return () => { subscription.unsubscribe() }
  }, [groupId]);

  // Handle name submission
  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    const playerId = `player-${Date.now()}`;
    setCurrentPlayerId(playerId);

    // Initialize the current player
    setPlayers([
      {
        id: playerId,
        name: name,
        color: "bg-red-500",
        position: 1,
        isCurrentTurn: true,
      },
    ]);

    // Proceed with the pending action
    if (pendingAction === "create") {
      setGameState("create-group");
      setIsAdmin(true); // Set as admin when creating a group
    } else if (pendingAction === "join") {
      setGameState("join-group");
      setIsAdmin(false); // Not admin when joining a group
    }

    setPendingAction(null);
  };

  // Handle creating a new group
  const handleCreateGroup = () => {
    setPendingAction("create");
    setGameState("enter-name");
  };

  // Handle joining an existing group
  const handleJoinGroup = () => {
    setPendingAction("join");
    setGameState("enter-name");
  };

  // Handle proceeding to lobby after creating a group
  const handleProceedToLobby = async (id: string) => {
    setGroupId(id);

    // Create a game session in the database
    const adminPlayer = {
      id: currentPlayerId,
      name: playerName,
      color: "bg-red-500",
      position: 1,
      isCurrentTurn: true,
      isAdmin: true,
    };

    try {
      // For development/demo purposes, we'll proceed without requiring Supabase
      // This allows the game to work even without a proper Supabase connection
      setPlayers([adminPlayer]);
      setGameState("lobby");

      // Try to create the game session in the database if possible
      try {
        const gameId = await supabaseClient.createGameSession(adminPlayer);

        if (gameId) {
          // If successful, update the group ID
          setGroupId(gameId);

          // Initialize socket connection and join the game room
          socketClient.initializeSocket();
          socketClient.joinGameRoom(gameId, adminPlayer);

          // Listen for real-time updates
          socketClient.listenForGameEvents(gameId, {
            onPlayerJoin: handlePlayerJoin,
            onPlayerMove: handlePlayerMove,
            onTurnChange: handleTurnChange,
            onDiceRoll: handleDiceRoll,
            onGameOver: handleGameEnd,
          });
        }
      } catch (dbError) {
        console.warn("Proceeding without database connection:", dbError);
        // We already set the game state to lobby above, so the game will still work
      }
    } catch (error) {
      console.error("Error proceeding to lobby:", error);
      // Still proceed to lobby even if there's an error
      setGameState("lobby");
    }
  };

  // Handle successful join to a group
  const handleJoinSuccess = async (id: string) => {
    setGroupId(id);

    // Create player object
    const playerObject = {
      id: currentPlayerId,
      name: playerName,
      color: "bg-gray-500", // Will be assigned by the admin
      position: 1,
      isCurrentTurn: false,
      isAdmin: false,
    };

    try {
      // Join the game session in the database
      const success = await supabaseClient.joinGameSession(id, playerObject);

      if (success) {
        // Initialize socket connection and join the game room
        const socket = socketClient.initializeSocket();
        socketClient.joinGameRoom(id, playerObject);

        // Listen for real-time updates
        socketClient.listenForGameEvents(id, {
          onPlayerJoin: handlePlayerJoin,
          onPlayerMove: handlePlayerMove,
          onTurnChange: handleTurnChange,
          onDiceRoll: handleDiceRoll,
          onGameOver: handleGameEnd,
        });

        // Fetch the current game state
        const gameSession = await supabaseClient.getGameSession(id);
        if (gameSession) {
          setPlayers(gameSession.game_state.players);
        }

        setGameState("lobby");
      } else {
        console.error("Failed to join game session");
      }
    } catch (error) {
      console.error("Error joining game session:", error);
    }
  };

  // Handle a new player joining the game
  const handlePlayerJoin = (newPlayer: Partial<Player>) => {
    // This would be triggered by a real-time event from the server
    // when another player joins the game room

    // Check if player already exists to prevent duplicates
    const playerExists = players.some((p) => p.id === newPlayer.id);
    if (playerExists) return;

    const playerWithDefaults: Player = {
      id: newPlayer.id || `player-${Date.now()}`,
      name: newPlayer.name || `Player ${players.length + 1}`,
      color: newPlayer.color || `bg-gray-500`,
      position: 1,
      isCurrentTurn: false,
    };

    setPlayers((prev) => [...prev, playerWithDefaults]);

    // In a real implementation with a server:
    // We wouldn't need to manually update the state here as we would
    // receive the update from the server via the subscription
  };

  // Handle refreshing the player list
  const handleRefreshPlayers = async () => {
    if (!groupId) return;

    try {
      // Fetch the latest player list from the database
      const gameSession = await supabaseClient.getGameSession(groupId);

      if (gameSession) {
        setPlayers(gameSession.game_state.players);
      }
    } catch (error) {
      console.error("Error refreshing player list:", error);
    }
  };

  // Handle starting the game from lobby
  const handleStartGame = async () => {
    // Assign colors to players if not already assigned
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
    ];
    const playersWithColors = players.map((player, index) => ({
      ...player,
      color: player.color || colors[index % colors.length],
    }));

    setPlayers(playersWithColors);

    // Update the game state in the database if this is the admin
    if (isAdmin && groupId) {
      try {
        const gameSession = await supabaseClient.getGameSession(groupId);

        if (gameSession) {
          // Update the game state with the assigned colors
          await supabaseClient.supabase
            .from("game_sessions")
            .update({
              game_state: {
                ...gameSession.game_state,
                players: playersWithColors,
              },
            })
            .eq("id", groupId);
        }
      } catch (error) {
        console.error("Error updating game state:", error);
      }
    }

    setGameState("game");
  };

  // Handle player movement
  const handlePlayerMove = (playerId: string, newPosition: number) => {
    // Update local state
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, position: newPosition } : player,
      ),
    );

    // If this is the current player moving, update the database and notify others
    if (playerId === currentPlayerId && groupId) {
      // Update player position in database
      supabaseClient.updatePlayerPosition(groupId, playerId, newPosition);

      // Emit event to other players
      socketClient.emitPlayerMove(groupId, playerId, newPosition);
    }
  };

  // Handle turn change
  const handleTurnChange = (nextPlayerId: string) => {
    // Update local state
    setPlayers((prev) =>
      prev.map((player) => ({
        ...player,
        isCurrentTurn: player.id === nextPlayerId,
      })),
    );

    // If this is the current player ending their turn, update the database and notify others
    const currentTurnPlayer = players.find((p) => p.isCurrentTurn);
    if (currentTurnPlayer?.id === currentPlayerId && groupId) {
      // Update turn in database
      supabaseClient.updateCurrentPlayerTurn(groupId, nextPlayerId);

      // Emit event to other players
      socketClient.emitTurnChange(groupId, nextPlayerId);
    }
  };

  // Handle dice roll
  const handleDiceRoll = (value: number) => {
    // Update local state
    setIsRolling(true);
    setCurrentDiceValue(value);

    // After the animation completes, update the game state
    setTimeout(() => {
      setIsRolling(false);
    }, 1500);

    // If this is the current player rolling, update the database and notify others
    const currentTurnPlayer = players.find((p) => p.isCurrentTurn);
    if (currentTurnPlayer?.id === currentPlayerId && groupId) {
      // Record dice roll in database
      supabaseClient.recordDiceRoll(groupId, currentPlayerId, value);

      // Emit event to other players
      socketClient.emitDiceRoll(groupId, currentPlayerId, value);
    }
  };

  // Handle game end and transition to summary
  const handleGameEnd = (winningPlayer: Player) => {
    // Calculate ranks for all players based on their positions
    const rankedPlayers = [...players].sort((a, b) => b.position - a.position);
    const playersWithRanks = rankedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    setPlayers(playersWithRanks);
    setWinner(winningPlayer);
    setGameState("summary");

    // If this is the current player winning, update the database and notify others
    if (winningPlayer.id === currentPlayerId && groupId) {
      // Set game over in database
      supabaseClient.setGameOver(groupId, currentPlayerId);

      // Emit event to other players
      socketClient.emitGameOver(groupId, winningPlayer);
    }
  };

  // Handle play again from summary
  const handlePlayAgain = async () => {
    // Reset player positions
    const resetPlayers = players.map((player) => ({
      ...player,
      position: 1,
      isCurrentTurn: player.id === players[0]?.id, // First player's turn
      rank: undefined,
    }));

    setPlayers(resetPlayers);
    setWinner(null);

    // If this is the admin, update the game state in the database
    if (isAdmin && groupId) {
      try {
        const gameSession = await supabaseClient.getGameSession(groupId);

        if (gameSession) {
          // Reset the game state
          await supabaseClient.supabase
            .from("game_sessions")
            .update({
              current_player_id: resetPlayers[0]?.id,
              game_state: {
                players: resetPlayers,
                currentPlayerIndex: 0,
                gameOver: false,
                winner: null,
                lastRoll: null,
              },
            })
            .eq("id", groupId);
        }
      } catch (error) {
        console.error("Error resetting game state:", error);
      }
    }

    setGameState("lobby");
  };

  // Handle exit game to main menu
  const handleExitGame = () => {
    // Disconnect from socket
    socketClient.disconnectSocket();

    setGroupId("");
    // Keep the player name but reset other state
    if (playerName) {
      setPlayers([
        {
          id: currentPlayerId,
          name: playerName,
          color: "bg-red-500",
          position: 1,
          isCurrentTurn: true,
        },
      ]);
    } else {
      setPlayers([]);
    }
    setIsAdmin(false);
    setGameState("menu");
  };

  // Render the appropriate component based on game state
  const renderGameState = () => {
    switch (gameState) {
      case "menu":
        return (
          <MainMenu
            onCreateGroup={handleCreateGroup}
            onJoinGroup={handleJoinGroup}
            playerName={playerName}
          />
        );
      case "enter-name":
        return (
          <PlayerNameInput
            onClose={handleExitGame}
            onSubmit={handleNameSubmit}
            title={
              pendingAction === "create"
                ? "Create a Game Group"
                : "Join a Game Group"
            }
            description={
              pendingAction === "create"
                ? "Enter your name to create a new game group."
                : "Enter your name to join an existing game group."
            }
          />
        );
      case "create-group":
        return (
          <CreateGroup
            onClose={handleExitGame}
            onProceed={handleProceedToLobby}
          />
        );
      case "join-group":
        return (
          <JoinGroup
            onClose={handleExitGame}
            onJoinSuccess={handleJoinSuccess}
          />
        );
      case "lobby":
        return (
          <GameLobby
            groupId={groupId}
            players={players}
            maxPlayers={5}
            isHost={isAdmin}
            onStartGame={handleStartGame}
            onPlayerJoin={handlePlayerJoin}
            onRefreshPlayers={handleRefreshPlayers}
            currentPlayerId={currentPlayerId}
          />
        );
      case "game":
        return (
          <GameBoard
            groupId={groupId}
            players={players}
            onGameEnd={handleGameEnd}
            onExitGame={handleExitGame}
            currentPlayerId={currentPlayerId}
            onPlayerJoin={handlePlayerJoin}
            onPlayerMove={handlePlayerMove}
            onTurnChange={handleTurnChange}
          />
        );
      case "summary":
        return (
          <GameSummary
            players={players}
            onPlayAgain={handlePlayAgain}
            onExitGame={handleExitGame}
          />
        );
      default:
        return <MainMenu />;
    }
  };

  return <div className="min-h-screen bg-gray-900">{renderGameState()}</div>;
};

export default Home;
