import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Pencil,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { IconResourceTracker } from "./IconResourceTracker";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface CharacterCardProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  onEdit: (character: Character) => void;
  onDelete: () => void;
  campaignId: string;
  // Optional UI modes
  compact?: boolean; // shows only name + image
  large?: boolean; // show larger portrait and heading
  onFullscreen?: () => void; // request main fullscreen view
  onMinimize?: () => void; // request minimize when in fullscreen
  onClick?: () => void; // card click (useful for compact)
}

export default function CharacterCard({
  character,
  onUpdate,
  onEdit,
  onDelete,
  campaignId,
  compact = false,
  large = false,
  onFullscreen,
  onMinimize,
  onClick,
}: CharacterCardProps) {
  const [notesOpen, setNotesOpen] = useState<boolean>(false);
  const [updatedNotes, setUpdatedNotes] = useState<string>(
    `${character.notes}`,
  );
  const [useIconDisplay, setUseIconDisplay] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const iconDisplayKey = `${campaignId}_useIconStatDisplay`;
    const stored = localStorage.getItem(iconDisplayKey);
    if (stored !== null) {
      setUseIconDisplay(stored === "true");
    }
  }, [campaignId]);

  if (compact) {
    return (
      <Card className="overflow-hidden cursor-pointer" onClick={onClick}>
        <div className="p-3 flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden border"
            aria-hidden
          >
            {character.portraitUrl ? (
              // biome-ignore lint/performance/noImgElement: Need to bypass Next restriction
              <img
                src={character.portraitUrl}
                alt={character.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-display font-semibold truncate">
              {character.name}
            </h4>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className={`${large ? "p-8 space-y-6" : "p-5 space-y-4"}`}>
        <div className="flex items-start gap-4">
          <div
            className={`rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden border w-20 h-20`}
          >
            {character.portraitUrl ? (
              // biome-ignore lint/performance/noImgElement: Need to bypass Next restriction
              <img
                src={character.portraitUrl}
                alt={character.name}
                width={large ? 192 : 80}
                height={large ? 192 : 80}
                className="w-full h-full object-cover"
              />
            ) : (
              <User
                className={`${large ? "h-16 w-16" : "h-10 w-10"} text-muted-foreground`}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3
                  className={`${large ? "text-3xl" : "text-xl"} font-display font-semibold text-foreground truncate`}
                  data-testid={`text-character-name-${character.id}`}
                >
                  {character.name}
                </h3>
              </div>
              <div className="flex gap-2 mt-0">
                {onFullscreen ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onFullscreen}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View character in fullscreen</p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}
                {onMinimize ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <Button size="sm" variant="outline" onClick={onMinimize}>
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Minimize character card</p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      data-testid={`button-edit-${character.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(character)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit character</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
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
                            <span className="font-semibold">
                              {character.name}
                            </span>
                            ? This action cannot be undone.
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete character</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="mt-2" />
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
          {useIconDisplay ? (
            <>
              <IconResourceTracker
                label="Hit Points"
                field={character.hitpoints}
                name="hitpoints"
                onUpdate={onUpdate}
                iconType="health"
              />
              <IconResourceTracker
                label="Hope"
                field={character.hope}
                name="hope"
                onUpdate={onUpdate}
                iconType="hope"
              />
              <IconResourceTracker
                label="Stress"
                field={character.stress}
                name="stress"
                onUpdate={onUpdate}
                iconType="stress"
              />
              <IconResourceTracker
                label="Armour Slots"
                field={character.armourSlots}
                name="armourSlots"
                onUpdate={onUpdate}
                iconType="armour"
              />
            </>
          ) : (
            <>
              <ResourceTracker
                label="Hit Points"
                field={character.hitpoints}
                name="hitpoints"
                onUpdate={onUpdate}
              />
              <ResourceTracker
                label="Hope"
                field={character.hope}
                name="hope"
                onUpdate={onUpdate}
              />
              <ResourceTracker
                label="Stress"
                field={character.stress}
                name="stress"
                onUpdate={onUpdate}
              />
              <ResourceTracker
                label="Armour Slots"
                field={character.armourSlots}
                name="armourSlots"
                onUpdate={onUpdate}
              />
            </>
          )}
          <GoldTracker
            gold={character.gold}
            onUpdate={(gold) => onUpdate({ gold })}
          />
        </div>
      </div>
    </Card>
  );
}
