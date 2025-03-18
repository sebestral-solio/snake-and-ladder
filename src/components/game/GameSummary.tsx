import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Trophy, Home, RefreshCw } from "lucide-react";

interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  rank: number;
}

interface GameSummaryProps {
  players?: Player[];
  onPlayAgain?: () => void;
  onExitGame?: () => void;
}

const GameSummary = ({
  players = [
    { id: "1", name: "Player 1", color: "red", position: 100, rank: 1 },
    { id: "2", name: "Player 2", color: "blue", position: 87, rank: 2 },
    { id: "3", name: "Player 3", color: "green", position: 65, rank: 3 },
    { id: "4", name: "Player 4", color: "yellow", position: 42, rank: 4 },
  ],
  onPlayAgain = () => console.log("Play again clicked"),
  onExitGame = () => console.log("Exit game clicked"),
}: GameSummaryProps) => {
  // Sort players by rank
  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
    };
    return colorMap[color.toLowerCase()] || "bg-gray-500";
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `${rank}th`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-indigo-900 to-purple-900">
      <motion.div
        className="w-full max-w-3xl p-8 rounded-xl bg-white/10 backdrop-blur-md shadow-2xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Game Over!</h1>
          <p className="text-xl text-indigo-200">Final Rankings</p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          {/* Winner spotlight */}
          {sortedPlayers.length > 0 && (
            <div className="flex flex-col items-center mb-8">
              <div
                className={`w-20 h-20 rounded-full ${getColorClass(sortedPlayers[0].color)} flex items-center justify-center mb-4 border-4 border-yellow-300 shadow-lg`}
              >
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {sortedPlayers[0].name}
              </h2>
              <p className="text-indigo-200">Winner!</p>
            </div>
          )}

          {/* All players ranking */}
          <div className="bg-white/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-indigo-300/30">
                  <th className="py-3 px-4 text-left text-indigo-100">Rank</th>
                  <th className="py-3 px-4 text-left text-indigo-100">
                    Player
                  </th>
                  <th className="py-3 px-4 text-right text-indigo-100">
                    Final Position
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player) => (
                  <motion.tr
                    key={player.id}
                    className="border-b border-indigo-300/20 hover:bg-white/10 transition-colors"
                    variants={itemVariants}
                  >
                    <td className="py-3 px-4 text-xl text-white">
                      {getRankEmoji(player.rank)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full ${getColorClass(player.color)} mr-3`}
                        ></div>
                        <span className="text-white">{player.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-indigo-100">
                      {player.position}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center gap-4 mt-8"
        >
          <Button
            onClick={onPlayAgain}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Play Again
          </Button>
          <Button
            onClick={onExitGame}
            variant="outline"
            className="flex items-center gap-2 border-indigo-300 text-indigo-100 hover:bg-indigo-800 px-6 py-3 rounded-lg text-lg"
          >
            <Home className="w-5 h-5" />
            Exit to Menu
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameSummary;
