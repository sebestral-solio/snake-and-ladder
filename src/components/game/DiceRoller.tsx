import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { emitDiceRoll } from "@/lib/socket";

interface DiceRollerProps {
  onRoll?: (value: number) => void;
  disabled?: boolean;
  isCurrentTurn?: boolean;
  isCurrentPlayer?: boolean;
  remoteRolling?: boolean;
  remoteValue?: number;
  groupId?: string;
  playerId?: string;
}

const DiceRoller = ({
  onRoll = () => {},
  disabled = false,
  isCurrentTurn = true,
  isCurrentPlayer = true,
  remoteRolling = false,
  remoteValue = 1,
  groupId = "",
  playerId = "",
}: DiceRollerProps) => {
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rollCount, setRollCount] = useState<number>(0);

  // Handle remote dice rolls
  useEffect(() => {
    if (remoteRolling && !isCurrentPlayer) {
      setIsRolling(true);
    } else if (
      !remoteRolling &&
      !isCurrentPlayer &&
      remoteValue !== diceValue
    ) {
      setDiceValue(remoteValue);
      setIsRolling(false);
    }
  }, [remoteRolling, remoteValue, isCurrentPlayer, diceValue]);

  // Generate a random dice value with improved randomness
  const generateRandomDiceValue = useCallback(() => {
    // Use a combination of Math.random() and current time for better randomness
    const timestamp = new Date().getTime();
    const randomSeed = Math.sin(timestamp + rollCount) * 10000;
    return Math.floor(Math.abs(randomSeed) % 6) + 1;
  }, [rollCount]);

  const rollDice = () => {
    // Only allow rolling if it's this player's turn and they are the current player
    if (disabled || isRolling || !isCurrentTurn || !isCurrentPlayer) return;

    setIsRolling(true);
    setRollCount((prev) => prev + 1);

    // Animate through random values with more dynamic animation
    const rollDuration = 1500; // 1.5 seconds total
    const intervalSpeed = 80; // Start with faster updates
    let elapsedTime = 0;
    let currentIntervalSpeed = intervalSpeed;

    const rollInterval = setInterval(() => {
      setDiceValue(generateRandomDiceValue());

      // Gradually slow down the animation
      elapsedTime += currentIntervalSpeed;
      if (elapsedTime > rollDuration / 2) {
        currentIntervalSpeed += 10; // Slow down interval speed
        clearInterval(rollInterval);

        // Create a new interval with the updated speed if we're still rolling
        if (elapsedTime < rollDuration) {
          const slowDownInterval = setInterval(() => {
            setDiceValue(generateRandomDiceValue());
            elapsedTime += currentIntervalSpeed;

            if (elapsedTime >= rollDuration) {
              clearInterval(slowDownInterval);
            }
          }, currentIntervalSpeed);
        }
      }
    }, intervalSpeed);

    // Stop rolling after the duration
    setTimeout(() => {
      const finalValue = generateRandomDiceValue();
      setDiceValue(finalValue);
      setIsRolling(false);
      onRoll(finalValue);

      // Emit the dice roll event to other players if we have group and player IDs
      if (groupId && playerId) {
        emitDiceRoll(groupId, playerId, finalValue);
      }
    }, rollDuration);
  };

  // Enhanced 3D dice face configurations
  const renderDiceFace = (value: number) => {
    return (
      <div className="relative h-full w-full rounded-lg bg-gradient-to-br from-white to-gray-100 p-2 shadow-inner">
        {value === 1 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
          </div>
        )}

        {value === 2 && (
          <div className="absolute inset-0 grid grid-cols-2 p-3">
            <div className="flex items-start justify-start">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="flex items-end justify-end">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
          </div>
        )}

        {value === 3 && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-3">
            <div className="col-start-1 row-start-1 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="col-start-2 row-start-2 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="col-start-3 row-start-3 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
          </div>
        )}

        {value === 4 && (
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-3">
            <div className="flex items-start justify-start">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="flex items-start justify-end">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="flex items-end justify-start">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="flex items-end justify-end">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
          </div>
        )}

        {value === 5 && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-3">
            <div className="col-start-1 row-start-1 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="col-start-3 row-start-1 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="col-start-2 row-start-2 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="col-start-1 row-start-3 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="col-start-3 row-start-3 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
          </div>
        )}

        {value === 6 && (
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 p-3">
            <div className="flex items-start justify-start">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="flex items-start justify-end">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="flex items-center justify-start">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="flex items-center justify-end">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="flex items-end justify-start">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
            <div className="flex items-end justify-end">
              <div className="h-4 w-4 rounded-full bg-red-600 shadow-md"></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-white p-4 rounded-lg shadow-md w-[180px] h-[180px]">
      <motion.div
        className="w-24 h-24 bg-white rounded-lg shadow-xl border-2 border-gray-300 overflow-hidden"
        animate={{
          rotateX: isRolling ? [0, 360, 720, 1080] : 0,
          rotateY: isRolling ? [0, 360, 720, 1080] : 0,
          rotateZ: isRolling ? [0, 180, 360, 540] : 0,
          scale: isRolling ? [1, 0.8, 1.1, 0.9, 1] : 1,
          z: isRolling ? [0, 20, -20, 10, 0] : 0,
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: isRolling ? 1 : 0,
          repeatType: "loop",
        }}
      >
        {renderDiceFace(diceValue)}
      </motion.div>

      <Button
        onClick={rollDice}
        disabled={disabled || isRolling || !isCurrentTurn || !isCurrentPlayer}
        className="mt-2 w-full"
        variant={isCurrentTurn && isCurrentPlayer ? "default" : "outline"}
      >
        {isRolling
          ? "Rolling..."
          : isCurrentTurn && isCurrentPlayer
            ? "Roll Dice"
            : "Waiting..."}
      </Button>
    </div>
  );
};

export default DiceRoller;
