"use client";

import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, X } from "lucide-react";
import type { Channel } from "pusher-js";
import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { toast } from "sonner";
import {
  applyCharacterDelta,
  getCharacters,
  updateCampaignFear,
} from "@/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDiceRoller } from "@/context/DiceContext";
import { authClient } from "@/lib/auth-client";
import { dayjs } from "@/lib/dayjs";
import { createPusherClient } from "@/lib/pusher";
import {
  type AnyDiceRoll,
  type Character,
  DICE_VALUES,
  type DiceValue,
  type DualityDiceRoll,
  isDualityDiceRoll,
  isMultiDiceRollResult,
  isSimpleDieRollResult,
  type PoolDiceRoll,
} from "@/schema";
import { Badge } from "./ui/badge";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type DicePool = Record<DiceValue, number>;

const formatDiceRoll = ({ results, user, character }: PoolDiceRoll): string => {
  if (isMultiDiceRollResult(results)) {
    const segments = results.dice.map((item, index) => {
      let segmentStr = "";

      if ("rolls" in item && item.rolls) {
        // Group dice results: (8 + 2)
        const rollValues = item.rolls.map((r) => r.value).join(" + ");
        segmentStr = `(${rollValues})`;
      } else {
        // Flat modifier: 1
        segmentStr = item.value.toString();
      }

      // Append the operator if it exists for this index
      const operator = results.ops[index] ? ` ${results.ops[index]} ` : "";
      return `${segmentStr}${operator}`;
    });

    return `🎲 ${character ? `${character.name} (${user})` : user} rolled:\n${segments.join("")} = ${results.value}`;
  } else {
    // Single die type result: 2d6 → [3, 5] = 8
    const rolls = results.rolls.map((r) => r.value).join(", ");
    return `🎲 ${character ? `${character.name} (${user})` : user} rolled:\nd${results.die.value} → [${rolls}] = ${results.value}`;
  }
};

function formatDualityDieRoll({
  hopeDie,
  fearDie,
  character,
  user,
  rollType,
}: DualityDiceRoll): string {
  const total = hopeDie + fearDie;
  const emoji = rollType === "hope" ? "🙏" : rollType === "fear" ? "💀" : "🏆";
  let message = character
    ? `${character.name} (${user}) rolled a ${total} `
    : `${user} rolled a ${total} `;

  if (rollType === "hope") message += "with Hope";
  else if (rollType === "fear") message += "with Fear";
  else message += "- Critical success";

  return `${emoji} ${message}`;
}

