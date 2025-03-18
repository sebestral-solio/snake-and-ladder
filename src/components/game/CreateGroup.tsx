import React, { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface CreateGroupProps {
  isOpen?: boolean;
  onClose?: () => void;
  onProceed?: (groupId: string) => void;
}

const CreateGroup = ({
  isOpen = true,
  onClose = () => {},
  onProceed = () => {},
}: CreateGroupProps) => {
  const [groupId, setGroupId] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Generate a random group ID when component mounts
  useEffect(() => {
    const generateGroupId = () => {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 6; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }
      return result;
    };

    setGroupId(generateGroupId());
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(groupId);
    setCopied(true);

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleProceed = () => {
    onProceed(groupId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-b from-purple-900 to-indigo-900 border-2 border-purple-500 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-purple-200">
            Create New Game Group
          </DialogTitle>
          <DialogDescription className="text-purple-200 text-center">
            Share this unique group ID with your friends to let them join your
            game.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="bg-purple-800 p-6 rounded-lg border-2 border-purple-500 w-full max-w-xs">
            <h3 className="text-sm font-medium mb-2 text-purple-300">
              Your Group ID
            </h3>
            <div className="relative">
              <Input
                value={groupId}
                readOnly
                className="bg-purple-700 text-white text-xl font-bold tracking-wider text-center border-purple-600 focus-visible:ring-purple-400"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white hover:bg-purple-600"
                onClick={handleCopyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-purple-800/50 p-4 rounded-lg w-full max-w-xs">
            <p className="text-sm text-purple-300 text-center">
              {copied
                ? "Group ID copied to clipboard!"
                : "Click the copy icon to copy the Group ID"}
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-center sm:justify-center">
          <Button
            onClick={handleProceed}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-8 py-2 rounded-md transition-all duration-200 transform hover:scale-105"
          >
            Proceed to Lobby
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
