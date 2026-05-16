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
  const [use3dDice, setUse3dDice] = useState(true);
  const [useIconStatDisplay, setUseIconStatDisplay] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const showDiceKey = `${campaignId}_showDiceRollPopups`;
  const autoApplyKey = `${campaignId}_autoEnableApplyDiceRolls`;
  const use3dDiceKey = `${campaignId}_use3dDice`;
  const useIconStatDisplayKey = `${campaignId}_useIconStatDisplay`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedShowDice = localStorage.getItem(showDiceKey);
    const storedAutoApply = localStorage.getItem(autoApplyKey);
    const stored3dDice = localStorage.getItem(use3dDiceKey);
    const storedUseIconStatDisplay = localStorage.getItem(
      useIconStatDisplayKey,
    );

    if (storedShowDice !== null) {
      setShowDiceRollPopups(storedShowDice === "true");
    }

    if (storedAutoApply !== null) {
      setAutoEnableApplyDiceRolls(storedAutoApply === "true");
    }

    if (stored3dDice !== null) {
      setUse3dDice(stored3dDice === "true");
    }

    if (storedUseIconStatDisplay !== null) {
      setUseIconStatDisplay(storedUseIconStatDisplay === "true");
    }

    setLoaded(true);
  }, [showDiceKey, autoApplyKey, use3dDiceKey, useIconStatDisplayKey]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(showDiceKey, String(showDiceRollPopups));
  }, [showDiceRollPopups, showDiceKey, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(autoApplyKey, String(autoEnableApplyDiceRolls));
  }, [autoEnableApplyDiceRolls, autoApplyKey, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(use3dDiceKey, String(use3dDice));
  }, [use3dDice, use3dDiceKey, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(useIconStatDisplayKey, String(useIconStatDisplay));
  }, [useIconStatDisplay, useIconStatDisplayKey, loaded]);

  if (!loaded) return null;

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Campaign User Settings</CardTitle>
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
        <div className="flex items-center justify-between">
          <Label htmlFor="use3dDice" className="text-sm font-medium">
            Use 3D dice
          </Label>
          <Switch
            id="use3dDice"
            checked={use3dDice}
            onCheckedChange={setUse3dDice}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="useIconStatDisplay" className="text-sm font-medium">
            Use icon display for character stats
          </Label>
          <Switch
            id="useIconStatDisplay"
            checked={useIconStatDisplay}
            onCheckedChange={setUseIconStatDisplay}
          />
        </div>{" "}
      </CardContent>
    </Card>
  );
}
