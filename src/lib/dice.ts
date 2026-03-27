import type { Character } from "@/schema";

export type DualityDiceRoll = {
    user: string;
    character?: Character | null;
    hopeDie: number;
    fearDie: number;
    modifier: number;
    rollType: "hope" | "fear" | "critical";
    timestamp: string;
};

export const DICE_VALUES = [4, 6, 8, 10, 12, 20] as const;
export type DiceValue = (typeof DICE_VALUES)[number];

export type PoolDiceRoll = {
    user: string;
    character?: Character | null;
    results: RawDiceRollResult;
    total: number;
    rollType: "pool";
    timestamp: string;
};

export type AnyDiceRoll = DualityDiceRoll | PoolDiceRoll;

export function isDualityDiceRoll(roll: AnyDiceRoll): roll is DualityDiceRoll {
    return (roll as DualityDiceRoll).hopeDie !== undefined;
}

export function isPoolDiceRoll(roll: AnyDiceRoll): roll is PoolDiceRoll {
    return (roll as PoolDiceRoll).rollType === "pool";
}

export type DiceRoll = {
    dieType: string;
    groupId: number;
    rollId: number;
    sides: number;
    value: number;
};
export type RawDiceRollResult = {
    rolls: DiceRoll[];
    modifier: number;
    total: number;
};

export type AdvancedNotation = {
    dice: {
        qty: number;
        sides: number;
        modifier?: number;
        theme?: string;
        themeColor?: string;
    }[];
    modifier?: number;
};

type DicePool = Record<DiceValue, number>;

const diceColorMap: Record<DiceValue, string> = {
    4: "#e53e3e",
    6: "#dd6b20",
    8: "#d69e2e",
    10: "#38a169",
    12: "#319795",
    20: "#3182ce",
};

export const parseNotation = (pool: DicePool, modifier: number): AdvancedNotation => {
    return {
        dice: Object.entries(pool)
            .filter(([_, count]) => count > 0)
            .map(([sides, count]) => {
                const sidesNum = parseInt(sides, 10) as DiceValue;
                return {
                    qty: count,
                    sides: sidesNum,
                    theme: "default",
                    themeColor: diceColorMap[sidesNum],
                };
            }),
        modifier,
    } satisfies AdvancedNotation;
};

export const formatDiceRoll = ({ results, user, character }: PoolDiceRoll): string => {
    return `🎲 ${character ? `${character.name} (${user})` : user} rolled:\n${results.rolls.map((r) => r.value).join(" + ")} + ${results.modifier} = ${results.total}`;
};

export const formatDualityDieRoll = ({
    hopeDie,
    fearDie,
    modifier,
    character,
    user,
    rollType,
}: DualityDiceRoll): string => {
    const total = hopeDie + fearDie + modifier;
    const emoji = rollType === "hope" ? "🙏" : rollType === "fear" ? "💀" : "🏆";
    let message = character
        ? `${character.name} (${user}) rolled a ${total} `
        : `${user} rolled a ${total} `;

    if (rollType === "hope") message += "with Hope";
    else if (rollType === "fear") message += "with Fear";
    else message += "- Critical success";

    return `${emoji} ${message}`;
}

export const listDiceRolls = (rolls: DiceRoll[]): string => {
    const diceCount: Record<string, number> = {};

    // Count dice by type
    for (const roll of rolls) {
        diceCount[roll.dieType] = (diceCount[roll.dieType] || 0) + 1;
    }

    // Format as "3d6 + 1d4"
    return Object.entries(diceCount)
        .map(([dieType, count]) => `${count}${dieType}`)
        .join(" + ");
}
