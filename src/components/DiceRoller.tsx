"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import type { Channel } from "pusher-js";
import { useCallback, useEffect, useRef, useState } from "react";
import Select from "react-select";
import { toast } from "sonner";
import {
  applyCharacterDelta,
  getCharacters,
  updateCampaignFear,
} from "@/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { dayjs } from "@/lib/dayjs";
import { createPusherClient } from "@/lib/pusher";
import type { Character, DiceRoll } from "@/schema";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function DiceRoller({ campaignId }: { campaignId: string }) {
  const { data: session } = authClient.useSession();
  const [rolls, setRolls] = useState<DiceRoll[]>([]);
  const [autoApplyRolls, setAutoApplyRolls] = useState<boolean>(true);
  const [rollAsCharacter, setRollAsCharacter] = useState<Character | null>(
    null,
  );
  const [showDiceRollPopups, setShowDiceRollPopups] = useState<boolean | null>(
    null,
  );
  const rollChannel = useRef<Channel>(null);

  const showDiceKey = `${campaignId}_showDiceRollPopups`;
  const autoApplyKey = `${campaignId}_autoEnableApplyDiceRolls`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedShowDice = localStorage.getItem(showDiceKey);
    const storedAutoApply = localStorage.getItem(autoApplyKey);

    setShowDiceRollPopups(storedShowDice ? storedShowDice === "true" : true);
    setAutoApplyRolls(storedAutoApply ? storedAutoApply === "true" : true);
  }, [autoApplyKey, showDiceKey]);

  const { data: characters } = useQuery({
    queryKey: ["characters"],
    queryFn: () => {
      return getCharacters(campaignId);
    },
  });

  const rollDice = async () => {
    const hopeDie = Math.floor(Math.random() * 12) + 1;
    const fearDie = Math.floor(Math.random() * 12) + 1;

    const newRoll: DiceRoll = {
      hopeDie,
      fearDie,
      character: rollAsCharacter,
      user: session?.user?.name || "Unknown",
      rollType:
        hopeDie === fearDie ? "critical" : hopeDie > fearDie ? "hope" : "fear",
      timestamp: new Date().toISOString(),
    };
    rollChannel.current?.trigger("client-newRoll", newRoll);

    if (newRoll.rollType === "fear") {
      await updateCampaignFear(campaignId, 1, true);
    }
    let description: string | undefined;
    if (rollAsCharacter && autoApplyRolls) {
      description = "Roll applied automatically";
      if (newRoll.rollType === "hope") {
        await applyCharacterDelta(rollAsCharacter.id, { hope: 1 });
      }
      if (newRoll.rollType === "critical") {
        await applyCharacterDelta(rollAsCharacter.id, {
          hope: 1,
          stress: -1,
        });
      }
    } else {
      if (newRoll.rollType === "hope") {
        description = "Increase Hope by 1 using the character sheet controls";
      }
      if (newRoll.rollType === "fear") {
        description = "The GM gains 1 Fear for the campaign";
      }
      if (newRoll.rollType === "critical") {
        description =
          "Increase Hope by 1 and decrease Stress by 1 using the character sheet controls";
      }
    }

    if (showDiceRollPopups) {
      toast(getMessageForDieRoll({ ...newRoll, user: "You" }), {
        description,
        richColors: false,
        classNames: {
          description: "!text-popover-foreground/90",
        },
      });
    }
    setRolls((prev) => [newRoll, ...prev]);
  };

  const getMessageForDieRoll = useCallback(
    ({ hopeDie, fearDie, character, user, rollType }: DiceRoll) => {
      const total = hopeDie + fearDie;
      let message = character
        ? `${character.name} (${user}) rolled a ${total} `
        : `${user} rolled a ${total} `;

      if (rollType === "hope") message += "with Hope 🙏";
      else if (rollType === "fear") message += "with Fear 💀";
      else message += "- Critical success 🏆";

      return message;
    },
    [],
  );

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
      if (showDiceRollPopups) {
        toast(getMessageForDieRoll(roll), {
          richColors: false,
        });
      }
      setRolls((old) => [roll, ...old]);
    });

    return () => {
      rollChannel.current?.unbind_all();
      pusher.unsubscribe(`private-campaign-${campaignId}-rolls`);
      pusher.disconnect();
    };
  }, [campaignId, getMessageForDieRoll, showDiceRollPopups]);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <Card className="w-full max-w-2xl text-center">
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
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={rollDice} className="flex-1">
              Roll!
            </Button>
            {rollAsCharacter && (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoApplyRolls}
                  onCheckedChange={setAutoApplyRolls}
                  id="apply-rolls"
                />
                <Label htmlFor="apply-rolls">Auto apply rolls</Label>
              </div>
            )}
          </div>
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

      <Card className="w-full max-w-2xl">
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
          <div className="space-y-2">
            {rolls.slice(1).map((r, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Not that important here
              <Item key={i} variant="outline">
                <ItemContent>
                  <ItemTitle>
                    {getMessageForDieRoll(r)} (Hope: {r.hopeDie}, Fear:{" "}
                    {r.fearDie})
                  </ItemTitle>
                  <ItemDescription>
                    {dayjs(r.timestamp).fromNow()}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
