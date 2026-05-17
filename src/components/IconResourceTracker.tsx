import { Minus, Plus } from "lucide-react";
import type { Resource } from "@/db/schema";
import type { Character } from "@/schema";
import { Diamond } from "./icons/Diamond";
import { Heart } from "./icons/Heart";
import { Lightning } from "./icons/Lightning";
import { Shield } from "./icons/Shield";
import { Button } from "./ui/button";

interface IconResourceTrackerProps {
  label: string;
  field: Resource;
  name: keyof Character;
  onUpdate: (updates: Partial<Character>) => void;
  iconType: "health" | "hope" | "stress" | "armour";
}

export const IconResourceTracker = ({
  label,
  field: { current, max },
  name,
  onUpdate,
  iconType,
}: IconResourceTrackerProps) => {
  const updateResource = (delta: number) => {
    let newValue = current + delta;
    if (max !== undefined) {
      newValue = Math.max(0, Math.min(newValue, max));
    } else {
      newValue = Math.max(0, newValue);
    }
    onUpdate({ [name]: { max, current: newValue } });
  };

  const setResourceValue = (value: number) => {
    const newValue = Math.max(0, Math.min(value, max));
    onUpdate({ [name]: { max, current: newValue } });
  };

  const getIcon = (filled: boolean) => {
    switch (iconType) {
      case "health":
        return <Heart className="h-full w-full" filled={filled} />;
      case "hope":
        return <Diamond className="h-full w-full" filled={filled} />;
      case "stress":
        return <Lightning className="h-full w-full" filled={filled} />;
      case "armour":
        return <Shield className="h-full w-full" filled={filled} />;
      default:
        return null;
    }
  };

  if (max === undefined) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-serif text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-serif text-foreground">
          {current}/{max}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => updateResource(-1)}
          disabled={current === 0}
          className="shrink-0"
        >
          <Minus className="h-5 w-5" />
        </Button>

        <div className="flex-1 grid xl:grid-cols-6 grid-cols-4 gap-1 py-2 px-2">
          {Array.from({ length: max }).map((_, idx) => {
            const iconKey = `icon-${iconType}-${name}-${idx}`;
            return (
              <Button
                key={iconKey}
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 lg:h-10 lg:w-10 col-span-1"
                onClick={() => setResourceValue(idx + 1)}
              >
                {getIcon(idx < current)}
              </Button>
            );
          })}
        </div>

        <Button
          size="icon"
          variant="outline"
          onClick={() => updateResource(1)}
          disabled={current >= max}
          className="shrink-0"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
