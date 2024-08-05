"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const router = useRouter();
  const [gameType, setGameType] = useState("free");

  function joinGame(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const inviteCode = formData.get("inviteCode") as string;

    if (!inviteCode) return toast.error("Invite code is required");

    const inviteCodePattern = /^(free|paid)-[0-9a-fA-F-]{36}$/;
    if (!inviteCodePattern.test(inviteCode)) {
      return toast.error("Invalid invite code format");
    }

    router.push(`/game/${inviteCode}`);
  }

  function createGame() {
    const inviteCode = `${gameType}-${uuidv4()}`;
    router.push(`/game/${inviteCode}`);
  }

  return (
    <main className="w-full mx-auto max-w-5xl p-5">
      <h1 className="font-bold text-4xl mt-10">Typing Battle</h1>
      <p className="mt-5 text-gray-400 text-lg">
        Challenge your friends to a typing battle and see who can type the most
        in under a minute! Create or join a game to get started. You can even
        play solo to practice.
      </p>
      <Card className="p-5 mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-medium text-2xl">Create Game</h2>
            <p className="text-gray-400 mt-5">
              Start a new game and invite your friends to join you in a typing
              race! Once you create a game, you&apos;ll receive an invite code.
              As the host, you can challenge your friends to see who types the
              fastest.
            </p>
            <div className="mt-5">
              <label className="block mb-2">Select Game Type :</label>
              <Select value={gameType} onValueChange={setGameType}>
                <SelectTrigger className="p-2 border rounded">
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Button className="mt-5 w-full" onClick={createGame}>
              Create Game
            </Button>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-medium text-2xl">Join Game</h2>
            <p className="text-gray-400 mt-5">
              Enter an invite code to join a game and compete against your
              friends in a typing race. May the fastest typist win!
            </p>
          </div>

          <div className="mt-5">
            <form onSubmit={joinGame}>
              <Input type="text" placeholder="Invite code" name="inviteCode" />
              <Button className="mt-3 w-full">Join Game</Button>
            </form>
          </div>
        </div>
      </Card>
    </main>
  );
}
