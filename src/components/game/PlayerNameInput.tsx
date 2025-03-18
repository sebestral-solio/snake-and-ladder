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

interface PlayerNameInputProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit: (name: string) => void;
  title?: string;
  description?: string;
}

const PlayerNameInput = ({
  isOpen = true,
  onClose = () => {},
  onSubmit,
  title = "Enter Your Name",
  description = "Please enter your name to continue.",
}: PlayerNameInputProps) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    onSubmit(name.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Your Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
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
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerNameInput;
