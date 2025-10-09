"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CharacterCard from "@/components/CharacterCard";
import CharacterDialog from "@/components/CharacterDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import type { Character } from "@/schema";

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );
  const [deletingCharacter, setDeletingCharacter] = useState<Character | null>(
    null,
  );

  const getCharacters = useMemo(
    () => (): Character[] => {
      const stored = localStorage.getItem("characters");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
      return [];
    },
    [],
  );

  const addCharacter = (character: Character): Character[] => {
    const updated = [...characters, character];
    localStorage.setItem("characters", JSON.stringify(updated));
    return updated;
  };

  const updateCharacter = (
    id: string,
    updates: Partial<Character>,
  ): Character[] => {
    const updated = characters.map((char) =>
      char.id === id ? { ...char, ...updates } : char,
    );
    localStorage.setItem("characters", JSON.stringify(updated));
    return updated;
  };

  const deleteCharacter = (id: string): Character[] => {
    const updated = characters.filter((char) => char.id !== id);
    localStorage.setItem("characters", JSON.stringify(updated));
    return updated;
  };

  useEffect(() => {
    setCharacters(getCharacters());
  }, [getCharacters]);

  const handleSave = (data: Partial<Character>) => {
    if (editingCharacter) {
      const updated = updateCharacter(editingCharacter.id, data);
      setCharacters(updated);
      toast.info("Character Updated", {
        description: `${data.name} has been updated successfully.`,
      });
    } else {
      const newChar: Character = {
        id: crypto.randomUUID(),
        name: data.name || "",
        notes: data.notes || "",
        hitpoints: data.hitpoints || { current: 20, max: 20 },
        hope: data.hope || { current: 6, max: 6 },
        stress: data.stress || { current: 0, max: 5 },
        armourSlots: data.armourSlots || { current: 0, max: 3 },
        gold: data.gold || { handfuls: 0, bags: 0, chests: 0 },
        portraitUrl: data.portraitUrl,
      };
      const updated = addCharacter(newChar);
      setCharacters(updated);
      toast.success("Character Created", {
        description: `${newChar.name} has been added to your roster.`,
      });
    }
    setEditingCharacter(null);
  };

  const handleUpdate = (id: string, updates: Partial<Character>) => {
    console.log("Updating character", id, updates);
    const updated = updateCharacter(id, updates);
    setCharacters(updated);
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const character = characters.find((c) => c.id === id);
    if (character) {
      setDeletingCharacter(character);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingCharacter) {
      const updated = deleteCharacter(deletingCharacter.id);
      setCharacters(updated);
      toast.success("Character Deleted", {
        description: `${deletingCharacter.name} has been removed.`,
      });
      setDeletingCharacter(null);
    }
  };

  const handleAddNew = () => {
    setEditingCharacter(null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-accent z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* <h1 className="text-3xl font-display font-bold text-foreground">
            Daggerheart Tracker
          </h1> */}
          <Image
            src="/daggerheart-logo-2.png"
            alt="Daggerheart RPG"
            width={150}
            height={150}
          />
          <Button
            data-testid="button-add-character"
            onClick={handleAddNew}
            size="default"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Character
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center space-y-4 max-w-md">
              <h2 className="text-2xl font-display font-semibold text-foreground">
                No Characters Yet
              </h2>
              <p className="text-muted-foreground font-serif">
                Create your first Daggerheart character to start tracking their
                resources during your adventures.
              </p>
              <Button
                data-testid="button-create-first"
                onClick={handleAddNew}
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Character
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onUpdate={handleUpdate}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </main>

      <CharacterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        character={editingCharacter}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        characterName={deletingCharacter?.name || ""}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
