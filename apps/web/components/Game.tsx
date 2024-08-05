"use client";

import type {
  GameProps,
  GameStatus,
  Player,
  PlayerScore,
} from "@/lib/types/types";
import { useEffect, useState, useRef } from "react";
import { Socket, io } from "socket.io-client";
import { toast } from "sonner";
import Leaderboard from "./Leaderboard";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function Game({ gameId, name, gameType }: GameProps) {
  const [ioInstance, setIoInstance] = useState<Socket>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("not-started");
  const [paragraph, setParagraph] = useState<string>("");
  const [host, setHost] = useState<string>("");
  const [inputParagraph, setInputParagraph] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("60");
  const [timeLeft, setTimeLeft] = useState<number>(Number(selectedTime));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL as string, {
      transports: ["websocket"],
    });
    setIoInstance(socket);

    socket.emit("join-game", gameId, name);

    return () => {
      removeListeners();
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setupListeners();
    return () => removeListeners();
  }, [ioInstance]);

  useEffect(() => {
    if (!ioInstance || gameStatus !== "in-progress") return;

    ioInstance.emit("player-typed", inputParagraph);
  }, [inputParagraph]);

  useEffect(() => {
    if (gameStatus === "not-started") {
      setTimeLeft(Number(selectedTime));
    }
  }, [selectedTime, gameStatus]);

  useEffect(() => {
    if (gameStatus !== "in-progress") return;

    setTimeLeft(Number(selectedTime));

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          ioInstance?.emit("timer-update", 0);
          return 0;
        }
        const newTimeLeft = prev - 1;
        ioInstance?.emit("timer-update", newTimeLeft);
        return newTimeLeft;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, selectedTime]);

  function setupListeners() {
    if (!ioInstance) return;

    ioInstance.on("connect", () => {
      console.log("connected");
    });

    ioInstance.on("players", (players: Player[]) => {
      console.log("received players");
      setPlayers(players);
    });

    ioInstance.on("player-joined", (player: Player) => {
      setPlayers((prev) => [...prev, player]);
      toast.success(
        `${player.name} has joined the game as a ${gameType} player!`
      );
    });

    ioInstance.on("player-left", (id: string) => {
      setPlayers((prev) => prev.filter((player) => player.id !== id));
    });

    ioInstance.on("player-score", ({ id, score }: PlayerScore) => {
      setPlayers((prev) =>
        prev.map((player) => {
          if (player.id === id) {
            return {
              ...player,
              score,
            };
          }
          return player;
        })
      );
    });

    ioInstance.on("game-started", (paragraph: string) => {
      setParagraph(paragraph);
      setGameStatus("in-progress");
      setTimeLeft(Number(selectedTime));
      textareaRef.current?.focus();
    });

    ioInstance.on("game-finished", () => {
      setGameStatus("finished");
      setInputParagraph("");
    });

    ioInstance.on("new-host", (id: string) => {
      setHost(id);
    });

    ioInstance.on("error", (message: string) => {
      toast.error(message);
    });
  }

  function removeListeners() {
    if (!ioInstance) return;

    ioInstance.off("connect");
    ioInstance.off("players");
    ioInstance.off("player-joined");
    ioInstance.off("player-left");
    ioInstance.off("player-score");
    ioInstance.off("game-started");
    ioInstance.off("game-finished");
    ioInstance.off("new-host");
    ioInstance.off("game-type");
    ioInstance.off("error");
  }

  function startGame() {
    if (!ioInstance) return;

    ioInstance.emit("start-game", Number(selectedTime));
    setGameStatus("in-progress");
    textareaRef.current?.focus();
  }

  function copyInviteCode() {
    navigator.clipboard
      .writeText(gameId)
      .then(() => {
        toast.success("Invite code copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy invite code.");
      });
  }

  function copyInviteLink() {
    const inviteLink = `${window.location.origin}/game/${gameId}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        toast.success("Invite link copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy invite link.");
      });
  }

  window.onbeforeunload = () => {
    if (ioInstance) {
      ioInstance.emit("leave");
    }
  };

  return (
    <div className="w-screen p-10 grid grid-cols-1 lg:grid-cols-3 gap-20">
      <div className="w-full order-last lg:order-first">
        <h2 className="text-2xl font-medium mb-10 mt-10 lg:mt-0">
          Leaderboard
        </h2>
        <div className="flex flex-col gap-5 w-full">
          {players
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <Leaderboard
                key={player.id}
                player={player}
                rank={index + 1}
                isHost={player.id === host}
              />
            ))}
        </div>
      </div>

      <div className="lg:col-span-2 h-full">
        {gameStatus === "not-started" && (
          <div className="flex flex-col items-center justify-center p-10">
            <h1 className="text-2xl font-bold">
              Waiting for players to join...
            </h1>
            <h2 className="text-xl font-medium mt-5">Game Type: {gameType}</h2>

            {host === ioInstance?.id && (
              <>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="w-52 mt-5">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="90">90 seconds</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-52 mt-10 " onClick={startGame}>
                  Start Game
                </Button>
              </>
            )}
            <Button className=" w-52 mt-5 " onClick={copyInviteCode}>
              Copy Invite Code
            </Button>
            <Button className="w-52 mt-5" onClick={copyInviteLink}>
              Copy Invite Link
            </Button>
          </div>
        )}

        {gameStatus === "in-progress" && (
          <div className="h-full">
            <div className="w-full order-last lg:order-first">
              <h2 className="text-xl font-medium mb-10 mt-10 lg:mt-0">
                Time Left: {timeLeft} seconds
              </h2>
            </div>
            <h1 className="text-2xl font-bold mb-10">
              Type the paragraph below
            </h1>

            <div className="relative h-full">
              <p className="text-2xl lg:text-5xl p-5">{paragraph}</p>

              <Textarea
                ref={textareaRef}
                value={inputParagraph}
                onChange={(e) => setInputParagraph(e.target.value)}
                className="text-2xl lg:text-5xl outline-none p-5 absolute top-0 left-0 right-0 bottom-0 z-10 opacity-75"
                placeholder=""
                disabled={gameStatus !== "in-progress" || !ioInstance}
              />
            </div>
          </div>
        )}

        {gameStatus === "finished" && (
          <div className="flex flex-col items-center justify-center p-10">
            <h1 className="text-2xl font-bold text-center">
              Game finished!
              {ioInstance?.id === host
                ? " Restart the game fresh!"
                : " Waiting for the host to restart the game."}
            </h1>

            {host === ioInstance?.id && (
              <Button className="mt-10 px-20" onClick={startGame}>
                Start Game
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