export function DiceRoller({ campaignId }: { campaignId: string }) {
  const { rollDice: roll3dDice } = useDiceRoller();
  const { data: session } = authClient.useSession();
  const [rolls, setRolls] = useState<AnyDiceRoll[]>([]);
  const [pool, setPool] = useState<DicePool>(
    Object.fromEntries(DICE_VALUES.map((v) => [v, 0])) as DicePool,
  );
  const [modifier, setModifier] = useState(0);

  const [autoApplyRolls, setAutoApplyRolls] = useState<boolean>(true);
  const [rollAsCharacter, setRollAsCharacter] = useState<Character | null>(
    null,
  );
  const [showDiceRollPopups, setShowDiceRollPopups] = useState<boolean | null>(
    null,
  );
  const [sendRollToEveryone, setSendRollToEveryone] = useState<boolean>(true);
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

  const rollDualityDice = async () => {
    const results = await roll3dDice("2d12");
    console.log("3dDice results:", results);
    if (!isSimpleDieRollResult(results)) {
      toast.error("Unexpected dice roll result format");
      return;
    }
    const fearDie = results.rolls[1].value;
    const hopeDie = results.rolls[0].value;

    const newRoll: DualityDiceRoll = {
      hopeDie,
      fearDie,
      character: rollAsCharacter,
      user: session?.user?.name || "Unknown",
      rollType:
        hopeDie === fearDie ? "critical" : hopeDie > fearDie ? "hope" : "fear",
      timestamp: new Date().toISOString(),
    };
    if (rollChannel.current && sendRollToEveryone) {
      rollChannel.current.trigger("client-newRoll", newRoll);
    }

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
      toast(formatDualityDieRoll({ ...newRoll, user: "You" }), {
        description,
        richColors: false,
        classNames: {
          description: "!text-popover-foreground/90",
        },
      });
    }
    setRolls((prev) => [newRoll, ...prev]);
  };

  const addDie = (value: DiceValue) => {
    setPool((prev) => ({ ...prev, [value]: prev[value] + 1 }));
  };

  const removeDie = (value: DiceValue) => {
    setPool((prev) => ({
      ...prev,
      [value]: Math.max(0, (prev[value] ?? 0) - 1),
    }));
  };

  const rollDice = async () => {
    const notation = Object.entries(pool)
      .filter(([_, count]) => count > 0)
      .map(([sides, count]) => `${count}d${sides}`)
      .join("+");

    console.log("Rolling dice with pool:", notation, "and modifier:", modifier);

    const results = await roll3dDice(
      modifier >= 0
        ? `${notation}+${modifier}`
        : modifier <= 0
          ? `${notation}-${Math.abs(modifier)}`
          : notation,
    );

    console.log("3dDice results:", results);

    const poolResult: PoolDiceRoll = {
      user: session?.user?.name || "Unknown",
      character: rollAsCharacter,
      results: results,
      total: results.value,
      rollType: "pool",
      timestamp: new Date().toISOString(),
    };
    console.log("Generated pool roll:", poolResult);
    if (rollChannel.current && sendRollToEveryone) {
      console.log("Triggering rollChannel with poolResult");
      rollChannel.current.trigger("client-newRoll", poolResult);
    }
    if (showDiceRollPopups) {
      toast(`You rolled a total of ${poolResult.total}`, {
        description: formatDiceRoll(poolResult),
        richColors: true,
      });
    }
    setRolls((prev) => [poolResult, ...prev]);
    setPool(Object.fromEntries(DICE_VALUES.map((v) => [v, 0])) as DicePool);
  };

  const hasDice = Object.values(pool).some((v) => v > 0);

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

    rollChannel.current.bind("client-newRoll", (roll: AnyDiceRoll) => {
      if (showDiceRollPopups) {
        if (isDualityDiceRoll(roll)) {
          toast(formatDualityDieRoll(roll), {
            richColors: false,
          });
        } else {
          toast(`${roll.user} rolled ${roll.total}`, {
            richColors: true,
            description: formatDiceRoll(roll),
          });
        }
      }
      setRolls((old) => [roll, ...old]);
    });

    return () => {
      rollChannel.current?.unbind_all();
      pusher.unsubscribe(`private-campaign-${campaignId}-rolls`);
      pusher.disconnect();
    };
  }, [campaignId, showDiceRollPopups]);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dice Roller</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-2">
            <Switch
              checked={sendRollToEveryone}
              onCheckedChange={setSendRollToEveryone}
              id="apply-rolls"
            />
            <Label htmlFor="apply-rolls">
              {sendRollToEveryone
                ? "Send rolls to everyone"
                : "Keep rolls private"}
            </Label>
          </div>
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
            <Button onClick={rollDualityDice} className="flex-1">
              Roll Duality!
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

          <div className="flex flex-wrap justify-center gap-3">
            {DICE_VALUES.map((value) => (
              <div key={value} className="relative">
                <Button
                  variant={pool[value] > 0 ? "default" : "outline"}
                  onClick={() => addDie(value)}
                  className="relative"
                >
                  d{value}
                  {pool[value] > 0 && (
                    <Badge
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        removeDie(value);
                      }}
                      className="absolute -top-2 -right-2 rounded-full px-2 py-0 text-xs bg-amber-400 hover:bg-destructive text-secondary-foreground transition-colors"
                    >
                      {pool[value]}
                    </Badge>
                  )}
                </Button>
              </div>
            ))}
            <Button
              onClick={() =>
                setPool(
                  Object.fromEntries(
                    DICE_VALUES.map((v) => [v, 0]),
                  ) as DicePool,
                )
              }
              variant="outline"
              className="ml-2"
            >
              Clear Pool
            </Button>
          </div>
          {/* Modifier Controls */}
          <div className="flex items-center justify-between m-2 rounded-lg border border-primary">
            <span className="text-sm uppercase font-semibold ml-2">
              Modifier
            </span>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setModifier((m) => m - 1)}
                className="p-1 rounded "
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className=" font-mono w-6 text-center">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </span>
              <Button
                onClick={() => setModifier((m) => m + 1)}
                className="p-1 rounded"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {hasDice && (
            <div className="flex justify-center pt-4">
              <Button onClick={rollDice}>Roll Dice</Button>
            </div>
          )}

          {/* <DaggerheartPicker /> */}

          {rolls.length > 0 && (
            <Item variant="outline" className="mt-2">
              <ItemContent>
                {isDualityDiceRoll(rolls[0]) ? (
                  <>
                    <ItemTitle>{formatDualityDieRoll(rolls[0])}</ItemTitle>
                    <ItemDescription className="text-sm text-gray-500">
                      (Hope: {rolls[0].hopeDie}, Fear: {rolls[0].fearDie})
                    </ItemDescription>
                  </>
                ) : (
                  <ItemTitle>
                    {formatDiceRoll(rolls[0])} (Total: {rolls[0].total})
                  </ItemTitle>
                )}
              </ItemContent>
            </Item>
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
                    {isDualityDiceRoll(r) ? (
                      <>
                        {formatDualityDieRoll(r)} (Hope: {r.hopeDie}, Fear:{" "}
                        {r.fearDie})
                      </>
                    ) : (
                      formatDiceRoll(r)
                    )}
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
