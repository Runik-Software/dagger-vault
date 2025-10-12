"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import type { Channel } from "pusher-js";
import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { getCharacters } from "@/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPusherClient } from "@/lib/pusher";
import type { Character, DiceRoll } from "@/schema";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function DiceRoller({ campaignId }: { campaignId: string }) {
  const [rolls, setRolls] = useState<DiceRoll[]>([]);
  const [rollAsCharacter, setRollAsCharacter] = useState<Character | null>(
    null,
  );
  const rollChannel = useRef<Channel>(null);

  const { data: characters } = useQuery({
    queryKey: ["characters"],
    queryFn: () => {
      return getCharacters(campaignId);
    },
  });

  const rollDice = () => {
    const hopeDie = Math.floor(Math.random() * 12) + 1;
    const fearDie = Math.floor(Math.random() * 12) + 1;

    const newRoll: DiceRoll = { hopeDie, fearDie, character: rollAsCharacter };
    rollChannel.current?.trigger("client-newRoll", newRoll);
    setRolls((prev) => [newRoll, ...prev]);
  };

  const getMessageForDieRoll = ({ hopeDie, fearDie, character }: DiceRoll) => {
    const total = hopeDie + fearDie;
    let message = character
      ? `${character.name} rolled a ${total} `
      : `Rolled a ${total} `;

    if (hopeDie > fearDie) message += "with Hope 🙏";
    else if (fearDie > hopeDie) message += "with Fear 💀";
    else message += "- Critical success 🏆";

    return message;
  };

  const clearRollHistory = () => {
    if (rolls[0]) {
      setRolls((old) => {
        if (old[0]) {
          return [old[0]];
        }
        return [];
      });
    }
  };

  useEffect(() => {
    const pusher = createPusherClient(campaignId);

    rollChannel.current = pusher.subscribe(
      `private-campaign-${campaignId}-rolls`,
    );

    rollChannel.current.bind("client-newRoll", (roll: DiceRoll) => {
      setRolls((old) => [roll, ...old]);
    });

    return () => {
      rollChannel.current?.unbind_all();
      pusher.unsubscribe(`private-campaign-${campaignId}-rolls`);
      pusher.disconnect();
    };
  }, [campaignId]);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Dice Roller (2d12)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            className="mb-4"
            placeholder="Roll as character"
            isClearable
            onChange={(c) => setRollAsCharacter(c)}
            getOptionLabel={(c) => c.name}
            getOptionValue={(c) => c.id}
            options={characters ?? []}
          />
          <Button onClick={rollDice} className="w-full mb-4">
            Roll!
          </Button>
          {rolls.length > 0 && (
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                {getMessageForDieRoll(rolls[0])}
              </div>
              <div className="text-sm text-gray-500">
                (Hope: {rolls[0].hopeDie}, Fear: {rolls[0].fearDie})
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" className="mr-4" onClick={clearRollHistory}>
                  <X />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear</TooltipContent>
            </Tooltip>
            Previous Rolls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            {rolls.slice(1).map((r, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Indes is fine
              <li key={i}>
                {getMessageForDieRoll(r)} (Hope: {r.hopeDie}, Fear: {r.fearDie})
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
