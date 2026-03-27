"use client";

// @ts-expect-error
import DiceBox from "@3d-dice/dice-box";
// @ts-expect-error
import DiceParser from "@3d-dice/dice-parser-interface";
// @ts-expect-error
import DisplayResults from "@3d-dice/dice-ui/src/displayResults";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface DiceContextType {
  rollDice: (notation: string) => void;
  isReady: boolean;
}

export const DiceContext = createContext<DiceContextType>({
  rollDice: () => {},
  isReady: false,
});

export const useDiceRoller = () => useContext(DiceContext);

export const DiceProvider = ({ children }: { children: React.ReactNode }) => {
  // Use a ref to hold the actual instance
  const diceBoxRef = useRef<any>(null);
  const drpRef = useRef<any>(null);
  const diceResultsRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

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
    diceResultsRef.current = new DisplayResults("#dice-box");

    // 2. Init THIS specific instance
    box.init().then(() => {
      setIsReady(true);
    });

    // 3. Set up your callbacks on this instance
    box.onRollComplete = (results: unknown) => {
      const rerolls = drpRef.current.handleRerolls(results);
      if (rerolls.length) {
        rerolls.forEach((roll: { groupId: string }) => {
          box.add(roll, roll.groupId);
        });
        return;
      }

      const finalResults = drpRef.current.parseFinalResults(results);
      diceResultsRef.current.showResults(finalResults);

      // TIP: For Daggerheart, you can analyze finalResults here
      // to determine Hope vs Fear!
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

  const rollDice = (notation: string) => {
    // Use diceBoxRef.current instead of the global Dice import
    if (isReady && diceBoxRef.current) {
      diceBoxRef.current.show().roll(drpRef.current.parseNotation(notation));
    }
  };

  return (
    <DiceContext.Provider value={{ rollDice, isReady }}>
      {children}
    </DiceContext.Provider>
  );
};
