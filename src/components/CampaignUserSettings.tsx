"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface DiceSettingsProps {
  campaignId: string;
}

export default function CampaignUserSettings({
  campaignId,
}: DiceSettingsProps) {
  const [showDiceRollPopups, setShowDiceRollPopups] = useState(true);
  const [autoEnableApplyDiceRolls, setAutoEnableApplyDiceRolls] =
    useState(true);
  const [loaded, setLoaded] = useState(false);

  const showDiceKey = `${campaignId}_showDiceRollPopups`;
  const autoApplyKey = `${campaignId}_autoEnableApplyDiceRolls`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedShowDice = localStorage.getItem(showDiceKey);
    const storedAutoApply = localStorage.getItem(autoApplyKey);

    if (storedShowDice !== null) {
      setShowDiceRollPopups(storedShowDice === "true");
    }

    if (storedAutoApply !== null) {
      setAutoEnableApplyDiceRolls(storedAutoApply === "true");
    }

    setLoaded(true);
  }, [showDiceKey, autoApplyKey]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(showDiceKey, String(showDiceRollPopups));
  }, [showDiceRollPopups, showDiceKey, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(autoApplyKey, String(autoEnableApplyDiceRolls));
  }, [autoEnableApplyDiceRolls, autoApplyKey, loaded]);

  if (!loaded) return null;

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Campaign Settings</CardTitle>
        <CardDescription>
          Reload to apply settings. These are stored locally and will not sync
          between devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="showDiceRollPopups" className="text-sm font-medium">
            Show dice roll popups
          </Label>
          <Switch
            id="showDiceRollPopups"
            checked={showDiceRollPopups}
            onCheckedChange={setShowDiceRollPopups}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label
            htmlFor="autoEnableApplyDiceRolls"
            className="text-sm font-medium"
          >
            Auto-enable “Apply dice rolls”
          </Label>
          <Switch
            id="autoEnableApplyDiceRolls"
            checked={autoEnableApplyDiceRolls}
            onCheckedChange={setAutoEnableApplyDiceRolls}
          />
        </div>
      </CardContent>
    </Card>
  );
}
