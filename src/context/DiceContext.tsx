/** biome-ignore-all lint/suspicious/noExplicitAny: No types for the dice roller */
"use client";

// @ts-expect-error
import DiceBox from "@3d-dice/dice-box";
// @ts-expect-error
import DiceParser from "@3d-dice/dice-parser-interface";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { AdvancedNotation, DiceRoll, RawDiceRollResult } from "@/lib/dice";
import { generateRandomDiceRoll } from "@/lib/dice";

interface DiceRollOptions {
  theme: string;
}

interface DiceContextType {
  rollDice: (
    notation: AdvancedNotation,
    options?: DiceRollOptions,
  ) => Promise<RawDiceRollResult>;
  isReady: boolean;
  isRolling: boolean;
  setUse3dDice: (use3d: boolean) => void;
}

interface DiceProviderProps {
  children: React.ReactNode;
}

export const DiceContext = createContext<DiceContextType>({
  rollDice: async () => ({ rolls: [], modifier: 0, total: 0 }),
  isReady: false,
  isRolling: false,
  setUse3dDice: () => {},
});

export const useDiceRoller = () => useContext(DiceContext);

export const DiceProvider = ({ children }: DiceProviderProps) => {
  const diceBoxRef = useRef<any>(null);
  const drpRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [diceRolling, setDiceRolling] = useState(false);
  const [use3dDice, setUse3dDice] = useState(true);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Create a NEW instance only when this component mounts
    const box = new DiceBox(
      "#dice-box", // target DOM element to inject the canvas for rendering
      {
        id: "dice-canvas", // canvas element id
        assetPath: "/assets/",
        startingHeight: 8,
        throwForce: 6,
        spinForce: 5,
        lightIntensity: 0.9,
      },
    );

    diceBoxRef.current = box;
    drpRef.current = new DiceParser();

    box.init().then(async () => {
      setIsReady(true);
      await box.loadTheme("rust");
    });

    return () => {
      console.log("Cleaning up DiceBox...");
      // Tell the dice box to stop and clear its canvas/workers
      if (diceBoxRef.current) {
        // Some versions use .clear(), but the best way to 'kill' a
        // stale instance is to ensure it doesn't try to re-init
        diceBoxRef.current = null;
      }
      setIsReady(false);
    };
  }, []);

  const setClearTimeout = () => {
    // Clear any existing timeout
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }

    // Set a new timeout to clear the dice after 5 seconds
    clearTimeoutRef.current = setTimeout(() => {
      if (diceBoxRef.current) {
        diceBoxRef.current.clear();
      }
      clearTimeoutRef.current = null;
    }, 5000);
  };

  const rollDice = async (
    notation: AdvancedNotation,
  ): Promise<RawDiceRollResult> => {
    try {
      if (diceRolling) {
        throw new Error("Dice are already rolling");
      }

      // Clear any pending timeout from the previous roll
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }

      setDiceRolling(true);

      let results: RawDiceRollResult;

      if (use3dDice) {
        // Use 3D dice if ready and enabled
        if (!isReady || !diceBoxRef.current) {
          throw new Error("Dice roller is not ready");
        }

        diceBoxRef.current.clear();

        const rolls: DiceRoll[] = await diceBoxRef.current
          .show()
          .roll(notation.dice);

        console.log("Raw dice results:", rolls);

        const total =
          rolls.map((r) => r.value).reduce((a, b) => a + b, 0) +
          (notation.modifier || 0);

        results = {
          rolls,
          modifier: notation.modifier || 0,
          total,
        } satisfies RawDiceRollResult;
      } else {
        // Generate random results without 3D dice
        results = generateRandomDiceRoll(notation);
      }

      // Set the clear timeout only for 3D dice
      if (use3dDice) {
        setClearTimeout();
      }

      return results;
    } finally {
      setDiceRolling(false);
    }
  };

  return (
    <DiceContext.Provider
      value={{ rollDice, isReady, isRolling: diceRolling, setUse3dDice }}
    >
      {children}
    </DiceContext.Provider>
  );
};
