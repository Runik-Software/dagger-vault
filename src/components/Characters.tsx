"use client";

import {
  createCharacter,
  deleteCharacter,
  getCharacters,
  updateCharacter,
} from "@/actions";
import CharacterCard from "@/components/CharacterCard";
import CharacterDialog from "@/components/CharacterDialog";
import { Button } from "@/components/ui/button";
import { createPusherClient } from "@/lib/pusher";
import type { Character, EditCharacter } from "@/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Characters({ campaignId }: { campaignId: string }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );

  const { data: characters, isPending: charactersPending } = useQuery({
    queryKey: ["characters"],
    queryFn: () => {
      return getCharacters(campaignId);
    },
    initialData: [],
  });

  const addCharacterMutation = useMutation({
    mutationFn: (newChar: EditCharacter) => {
      return createCharacter(campaignId, newChar);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      toast.success("Character created");
    },
  });

  const updateCharacterMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Character>;
    }) => {
      return await updateCharacter(id, data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["characters"], (old: Character[]) => {
        return old.map((c) => {
          if (c.id === data.id) {
            return data;
          } else {
            return c;
          }
        });
      });
    },
  });

  const deleteCharacterMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteCharacter(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      toast.success("Character deleted");
    },
  });

  const handleUpdate = (id: string, updates: Partial<Character>) => {
    updateCharacterMutation.mutate({ id, data: updates });
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    deleteCharacterMutation.mutate(id);
  };

  const handleAddNew = () => {
    setEditingCharacter(null);
    setDialogOpen(true);
  };

  const handleEditSave = (character: EditCharacter) => {
    setDialogOpen(false);
    if (!editingCharacter) {
      addCharacterMutation.mutate(character);
    } else {
      handleUpdate(editingCharacter.id, character);
    }
  };

  useEffect(() => {
    const pusher = createPusherClient(campaignId);

    const channel = pusher.subscribe(
      `private-campaign-${campaignId}-characters`,
    );

    channel.bind("update", ({ character }: { character: Character }) => {
      queryClient.setQueryData(["characters"], (old: Character[]) => {
        return old.map((c) => {
          if (c.id === character.id) {
            return character;
          } else {
            return c;
          }
        });
      });
    });
    return () => {
      pusher.unsubscribe(`${campaignId}_characters`);
      pusher.disconnect();
    };
  }, [queryClient, campaignId]);

  if (charactersPending) {
    return <div>Loading...</div>;
  }

  return (
    <>
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
                onUpdate={(data) => handleUpdate(character.id, data)}
                onEdit={handleEdit}
                onDelete={() => handleDeleteConfirm(character.id)}
              />
            ))}
            <Button
              variant="outline"
              className="border-dashed hover:bg-accent hover:text-accent-foreground"
              onClick={handleAddNew}
            >
              <Plus className="h-5 w-5 mr-2" />
              New Character
            </Button>
          </div>
        )}
      </main>

      <CharacterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        character={editingCharacter}
        onSave={(data) => handleEditSave(data)}
      />
    </>
  );
}
