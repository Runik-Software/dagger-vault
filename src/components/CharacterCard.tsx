import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import type { Character } from "@/schema";
import { ChevronDown, ChevronUp, Pencil, Trash2, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { GoldTracker } from "./GoldTracker";
import { ResourceTracker } from "./ResourceTracker";

interface CharacterCardProps {
  character: Character;
  onUpdate: (id: string, updates: Partial<Character>) => void;
  onEdit: (character: Character) => void;
  onDelete: (id: string) => void;
}

export default function CharacterCard({
  character,
  onUpdate,
  onEdit,
  onDelete,
}: CharacterCardProps) {
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
            {character.portraitUrl ? (
              <Image
                src={character.portraitUrl}
                alt={character.name}
                width={20}
                height={20}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-xl font-display font-semibold text-foreground truncate"
              data-testid={`text-character-name-${character.id}`}
            >
              {character.name}
            </h3>
            <div className="flex gap-2 mt-2">
              <Button
                data-testid={`button-edit-${character.id}`}
                size="sm"
                variant="outline"
                onClick={() => onEdit(character)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                data-testid={`button-delete-${character.id}`}
                size="sm"
                variant="outline"
                onClick={() => onDelete(character.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
              data-testid={`button-toggle-notes-${character.id}`}
            >
              <span className="font-serif">Notes</span>
              {notesOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <Textarea
              placeholder="Add character notes, backstory, or important details..."
              value={character.notes || ""}
              onChange={(e) =>
                onUpdate(character.id, { notes: e.target.value })
              }
              className="min-h-[100px] font-serif"
              data-testid={`input-notes-${character.id}`}
            />
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-4">
          <ResourceTracker
            label="Hit Points"
            field={character.hitpoints}
            id={character.id}
            name="hitpoints"
            onUpdate={onUpdate}
          />
          <ResourceTracker
            label="Hope"
            field={character.hope}
            id={character.id}
            name="hope"
            onUpdate={onUpdate}
          />
          <ResourceTracker
            label="Stress"
            field={character.stress}
            id={character.id}
            name="stress"
            onUpdate={onUpdate}
          />
          <ResourceTracker
            label="Armour Slots"
            field={character.armourSlots}
            id={character.id}
            name="armourSlots"
            onUpdate={onUpdate}
          />
          <GoldTracker
            gold={character.gold}
            onUpdate={(gold) => onUpdate(character.id, { gold })}
          />
        </div>
      </div>
    </Card>
  );
}
