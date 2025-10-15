import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
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
import {
  type Character,
  type EditCharacter,
  editCharacterSchema,
} from "@/schema";
import CharacterFieldSet from "./CharacterFieldSet";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";

interface CharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character?: Character | null;
  onSave: (character: EditCharacter) => void;
}

const emptyCharacter: EditCharacter = {
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
  const form = useForm<z.infer<typeof editCharacterSchema>>({
    defaultValues: character ?? emptyCharacter,
    resolver: zodResolver(editCharacterSchema),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to reset when character or open changes
  useEffect(() => {
    form.reset(character ?? emptyCharacter);
  }, [character, form, open]);

  const handleSubmit = (data: z.infer<typeof editCharacterSchema>) => {
    onSave(data);
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-2">
                  <FieldLabel>Character Name</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter character name"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-2">
                  <FieldLabel>Notes</FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                    placeholder="Any notes about this character e.g. damage thresholds"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="portraitUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-2">
                  <FieldLabel>Character portrait</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                    placeholder="URL to an image of the character"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <CharacterFieldSet
              control={form.control}
              pair={[
                { name: "hitpoints.current", label: "Hit Points" },
                { name: "hitpoints.max", label: "Max HP" },
              ]}
            />

            <CharacterFieldSet
              control={form.control}
              pair={[
                { name: "hope.current", label: "Hope" },
                { name: "hope.max", label: "Max Hope" },
              ]}
            />

            <CharacterFieldSet
              control={form.control}
              pair={[
                { name: "stress.current", label: "Stress" },
                { name: "stress.max", label: "Max Stress" },
              ]}
            />

            <CharacterFieldSet
              control={form.control}
              pair={[
                { name: "armourSlots.current", label: "Armour Slots" },
                { name: "armourSlots.max", label: "Max Armour Slots" },
              ]}
            />

            <div>
              <Label className="font-serif">Gold</Label>
              <CharacterFieldSet
                control={form.control}
                group={[
                  { name: "gold.handfuls", label: "Handfuls" },
                  { name: "gold.bags", label: "Bags" },
                  { name: "gold.chests", label: "Chests" },
                ]}
                gridClassName="space-y-2"
              />
            </div>
          </FieldGroup>

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
