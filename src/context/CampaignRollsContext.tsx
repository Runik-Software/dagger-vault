"use client";

import type { Channel } from "pusher-js";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  type AnyDiceRoll,
  formatDiceRoll,
  formatDualityDieRoll,
  isDualityDiceRoll,
} from "@/lib/dice";
import { createPusherClient } from "@/lib/pusher";

interface CampaignRollsContextType {
  rolls: AnyDiceRoll[];
  setRolls: (
    rolls: AnyDiceRoll[] | ((prev: AnyDiceRoll[]) => AnyDiceRoll[]),
  ) => void;
}

const CampaignRollsContext = createContext<
  CampaignRollsContextType | undefined
>(undefined);

export function useCampaignRolls() {
  const context = useContext(CampaignRollsContext);
  if (!context) {
    throw new Error(
      "useCampaignRolls must be used within a CampaignRollsProvider",
    );
  }
  return context;
}

interface CampaignRollsProviderProps {
  children: ReactNode;
  campaignId: string;
  showDiceRollPopups?: boolean;
}

export function CampaignRollsProvider({
  children,
  campaignId,
  showDiceRollPopups = true,
}: CampaignRollsProviderProps) {
  const [rolls, setRolls] = useState<AnyDiceRoll[]>([]);
  const rollChannel = useRef<Channel>(null);

  useEffect(() => {
    const pusher = createPusherClient(campaignId);

    rollChannel.current = pusher.subscribe(
      `private-campaign-${campaignId}-rolls`,
    );

    rollChannel.current.bind("client-newRoll", (roll: AnyDiceRoll) => {
      setRolls((prev) => [roll, ...prev]);

      if (showDiceRollPopups) {
        if (isDualityDiceRoll(roll)) {
          toast(formatDualityDieRoll(roll), {
            richColors: false,
          });
        } else {
          toast(`${roll.user} rolled ${roll.total}`, {
            richColors: true,
            description: formatDiceRoll(roll),
          });
        }
      }
    });

    return () => {
      rollChannel.current?.unbind_all();
      pusher.unsubscribe(`private-campaign-${campaignId}-rolls`);
      pusher.disconnect();
    };
  }, [campaignId, showDiceRollPopups]);

  return (
    <CampaignRollsContext.Provider value={{ rolls, setRolls }}>
      {children}
    </CampaignRollsContext.Provider>
  );
}
