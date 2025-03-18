import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DiceRoller from "./DiceRoller";
import PlayerList from "./PlayerList";
import ChatBox from "./ChatBox";
import RealTimeSync from "./RealTimeSync";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, HelpCircle, MessageSquare, X } from "lucide-react";

interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  isCurrentTurn: boolean;
  isWinner?: boolean;
}

interface Snake {
  head: number;
  tail: number;
}

interface Ladder {
  bottom: number;
  top: number;
}

interface GameBoardProps {
  groupId?: string;
  players?: Player[];
  onGameEnd?: (winner: Player) => void;
  onExitGame?: () => void;
  currentPlayerId?: string;
  onPlayerJoin?: (player: Player) => void;
  onPlayerMove?: (playerId: string, position: number) => void;
  onTurnChange?: (playerId: string) => void;
}

const GameBoard = ({
  groupId = "ABC123",
  players = [
    {
      id: "1",
      name: "Player 1",
      color: "bg-red-500",
      position: 1,
      isCurrentTurn: true,
    },
    {
      id: "2",
      name: "Player 2",
      color: "bg-blue-500",
      position: 1,
      isCurrentTurn: false,
    },
    {
      id: "3",
      name: "Player 3",
      color: "bg-green-500",
      position: 1,
      isCurrentTurn: false,
    },
    {
      id: "4",
      name: "Player 4",
      color: "bg-yellow-500",
      position: 1,
      isCurrentTurn: false,
    },
  ],
  onGameEnd = () => {},
  onExitGame = () => {},
  currentPlayerId = "1", // Default to player 1 as the current player
  onPlayerJoin = () => {},
  onPlayerMove = () => {},
  onTurnChange = () => {},
}: GameBoardProps) => {
  const [gameState, setGameState] = useState<{
    players: Player[];
    currentPlayerIndex: number;
    gameOver: boolean;
    winner: Player | null;
    lastRoll: number | null;
    showChatBox: boolean;
    showRules: boolean;
    isRolling: boolean;
    currentDiceValue: number;
  }>({
    players: [...players],
    currentPlayerIndex: players.findIndex((p) => p.isCurrentTurn),
    gameOver: false,
    winner: null,
    lastRoll: null,
    showChatBox: false,
    showRules: false,
    isRolling: false,
    currentDiceValue: 1,
  });

  // Define snakes and ladders
  const snakes: Snake[] = [
    { head: 16, tail: 6 },
    { head: 47, tail: 26 },
    { head: 49, tail: 11 },
    { head: 56, tail: 53 },
    { head: 62, tail: 19 },
    { head: 64, tail: 60 },
    { head: 87, tail: 24 },
    { head: 93, tail: 73 },
    { head: 95, tail: 75 },
    { head: 98, tail: 78 },
  ];

  const ladders: Ladder[] = [
    { bottom: 1, top: 38 },
    { bottom: 4, top: 14 },
    { bottom: 9, top: 31 },
    { bottom: 21, top: 42 },
    { bottom: 28, top: 84 },
    { bottom: 36, top: 44 },
    { bottom: 51, top: 67 },
    { bottom: 71, top: 91 },
    { bottom: 80, top: 100 },
  ];

  // Check if the current player is the one whose turn it is
  const isCurrentPlayersTurn = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer && currentPlayer.id === currentPlayerId;
  };

  // Generate the board cells (10x10 grid)
  const generateBoardCells = () => {
    const cells = [];
    let cellNumber = 100;

    for (let row = 0; row < 10; row++) {
      const rowCells = [];
      for (let col = 0; col < 10; col++) {
        // Alternate direction for each row to create snake pattern
        const position = row % 2 === 0 ? 10 - col : col + 1;
        const actualCellNumber = 10 * row + position;
        cellNumber = 101 - actualCellNumber; // Reverse numbering (100 at bottom left, 1 at top right)

        // Determine cell type
        const isSnakeHead = snakes.some((snake) => snake.head === cellNumber);
        const isSnakeTail = snakes.some((snake) => snake.tail === cellNumber);
        const isLadderBottom = ladders.some(
          (ladder) => ladder.bottom === cellNumber,
        );
        const isLadderTop = ladders.some((ladder) => ladder.top === cellNumber);

        rowCells.push({
          number: cellNumber,
          isSnakeHead,
          isSnakeTail,
          isLadderBottom,
          isLadderTop,
        });
      }
      cells.push(rowCells);
    }
    return cells;
  };

  const boardCells = generateBoardCells();

  // Handle dice roll
  const handleDiceRoll = (value: number) => {
    if (gameState.gameOver || !isCurrentPlayersTurn()) return;

    // Set rolling state
    setGameState((prev) => ({
      ...prev,
      isRolling: true,
      currentDiceValue: value,
    }));

    // After rolling animation completes, update player position
    setTimeout(() => {
      const currentPlayerIndex = gameState.currentPlayerIndex;
      const updatedPlayers = [...gameState.players];
      const currentPlayer = updatedPlayers[currentPlayerIndex];

      // Calculate new position
      let newPosition = currentPlayer.position + value;

      // Check if player won
      if (newPosition >= 100) {
        newPosition = 100;
        currentPlayer.position = newPosition;
        currentPlayer.isWinner = true;

        setGameState((prev) => ({
          ...prev,
          players: updatedPlayers,
          gameOver: true,
          winner: currentPlayer,
          lastRoll: value,
          isRolling: false,
        }));

        // Notify about player movement
        onPlayerMove(currentPlayer.id, newPosition);
        onGameEnd(currentPlayer);
        return;
      }

      // Check if landed on a snake head
      const snake = snakes.find((s) => s.head === newPosition);
      if (snake) {
        newPosition = snake.tail;
      }

      // Check if landed on a ladder bottom
      const ladder = ladders.find((l) => l.bottom === newPosition);
      if (ladder) {
        newPosition = ladder.top;
      }

      // Update player position
      currentPlayer.position = newPosition;

      // Move to next player
      const nextPlayerIndex = (currentPlayerIndex + 1) % updatedPlayers.length;
      updatedPlayers.forEach((player, index) => {
        player.isCurrentTurn = index === nextPlayerIndex;
      });

      // Notify about player movement and turn change
      onPlayerMove(currentPlayer.id, newPosition);
      onTurnChange(updatedPlayers[nextPlayerIndex].id);

      setGameState((prev) => ({
        ...prev,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        lastRoll: value,
        isRolling: false,
      }));
    }, 1500); // Match the dice rolling animation duration
  };

  // Handle remote player updates
  useEffect(() => {
    // This would be replaced with real-time updates from a backend
    // For now, we're just updating the local state with the props
    setGameState((prev) => ({
      ...prev,
      players: [...players],
      currentPlayerIndex: players.findIndex((p) => p.isCurrentTurn),
    }));
  }, [players]);

  // Render player tokens on the board
  const renderPlayerTokens = (cellNumber: number) => {
    const playersOnCell = gameState.players.filter(
      (p) => p.position === cellNumber,
    );

    if (playersOnCell.length === 0) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-wrap gap-1 max-w-full">
          {playersOnCell.map((player) => (
            <motion.div
              key={player.id}
              className={`w-3 h-3 rounded-full ${player.color} border border-white`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Render a single cell
  const renderCell = (cell: any) => {
    let bgColor = "bg-white";
    let borderColor = "border-gray-200";

    if (cell.isSnakeHead) {
      bgColor = "bg-red-100";
      borderColor = "border-red-300";
    } else if (cell.isLadderBottom) {
      bgColor = "bg-green-100";
      borderColor = "border-green-300";
    } else if (cell.number % 2 === 0) {
      bgColor = "bg-slate-50";
    }

    return (
      <div
        key={cell.number}
        className={`relative border ${borderColor} ${bgColor} w-full h-full flex items-center justify-center`}
      >
        <span className="text-xs font-medium z-10">{cell.number}</span>
        {cell.isSnakeHead && (
          <span className="absolute text-xs text-red-500 top-0 right-1">
            🐍
          </span>
        )}
        {cell.isLadderBottom && (
          <span className="absolute text-xs text-green-500 top-0 right-1">
            🪜
          </span>
        )}
        {renderPlayerTokens(cell.number)}
      </div>
    );
  };

  // Toggle chat box visibility
  const toggleChatBox = () => {
    setGameState((prev) => ({
      ...prev,
      showChatBox: !prev.showChatBox,
    }));
  };

  // Toggle rules dialog
  const toggleRules = () => {
    setGameState((prev) => ({
      ...prev,
      showRules: !prev.showRules,
    }));
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onExitGame}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Snake and Ladder</h1>
          <span className="text-sm text-gray-500">Group: {groupId}</span>
          <RealTimeSync groupId={groupId} />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleRules}>
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleChatBox}>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Game board */}
        <Card className="flex-1 p-4 bg-white shadow-md rounded-lg">
          <div className="relative aspect-square w-full max-w-2xl mx-auto">
            <div className="grid grid-cols-10 grid-rows-10 h-full w-full border border-gray-300">
              {boardCells.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  {row.map((cell) => renderCell(cell))}
                </React.Fragment>
              ))}
            </div>

            {/* Visual representation of snakes and ladders could be added here */}
            {/* This would require SVG paths or canvas drawing which is beyond the scope of this scaffolding */}
          </div>
        </Card>

        {/* Game controls and info */}
        <div className="flex flex-col gap-4 w-full lg:w-80">
          <PlayerList players={gameState.players} gameStarted={true} />

          <div className="flex flex-col items-center">
            <DiceRoller
              onRoll={handleDiceRoll}
              disabled={gameState.gameOver}
              isCurrentTurn={
                gameState.players[gameState.currentPlayerIndex]?.isCurrentTurn
              }
              isCurrentPlayer={isCurrentPlayersTurn()}
              remoteRolling={gameState.isRolling}
              remoteValue={gameState.currentDiceValue}
            />

            {gameState.lastRoll && (
              <div className="mt-2 text-sm text-center">
                Last roll:{" "}
                <span className="font-bold">{gameState.lastRoll}</span>
                {!isCurrentPlayersTurn() &&
                  gameState.players[gameState.currentPlayerIndex] && (
                    <span className="block text-xs text-gray-500">
                      {gameState.players[gameState.currentPlayerIndex].name}'s
                      turn
                    </span>
                  )}
              </div>
            )}
          </div>

          {/* Mobile chat toggle */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              className="w-full"
              onClick={toggleChatBox}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {gameState.showChatBox ? "Hide Chat" : "Show Chat"}
            </Button>
          </div>

          {/* Chat box (visible on desktop, toggleable on mobile) */}
          <div
            className={`${gameState.showChatBox ? "block" : "hidden lg:block"} h-80 lg:h-auto lg:flex-1`}
          >
            <ChatBox
              groupId={groupId}
              currentPlayer={{
                name:
                  gameState.players.find((p) => p.id === currentPlayerId)
                    ?.name || "You",
                color:
                  gameState.players
                    .find((p) => p.id === currentPlayerId)
                    ?.color.replace("bg-", "") || "red-500",
              }}
            />
          </div>
        </div>
      </div>

      {/* Game rules dialog */}
      <AlertDialog open={gameState.showRules}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Game Rules</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Objective:</strong> Be the first player to reach
                  square 100.
                </p>
                <Separator />
                <p>
                  <strong>How to Play:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Players take turns rolling the dice.</li>
                  <li>
                    Move your token forward by the number shown on the dice.
                  </li>
                  <li>
                    If you land on a ladder, you climb up to the square at the
                    top of the ladder.
                  </li>
                  <li>
                    If you land on a snake head, you slide down to the square at
                    the tail of the snake.
                  </li>
                  <li>
                    You must land exactly on square 100 to win. If your roll
                    would take you beyond square 100, you don't move.
                  </li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={toggleRules}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Winner dialog */}
      <AlertDialog open={gameState.gameOver}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              🎉 We Have a Winner! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              <div className="py-4">
                <div
                  className={`w-12 h-12 rounded-full mx-auto ${gameState.winner?.color} flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-xl">
                    {gameState.winner?.name.charAt(0)}
                  </span>
                </div>
                <p className="mt-4 text-lg font-medium">
                  {gameState.winner?.name} has won the game!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center">
            <AlertDialogAction onClick={onExitGame}>
              Return to Lobby
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GameBoard;
