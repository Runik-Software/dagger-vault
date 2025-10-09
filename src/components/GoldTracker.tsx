import type { Gold } from "@/schema";
import { Input } from "./ui/input";

export const GoldTracker = ({
  gold: { handfuls, bags, chests },
  onUpdate,
}: {
  gold: Gold;
  onUpdate: (updates: Gold) => void;
}) => {
  const editGold = (field: keyof Gold, valueStr: string) => {
    const value = parseInt(valueStr, 10) || 0;
    const finalValue = Math.max(0, value);
    onUpdate({ handfuls, bags, chests, [field]: finalValue });
  };
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-serif text-muted-foreground">Gold</span>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground text-center font-serif">
            Handfuls
          </label>
          <Input
            type="number"
            value={handfuls}
            onChange={(e) => editGold("handfuls", e.target.value)}
            className="text-center font-serif font-semibold text-primary bg-primary-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground text-center font-serif">
            Bags
          </label>
          <Input
            type="number"
            value={bags}
            onChange={(e) => editGold("bags", e.target.value)}
            className="text-center font-serif font-semibold text-primary bg-primary-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground text-center font-serif">
            Chests
          </label>
          <Input
            type="number"
            value={chests}
            onChange={(e) => editGold("chests", e.target.value)}
            className="text-center font-serif font-semibold text-primary bg-primary-foreground"
          />
        </div>
      </div>
    </div>
  );
};
