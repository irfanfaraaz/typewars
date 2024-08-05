"use client";

import type { Player } from "@/lib/types/types";
import { Card } from "./ui/card";

export default function Leaderboard({
  player,
  rank,
  isHost,
}: {
  player: Player;
  rank: number;
  isHost: boolean;
}) {
  return (
    <Card className="w-full flex p-5 gap-5">
      <div className="text-xl"># {rank}</div>
      <div className="text-xl">
        {player.name}{" "}
        {isHost && <span className="text-sm text-gray-500">(Host)</span>}
      </div>
      <div className="ml-auto text-xl">{player.score}</div>
    </Card>
  );
}
