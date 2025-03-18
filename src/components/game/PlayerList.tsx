import React from "react";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Crown, Trophy } from "lucide-react";

interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  isCurrentTurn: boolean;
  isWinner?: boolean;
}

interface PlayerListProps {
  players: Player[];
  gameStarted?: boolean;
}

const PlayerList = ({
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
  gameStarted = false,
}: PlayerListProps) => {
  // Sort players by position in descending order (highest position first)
  const sortedPlayers = [...players].sort((a, b) => b.position - a.position);

  return (
    <Card className="w-full max-w-xs bg-white p-4 shadow-md rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">Players</h3>
        {gameStarted && (
          <Badge variant="outline" className="px-2 py-1">
            Turn {players.findIndex((p) => p.isCurrentTurn) + 1}/
            {players.length}
          </Badge>
        )}
      </div>

      <Separator className="mb-3" />

      <div className="space-y-3">
        {sortedPlayers.map((player) => (
          <div
            key={player.id}
            className={`flex items-center p-2 rounded-md ${player.isCurrentTurn ? "bg-slate-100 ring-2 ring-slate-200" : ""}`}
          >
            <div className={`w-4 h-4 rounded-full ${player.color} mr-3`}></div>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="font-medium">{player.name}</span>
                {player.isCurrentTurn && !player.isWinner && (
                  <Badge className="ml-2 bg-blue-500 text-xs">
                    Current Turn
                  </Badge>
                )}
                {player.isWinner && (
                  <Trophy className="ml-2 h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="text-xs text-gray-500">
                Position: {player.position}
              </div>
            </div>
            {gameStarted &&
              sortedPlayers.indexOf(player) === 0 &&
              !player.isWinner && <Crown className="h-4 w-4 text-yellow-500" />}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PlayerList;
