"use client";

import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import { toast } from "sonner";
import {
  applyCharacterDelta,
  getCampaign,
  getCharacters,
  updateCampaignFear,
} from "@/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCampaignRolls } from "@/context/CampaignRollsContext";
import { useDiceRoller } from "@/context/DiceContext";
import { authClient } from "@/lib/auth-client";
import { dayjs } from "@/lib/dayjs";
import {
  DICE_VALUES,
  type DiceValue,
  type DualityDiceRoll,
  formatDiceRoll,
  formatDualityDieRoll,
  generateRandomDualityRoll,
  isDualityDiceRoll,
  listDiceRolls,
  type PoolDiceRoll,
  parseNotation,
  type RawDiceRollResult,
} from "@/lib/dice";
import { createPusherClient } from "@/lib/pusher";
import type { Character } from "@/schema";
import { Badge } from "./ui/badge";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type DicePool = Record<DiceValue, number>;

export function DiceRoller({ campaignId }: { campaignId: string }) {
  const { data: campaign } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => {
      return getCampaign(campaignId);
    },
  });

  const fearTrackerEnabled = useMemo(
    () => campaign?.settings?.fearEnabled,
    [campaign],
  );
  const {
    rollDice: roll3dDice,
    isReady: is3dDiceReady,
    isRolling,
    setUse3dDice,
  } = useDiceRoller();
  const { rolls, setRolls } = useCampaignRolls();
  const { data: session } = authClient.useSession();
  /** biome-ignore lint/suspicious/noExplicitAny: Pusher channel type */
  const rollChannel = useRef<any>(null);
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
  const [use3dDiceLocal, setUse3dDiceLocal] = useState<boolean>(true);

  const showDiceKey = `${campaignId}_showDiceRollPopups`;
  const autoApplyKey = `${campaignId}_autoEnableApplyDiceRolls`;
  const use3dDiceKey = `${campaignId}_use3dDice`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedShowDice = localStorage.getItem(showDiceKey);
    const storedAutoApply = localStorage.getItem(autoApplyKey);
    const stored3dDice = localStorage.getItem(use3dDiceKey);

    setShowDiceRollPopups(storedShowDice ? storedShowDice === "true" : true);
    setAutoApplyRolls(storedAutoApply ? storedAutoApply === "true" : true);
    setUse3dDiceLocal(stored3dDice ? stored3dDice === "true" : true);
  }, [autoApplyKey, showDiceKey, use3dDiceKey]);

  useEffect(() => {
    setUse3dDice(use3dDiceLocal);
  }, [use3dDiceLocal, setUse3dDice]);

  const { data: characters } = useQuery({
    queryKey: ["characters"],
    queryFn: () => {
      return getCharacters(campaignId);
    },
  });

  const rollDualityDice = async ({ isReaction }: { isReaction: boolean }) => {
    let hopeDie: number;
    let fearDie: number;

    if (use3dDiceLocal) {
      const results = await roll3dDice({
        dice: [
          { qty: 1, sides: 12, theme: "default", themeColor: "#0b6e00" },
          { qty: 1, sides: 12, theme: "rust", themeColor: "#6e0005" },
        ],
        modifier,
      });
      hopeDie = results.rolls[0].value;
      fearDie = results.rolls[1].value;
    } else {
      const rolls = generateRandomDualityRoll();
      hopeDie = rolls.hopeDie;
      fearDie = rolls.fearDie;
    }

    const newRoll: DualityDiceRoll = {
      hopeDie,
      fearDie,
      character: rollAsCharacter,
      user: session?.user?.name || "Unknown",
      modifier,
      rollType: isReaction
        ? "reaction"
        : hopeDie === fearDie
          ? "critical"
          : hopeDie > fearDie
            ? "hope"
            : "fear",
      timestamp: new Date().toISOString(),
    };
    if (rollChannel.current && sendRollToEveryone) {
      rollChannel.current.trigger("client-newRoll", newRoll);
    }

    let description: string | undefined;
    if (newRoll.rollType === "reaction") {
      description = "This is a Reaction roll, which has no automatic effects.";
    } else {
      if (newRoll.rollType === "fear" && fearTrackerEnabled) {
        await updateCampaignFear(campaignId, 1, true);
      }
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

    if (newRoll.rollType === "critical") {
      confetti({
        particleCount: 250,
        spread: 300,
        origin: { y: 0.6 },
      });
    }
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
    let results: RawDiceRollResult;
    const notation = parseNotation(pool, modifier);
    console.log("Rolling dice with pool:", notation, "and modifier:", modifier);
    try {
      results = await roll3dDice(notation);
    } catch (error) {
      toast.error(
        `Error rolling dice: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return;
    }

    console.log("3dDice results:", results);

    const total =
      results.rolls.map((r) => r.value).reduce((a, b) => a + b, 0) + modifier;

    const poolResult: PoolDiceRoll = {
      user: session?.user?.name || "Unknown",
      character: rollAsCharacter,
      results,
      total,
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

    return () => {
      rollChannel.current?.unbind_all();
      pusher.unsubscribe(`private-campaign-${campaignId}-rolls`);
      pusher.disconnect();
    };
  }, [campaignId]);

  return (
    <div className=" w-full flex flex-col items-center gap-4 p-6">
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
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-4">
            <div className="md:flex-1">
              <Select
                placeholder="Roll as character"
                isClearable
                onChange={(c) => setRollAsCharacter(c)}
                getOptionLabel={(c) => c.name}
                getOptionValue={(c) => c.id}
                options={characters ?? []}
              />
            </div>
            {rollAsCharacter && (
              <div className="flex items-center space-x-2 md:shrink-0">
                <Switch
                  checked={autoApplyRolls}
                  onCheckedChange={setAutoApplyRolls}
                  id="apply-rolls"
                />
                <Label htmlFor="apply-rolls">Auto apply rolls</Label>
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Button
              onClick={() => rollDualityDice({ isReaction: false })}
              className="md:flex-1"
              disabled={!is3dDiceReady || isRolling}
            >
              Roll Duality!
            </Button>

            <Button
              onClick={() => rollDualityDice({ isReaction: true })}
              className="md:flex-1"
              disabled={!is3dDiceReady || isRolling}
            >
              Roll Reaction!
            </Button>
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
          <div className="flex flex-col items-center gap-2 m-2 rounded-lg border border-primary p-2">
            <span className="text-sm uppercase font-semibold">Modifier</span>
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
              <Button
                className="flex-1"
                onClick={rollDice}
                disabled={!is3dDiceReady || isRolling}
              >
                Roll Dice
              </Button>
            </div>
          )}

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
                  <>
                    <ItemTitle>{formatDiceRoll(rolls[0])}</ItemTitle>
                    <ItemDescription className="text-sm text-gray-500 text-start">
                      {listDiceRolls(rolls[0].results.rolls)}
                    </ItemDescription>
                  </>
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
                    {isDualityDiceRoll(r)
                      ? "Duality Roll"
                      : listDiceRolls(r.results.rolls)}{" "}
                    - {dayjs(r.timestamp).fromNow()}
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
