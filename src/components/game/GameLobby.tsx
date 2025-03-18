import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Copy, Users, Clock, Play, RefreshCw } from "lucide-react";
import RealTimeSync from "./RealTimeSync";
import { motion } from "framer-motion";

interface Player {
  id: string;
  name: string;
  color?: string;
}

interface GameLobbyProps {
  groupId?: string;
  players?: Player[];
  maxPlayers?: number;
  isHost?: boolean;
  onStartGame?: () => void;
  onPlayerJoin?: (player: Player) => void;
  onRefreshPlayers?: () => void;
  currentPlayerId?: string;
}

const GameLobby = ({
  groupId = "ABC123",
  players = [{ id: "1", name: "Player 1" }],
  maxPlayers = 5,
  isHost = true,
  onStartGame = () => console.log("Game started"),
  onPlayerJoin = () => {},
  onRefreshPlayers = () => {},
  currentPlayerId = "",
}: GameLobbyProps) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const availableSlots = maxPlayers - players.length;
  const isGameReady = players.length >= 2;

  const playerColors = [
    "🔴 Red",
    "🔵 Blue",
    "🟢 Green",
    "🟡 Yellow",
    "🟣 Purple",
  ];

  // Initialize socket connection and listen for player updates
  useEffect(() => {
    if (!groupId) return;

    // Initialize socket and listen for player updates
    import("@/lib/socket").then(
      ({ initializeSocket, listenForGameEvents, joinGameRoom }) => {
        initializeSocket();

        // Join the game room
        if (currentPlayerId) {
          const currentPlayer = players.find((p) => p.id === currentPlayerId);
          if (currentPlayer) {
            joinGameRoom(groupId, currentPlayer);
          }
        }

        // Listen for player updates
        const cleanup = listenForGameEvents(groupId, {
          onPlayerJoin: (player) => {
            // Check if player already exists to prevent duplicates
            const playerExists = players.some((p) => p.id === player.id);
            if (!playerExists && onPlayerJoin) {
              onPlayerJoin(player);
            }
          },
          onGameStart: () => {
            if (onStartGame) {
              onStartGame();
            }
          },
        });

        return cleanup;
      },
    );
  }, [groupId, currentPlayerId, players, onPlayerJoin, onStartGame]);

  // Assign colors to players when the group is full
  useEffect(() => {
    if (players.length === maxPlayers) {
      // Assign colors to players
      const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
      ];

      // Update player colors in database if this is the admin
      if (isHost && currentPlayerId) {
        import("@/lib/supabase").then(({ getGameSession }) => {
          getGameSession(groupId).then((session) => {
            if (session) {
              const updatedPlayers = session.game_state.players.map(
                (player, index) => ({
                  ...player,
                  color: colors[index % colors.length],
                }),
              );

              // Update players in database
              import("@/lib/supabase").then(({ supabase }) => {
                supabase
                  .from("game_sessions")
                  .update({
                    game_state: {
                      ...session.game_state,
                      players: updatedPlayers,
                    },
                  })
                  .eq("id", groupId);
              });
            }
          });
        });
      }
    }
  }, [players.length, maxPlayers, isHost, currentPlayerId, groupId]);

  const copyGroupId = () => {
    navigator.clipboard.writeText(groupId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshPlayers = () => {
    setIsRefreshing(true);

    // Fetch the latest player list from the database
    if (groupId) {
      import("@/lib/supabase").then(({ getGameSession }) => {
        getGameSession(groupId)
          .then((session) => {
            if (session && onRefreshPlayers) {
              // Update local player list with the latest from the database
              onRefreshPlayers();
            }
            setIsRefreshing(false);
          })
          .catch(() => {
            setIsRefreshing(false);
          });
      });
    } else {
      onRefreshPlayers();
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-center md:text-left">
              Game Lobby
            </h1>
            <p className="text-gray-500 mt-1">Waiting for players to join...</p>
            <RealTimeSync groupId={groupId} playerCount={players.length} />
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
            <span className="font-medium">Group ID:</span>
            <span className="font-mono font-bold">{groupId}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyGroupId}
              className="ml-2"
            >
              <Copy size={16} />
              <span className="ml-1">{copied ? "Copied!" : "Copy"}</span>
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={20} />
              <h2 className="text-xl font-semibold">Players</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock size={18} />
                <span>
                  {availableSlots} {availableSlots === 1 ? "slot" : "slots"}{" "}
                  remaining
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshPlayers}
                disabled={isRefreshing}
              >
                <motion.div
                  animate={{ rotate: isRefreshing ? 360 : 0 }}
                  transition={{
                    duration: 1,
                    repeat: isRefreshing ? Infinity : 0,
                  }}
                >
                  <RefreshCw size={16} />
                </motion.div>
              </Button>
            </div>
          </div>

          <ul className="space-y-3">
            {players.map((player, index) => (
              <motion.li
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{player.name}</span>
                    {player.id === currentPlayerId && (
                      <span className="text-xs text-gray-500">(You)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isHost && player.id === currentPlayerId && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      Host
                    </span>
                  )}
                  {players.length === maxPlayers && (
                    <span className="text-sm font-medium">
                      {playerColors[index]}
                    </span>
                  )}
                </div>
              </motion.li>
            ))}

            {availableSlots > 0 &&
              Array.from({ length: availableSlots }).map((_, index) => (
                <li
                  key={`empty-${index}`}
                  className="flex items-center justify-between bg-gray-100 p-3 rounded-md border border-dashed border-gray-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                      {players.length + index + 1}
                    </div>
                    <span className="text-gray-400">Waiting for player...</span>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {players.length === maxPlayers
              ? "All players have joined! Ready to start the game."
              : `Waiting for ${availableSlots} more ${availableSlots === 1 ? "player" : "players"}...`}
          </p>

          {isHost && (
            <Button
              onClick={() => {
                // Notify all players that the game is starting
                if (groupId) {
                  import("@/lib/socket").then(({ emitGameStarted }) => {
                    emitGameStarted(groupId);
                  });
                }
                onStartGame();
              }}
              disabled={!isGameReady}
              className="gap-2"
            >
              <Play size={18} />
              Start Game
            </Button>
          )}
        </div>
      </div>

      {/* Instructions Dialog - Open by default if no props are passed */}
      <Dialog defaultOpen={!groupId}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Game Lobby Instructions</DialogTitle>
            <DialogDescription>
              Share your group ID with friends to invite them to your game.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">How to play:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Share your Group ID with friends</li>
                <li>Wait for 2-5 players to join</li>
                <li>Each player will be assigned a unique color</li>
                <li>
                  The host can start the game once at least 2 players have
                  joined
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameLobby;
