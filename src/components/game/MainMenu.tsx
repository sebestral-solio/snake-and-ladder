import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dices, Users, UserPlus } from "lucide-react";

interface MainMenuProps {
  onCreateGroup?: () => void;
  onJoinGroup?: () => void;
  playerName?: string;
}

const MainMenu = ({
  onCreateGroup = () => {},
  onJoinGroup = () => {},
  playerName = "",
}: MainMenuProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-purple-900 to-indigo-900 p-4">
      <motion.div
        className="w-full max-w-[600px] bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="flex items-center justify-center mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 10,
            }}
          >
            <Dices className="h-16 w-16 text-yellow-400 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
              Snake & Ladder
            </h1>
          </motion.div>
          <p className="text-lg text-gray-200 max-w-md mx-auto">
            Join friends in a classic game of Snake and Ladder with multiplayer
            action!
          </p>
          {playerName && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-2 text-lg text-gray-200"
            >
              Welcome, {playerName}!
            </motion.p>
          )}
        </div>

        <div className="space-y-4">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              onClick={onCreateGroup}
              className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-none"
              size="lg"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Create Group
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              onClick={onJoinGroup}
              className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-none"
              size="lg"
            >
              <Users className="mr-2 h-5 w-5" />
              Join Group
            </Button>
          </motion.div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Gather 4-5 players to start a game</p>
          <p className="mt-1">Create a group or join one with a unique ID</p>
        </div>
      </motion.div>

      <div className="mt-6 text-xs text-gray-400">
        © 2023 Snake & Ladder Multiplayer | v1.0.0
      </div>
    </div>
  );
};

export default MainMenu;
