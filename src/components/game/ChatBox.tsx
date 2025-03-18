import React, { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { Separator } from "../ui/separator";

interface Message {
  id: string;
  sender: string;
  content: string;
  color: string;
  timestamp: Date;
}

interface ChatBoxProps {
  groupId?: string;
  currentPlayer?: {
    name: string;
    color: string;
  };
  onSendMessage?: (message: string) => void;
}

const ChatBox = ({
  groupId = "ABC123",
  currentPlayer = { name: "Player 1", color: "red" },
  onSendMessage = () => {},
}: ChatBoxProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "Player 2",
      content: "Good luck everyone!",
      color: "blue",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      sender: "Player 3",
      content: "Hope I don't land on any snakes 🐍",
      color: "green",
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: "3",
      sender: "Player 4",
      content: "Let's have fun!",
      color: "yellow",
      timestamp: new Date(Date.now() - 60000),
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: currentPlayer.name,
        content: message,
        color: currentPlayer.color,
        timestamp: new Date(),
      };

      setMessages([...messages, newMessage]);
      onSendMessage(message);
      setMessage("");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md border rounded-lg shadow-md bg-white">
      <div className="p-3 bg-slate-100 rounded-t-lg">
        <h3 className="font-semibold text-lg">Game Chat</h3>
        <p className="text-xs text-slate-500">Group ID: {groupId}</p>
      </div>

      <Separator />

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <Avatar
                className="h-8 w-8"
                style={{ backgroundColor: msg.color }}
              >
                <span className="text-xs text-white font-bold">
                  {msg.sender.charAt(0).toUpperCase()}
                </span>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline">
                  <span className="font-medium text-sm mr-2">{msg.sender}</span>
                  <span className="text-xs text-slate-400">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-sm mt-1 break-words">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-3 flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button
          onClick={handleSendMessage}
          size="icon"
          disabled={!message.trim()}
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ChatBox;
