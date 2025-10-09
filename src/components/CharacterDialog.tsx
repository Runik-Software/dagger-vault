import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Character } from "@/schema";

interface CharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character?: Character | null;
  onSave: (character: Partial<Character>) => void;
}

const emptyCharacter: Omit<Character, "id"> = {
  name: "",
  notes: "",
  hitpoints: { current: 10, max: 10 },
  hope: { current: 2, max: 6 },
  stress: { current: 2, max: 6 },
  armourSlots: { current: 2, max: 6 },
  gold: { handfuls: 0, bags: 0, chests: 0 },
  portraitUrl: "",
};

export default function CharacterDialog({
  open,
  onOpenChange,
  character,
  onSave,
}: CharacterDialogProps) {
  const [formData, setFormData] =
    useState<Omit<Character, "id">>(emptyCharacter);

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        notes: character.notes || "",
        hitpoints: character.hitpoints,
        hope: character.hope,
        stress: character.stress,
        armourSlots: character.armourSlots,
        gold: character.gold,
        portraitUrl: character.portraitUrl || "",
      });
    } else {
      setFormData(emptyCharacter);
    }
  }, [character]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {character ? "Edit Character" : "New Character"}
          </DialogTitle>
          <DialogDescription className="mt-2 text-muted-foreground">
            {character
              ? `Update details for ${character.name}.`
              : "Create a new character."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-serif">
              Character Name
            </Label>
            <Input
              id="name"
              data-testid="input-character-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Enter character name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="font-serif">
              Notes
            </Label>
            <Textarea
              id="notes"
              data-testid="input-character-notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Character backstory, important details..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portraitUrl" className="font-serif">
              Portrait URL (optional)
            </Label>
            <Input
              id="portraitUrl"
              data-testid="input-portrait-url"
              value={formData.portraitUrl}
              onChange={(e) =>
                setFormData({ ...formData, portraitUrl: e.target.value })
              }
              placeholder="https://example.com/portrait.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hitPoints" className="font-serif">
                Hit Points
              </Label>
              <Input
                type="number"
                value={formData.hitpoints.current}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hitpoints: {
                      ...formData.hitpoints,
                      current: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxHitPoints" className="font-serif">
                Max HP
              </Label>
              <Input
                type="number"
                value={formData.hitpoints.max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hitpoints: {
                      ...formData.hitpoints,
                      max: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hope" className="font-serif">
                Hope
              </Label>
              <Input
                type="number"
                value={formData.hope.current}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hope: {
                      ...formData.hope,
                      current: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxHope" className="font-serif">
                Max Hope
              </Label>
              <Input
                type="number"
                value={formData.hope.max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hope: {
                      ...formData.hitpoints,
                      max: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stress" className="font-serif">
                Stress
              </Label>
              <Input
                type="number"
                value={formData.stress.current}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stress: {
                      ...formData.stress,
                      current: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStress" className="font-serif">
                Max Stress
              </Label>
              <Input
                type="number"
                value={formData.stress.max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stress: {
                      ...formData.stress,
                      max: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="armourSlots" className="font-serif">
                Armour Slots
              </Label>
              <Input
                type="number"
                value={formData.armourSlots.current}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    armourSlots: {
                      ...formData.armourSlots,
                      current: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxArmourSlots" className="font-serif">
                Max Armour
              </Label>
              <Input
                type="number"
                value={formData.armourSlots.max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    armourSlots: {
                      ...formData.armourSlots,
                      max: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-serif">Gold</Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="goldHandfuls" className="text-xs">
                  Handfuls
                </Label>
                <Input
                  type="number"
                  value={formData.gold.handfuls}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gold: {
                        ...formData.gold,
                        handfuls: parseInt(e.target.value, 10) || 0,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="goldBags" className="text-xs">
                  Bags
                </Label>
                <Input
                  type="number"
                  value={formData.gold.bags}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gold: {
                        ...formData.gold,
                        bags: parseInt(e.target.value, 10) || 0,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="goldChests" className="text-xs">
                  Chests
                </Label>
                <Input
                  type="number"
                  value={formData.gold.chests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gold: {
                        ...formData.gold,
                        chests: parseInt(e.target.value, 10) || 0,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              data-testid="button-save-character"
            >
              {character ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
