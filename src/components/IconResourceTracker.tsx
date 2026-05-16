import { Heart, Minus, Plus, Shield, Star, Zap } from "lucide-react";
import type { Resource } from "@/db/schema";
import type { Character } from "@/schema";
import { Button } from "./ui/button";

interface IconResourceTrackerProps {
  label: string;
  field: Resource;
  name: keyof Character;
  onUpdate: (updates: Partial<Character>) => void;
  iconType: "heart" | "star" | "zap" | "shield";
  fillColor: string;
}

export const IconResourceTracker = ({
  label,
  field: { current, max },
  name,
  onUpdate,
  iconType,
  fillColor,
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
    const iconProps = {
      className: `h-8 w-8 ${filled ? fillColor : ""}`,
      strokeWidth: 2,
    };

    switch (iconType) {
      case "heart":
        return (
          <Heart
            {...iconProps}
            fill={filled ? fillColor : "none"}
            stroke={filled ? fillColor : "currentColor"}
          />
        );
      case "star":
        return (
          <Star
            {...iconProps}
            fill={filled ? fillColor : "none"}
            stroke={filled ? fillColor : "currentColor"}
          />
        );
      case "zap":
        return (
          <Zap
            {...iconProps}
            fill={filled ? fillColor : "none"}
            stroke={filled ? fillColor : "currentColor"}
          />
        );
      case "shield":
        return (
          <Shield
            {...iconProps}
            fill={filled ? fillColor : "none"}
            stroke={filled ? fillColor : "currentColor"}
          />
        );
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

        <div className="flex-1 grid grid-cols-6 gap-1 py-2 px-2 justify-items-center">
          {Array.from({ length: max }).map((_, idx) => {
            const iconKey = `icon-${iconType}-${name}-${idx}`;
            return (
              <Button
                key={iconKey}
                variant="ghost"
                size="icon-lg"
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-8 h-8"
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
