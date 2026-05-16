import { MinusCircle, PlusCircle, Skull } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface FearTrackerProps {
  fear: number;
  userOwnsCampaign: boolean;
  updateFear: (modifier: number) => void;
}

export function FearTracker({
  fear,
  userOwnsCampaign,
  updateFear,
}: FearTrackerProps) {
  return (
    <div className="w-full flex items-center border-2 border-accent bg-destructive/10 rounded-2xl px-2">
      {userOwnsCampaign && (
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={fear <= 0}
                className="rounded-full"
                size="icon"
                onClick={() => updateFear(-1)}
              >
                <MinusCircle />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove Fear</TooltipContent>
          </Tooltip>
        </div>
      )}

      <div className="flex-1">
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 justify-items-center">
          {Array.from({ length: 12 }).map((_, i) => {
            const filled = i < fear;
            return (
              <Skull
                // biome-ignore lint/suspicious/noArrayIndexKey: Just an index
                key={`skull-${i}`}
                className={`${filled ? "bg-destructive text-gray-800 rounded-full" : ""}`}
              />
            );
          })}
        </div>
      </div>

      {userOwnsCampaign && (
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={fear >= 12}
                className="rounded-full"
                size="icon"
                onClick={() => updateFear(1)}
              >
                <PlusCircle />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Fear</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
