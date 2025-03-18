import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Wifi, WifiOff, Users } from "lucide-react";

interface RealTimeSyncProps {
  groupId: string;
  playerCount?: number;
  isConnected?: boolean;
  onReconnect?: () => void;
}

/**
 * A component that displays the real-time connection status
 * and allows reconnecting if the connection is lost.
 */
const RealTimeSync = ({
  groupId,
  playerCount = 0,
  isConnected = true,
  onReconnect = () => {},
}: RealTimeSyncProps) => {
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >(isConnected ? "connected" : "disconnected");

  // Simulate connection status changes
  useEffect(() => {
    setConnectionStatus(isConnected ? "connected" : "disconnected");
  }, [isConnected]);

  const handleReconnect = () => {
    setConnectionStatus("connecting");

    // Simulate reconnection attempt
    setTimeout(() => {
      setConnectionStatus("connected");
      onReconnect();
    }, 1500);
  };

  if (connectionStatus === "connected") {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Wifi size={16} />
          <span>Connected to room {groupId}</span>
        </div>

        {playerCount > 0 && (
          <div className="flex items-center gap-1 text-sm text-blue-500">
            <Users size={16} />
            <span>
              {playerCount} player{playerCount !== 1 ? "s" : ""} online
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {connectionStatus === "disconnected" ? (
        <>
          <WifiOff size={16} className="text-red-500" />
          <span className="text-sm text-red-500">Connection lost</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReconnect}
            className="ml-2 text-xs h-7 px-2"
          >
            Reconnect
          </Button>
        </>
      ) : (
        <>
          <Wifi size={16} className="text-amber-500 animate-pulse" />
          <span className="text-sm text-amber-500">Connecting...</span>
        </>
      )}
    </div>
  );
};

export default RealTimeSync;
