import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import type { Character } from "@/schema";
import { GoldTracker } from "./GoldTracker";
import { ResourceTracker } from "./ResourceTracker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface CharacterCardProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  onEdit: (character: Character) => void;
  onDelete: () => void;
}

export default function CharacterCard({
  character,
  onUpdate,
  onEdit,
  onDelete,
}: CharacterCardProps) {
  const [notesOpen, setNotesOpen] = useState<boolean>(false);
  const [updatedNotes, setUpdatedNotes] = useState<string>(
    `${character.notes}`,
  );

  return (
    <Card className="overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
            {character.portraitUrl ? (
              // biome-ignore lint/performance/noImgElement: Need to bypass Next restriction
              <img
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    data-testid={`button-delete-${character.id}`}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">
                      Delete Character?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="font-serif">
                      Are you sure you want to delete{" "}
                      <span className="font-semibold">{character.name}</span>?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-delete">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      data-testid="button-confirm-delete"
                      onClick={onDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
              value={updatedNotes}
              onChange={(e) => setUpdatedNotes(e.target.value)}
              className="min-h-[100px] font-serif"
              data-testid={`input-notes-${character.id}`}
            />
            <div className="flex justify-end mt-2">
              <Button
                className="mx-2"
                disabled={updatedNotes === character.notes}
                onClick={() => onUpdate({ notes: updatedNotes })}
              >
                <Save />
                Save
              </Button>
              <Button
                className=""
                disabled={updatedNotes === character.notes}
                onClick={() => setUpdatedNotes(`${character.notes}`)}
              >
                Reset
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-4">
          <ResourceTracker
            character={character}
            label="Hit Points"
            field={character.hitpoints}
            name="hitpoints"
            onUpdate={onUpdate}
          />
          <ResourceTracker
            character={character}
            label="Hope"
            field={character.hope}
            name="hope"
            onUpdate={onUpdate}
          />
          <ResourceTracker
            character={character}
            label="Stress"
            field={character.stress}
            name="stress"
            onUpdate={onUpdate}
          />
          <ResourceTracker
            character={character}
            label="Armour Slots"
            field={character.armourSlots}
            name="armourSlots"
            onUpdate={onUpdate}
          />
          <GoldTracker
            gold={character.gold}
            onUpdate={(gold) => onUpdate({ gold })}
          />
        </div>
      </div>
    </Card>
  );
}
