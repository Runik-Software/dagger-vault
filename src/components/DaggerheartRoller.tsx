"use client";

import { Dices, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useDiceRoller } from "@/context/DiceContext";
import { Button } from "./ui/button";

export function DaggerheartPicker() {
  const { rollDice, isReady } = useDiceRoller();
  const [modifier, setModifier] = useState(0);

  // 1. The core Daggerheart Action
  const rollAction = () => {
    // We roll 2d12 + modifier
    const notation = `2d12${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`;
    rollDice(notation);
  };

  // 2. Generic dice for damage/other rolls
  const quickRoll = (sides: number) => {
    rollDice(
      `1d${sides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`,
    );
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl space-y-4 w-full max-w-xs">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Dices className="w-5 h-5 text-indigo-400" />
        Dice Tray
      </h3>

      {/* Duality Dice Button */}
      <Button
        onClick={rollAction}
        disabled={!isReady}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all transform active:scale-95 disabled:opacity-50"
      >
        Roll Action (2d12)
      </Button>

      {/* Generic Dice Row */}
      <div className="grid grid-cols-4 gap-2">
        {[4, 6, 8, 10, 20].map((s) => (
          <Button
            key={s}
            onClick={() => quickRoll(s)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 text-sm"
          >
            d{s}
          </Button>
        ))}
      </div>

      {/* Modifier Controls */}
      <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
        <span className="text-xs text-slate-400 uppercase font-semibold ml-2">
          Modifier
        </span>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setModifier((m) => m - 1)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-white font-mono w-6 text-center">
            {modifier >= 0 ? `+${modifier}` : modifier}
          </span>
          <Button
            onClick={() => setModifier((m) => m + 1)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
