/** biome-ignore-all lint/suspicious/noExplicitAny: No types for the dice roller */
"use client";

// @ts-expect-error
import DiceBox from "@3d-dice/dice-box";
// @ts-expect-error
import DiceParser from "@3d-dice/dice-parser-interface";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { DiceRollResult } from "@/schema";

interface DiceContextType {
  rollDice: (notation: string) => Promise<DiceRollResult>;
  isReady: boolean;
}

interface DiceProviderProps {
  children: React.ReactNode;
}

export const DiceContext = createContext<DiceContextType>({
  rollDice: async () => ({
    dice: [],
    value: 0,
    type: "expressionroll",
    ops: [],
  }),
  isReady: false,
});

export const useDiceRoller = () => useContext(DiceContext);

export const DiceProvider = ({ children }: DiceProviderProps) => {
  // Use a ref to hold the actual instance
  const diceBoxRef = useRef<any>(null);
  const drpRef = useRef<any>(null);
  // const diceResultsRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const rollPromiseResolverRef = useRef<{
    resolve: (result: DiceRollResult) => void;
    reject: (error: Error) => void;
  } | null>(null);

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
    // diceResultsRef.current = new DisplayResults("#dice-box");

    // 2. Init THIS specific instance
    box.init().then(() => {
      setIsReady(true);
    });

    // 3. Set up your callbacks on this instance
    box.onRollComplete = (results: DiceRollResult) => {
      const rerolls = drpRef.current.handleRerolls(results);
      if (rerolls.length) {
        rerolls.forEach((roll: { groupId: string }) => {
          box.add(roll, roll.groupId);
        });
        return;
      }

      console.log("Final dice results:", results);

      const finalResults = drpRef.current.parseFinalResults(results);

      // Resolve the pending promise if one exists
      if (rollPromiseResolverRef.current) {
        rollPromiseResolverRef.current.resolve(finalResults);
        rollPromiseResolverRef.current = null;
      }

      setTimeout(() => {
        box.clear();
      }, 5000);
    };

    // 4. CLEANUP
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

  const rollDice = (notation: string): Promise<DiceRollResult> => {
    return new Promise((resolve, reject) => {
      if (!isReady || !diceBoxRef.current) {
        reject(new Error("Dice roller is not ready"));
        return;
      }

      // Store the resolver for when the roll completes
      rollPromiseResolverRef.current = { resolve, reject };

      try {
        diceBoxRef.current.show().roll(drpRef.current.parseNotation(notation));
      } catch (error) {
        reject(error);
        rollPromiseResolverRef.current = null;
      }
    });
  };

  return (
    <DiceContext.Provider value={{ rollDice, isReady }}>
      {children}
    </DiceContext.Provider>
  );
};
