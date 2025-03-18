import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { AlertCircle } from "lucide-react";

interface JoinGroupProps {
  isOpen?: boolean;
  onClose?: () => void;
  onJoinSuccess?: (groupId: string) => void;
}

const JoinGroup = ({
  isOpen = true,
  onClose = () => {},
  onJoinSuccess = () => {},
}: JoinGroupProps) => {
  const [groupId, setGroupId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = () => {
    if (!groupId.trim()) {
      setError("Please enter a group ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call to check if group exists and has space
    setTimeout(() => {
      // This is just a placeholder for the actual implementation
      // In a real app, you would check if the group exists and has available slots
      const groupExists = Math.random() > 0.3; // Simulate 70% chance group exists
      const groupHasSpace = Math.random() > 0.2; // Simulate 80% chance group has space

      if (!groupExists) {
        setError("Group not found. Please check the ID and try again.");
        setIsLoading(false);
      } else if (!groupHasSpace) {
        setError(
          "This group is full. Please join another group or create a new one.",
        );
        setIsLoading(false);
      } else {
        // Success case
        setIsLoading(false);
        onJoinSuccess(groupId);
      }
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Join a Game Group
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            Enter the group ID provided by the group creator to join the game.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter Group ID"
              value={groupId}
              onChange={(e) => {
                setGroupId(e.target.value);
                setError(null);
              }}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
            {error && (
              <div className="flex items-center text-red-400 text-sm gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleJoin}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? "Joining..." : "Join Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroup;
