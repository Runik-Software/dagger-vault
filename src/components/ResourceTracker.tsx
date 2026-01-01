import { Minus, Plus } from "lucide-react";
import type { Resource } from "@/db/schema";
import type { Character } from "@/schema";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";

export const ResourceTracker = ({
  label,
  field: { current, max },
  name,
  onUpdate,
}: {
  label: string;
  field: Resource;
  name: keyof Character;
  onUpdate: (updates: Partial<Character>) => void;
}) => {
  const updateResource = (delta: number) => {
    let newValue = current + delta;
    if (max !== undefined) {
      newValue = Math.max(0, Math.min(newValue, max));
    } else {
      newValue = Math.max(0, newValue);
    }
    onUpdate({ [name]: { max, current: newValue } });
  };

  const handleDirectEdit = (value: string) => {
    const numValue = parseInt(value, 10) || 0;

    let finalValue = numValue;
    if (max !== undefined) {
      finalValue = Math.max(0, Math.min(numValue, max));
    } else {
      finalValue = Math.max(0, numValue);
    }

    onUpdate({ [name]: finalValue });
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-serif text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-serif text-foreground">
          {current}
          {max !== undefined ? `/${max}` : ""}
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
        <Input
          type="number"
          value={current}
          onChange={(e) => handleDirectEdit(e.target.value)}
          className={`flex-1 text-center text-2xl font-bold font-serif text-primary bg-primary-foreground`}
        />
        <Button
          size="icon"
          variant="outline"
          onClick={() => updateResource(1)}
          disabled={max !== undefined && current >= max}
          className="shrink-0"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      {max !== undefined && (
        <Progress value={(current / max) * 100} className="h-2" />
      )}
    </div>
  );
};
