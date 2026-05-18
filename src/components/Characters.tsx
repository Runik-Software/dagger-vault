"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createCharacter,
  deleteCharacter,
  getCampaign,
  getCharacters,
  updateCharacter,
} from "@/actions";
import { CampaignOverview } from "@/components/CampaignOverview";
import CharacterCard from "@/components/CharacterCard";
import CharacterDialog from "@/components/CharacterDialog";
import { DiceRoller } from "@/components/DiceRoller";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { createPusherClient } from "@/lib/pusher";
import type { Campaign, Character, EditCharacter } from "@/schema";

export function Characters({ campaignId }: { campaignId: string }) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );

  const { data: charactersData, isLoading: charactersLoading } = useQuery({
    queryKey: ["characters", campaignId],
    queryFn: () => {
      return getCharacters(campaignId);
    },
  });

  const { data: campaignData } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => {
      return getCampaign(campaignId);
    },
  });

  const characters = charactersData ?? [];

  const addCharacterMutation = useMutation({
    mutationFn: (newChar: EditCharacter) => {
      return createCharacter(campaignId, newChar);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters", campaignId] });
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
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["characters", campaignId] });
      toast.error("Failed to update character");
    },
  });

  const debouncedUpdatesRef = useRef(
    new Map<string, ReturnType<typeof debounce>>(),
  );

  const deleteCharacterMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteCharacter(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters", campaignId] });
      toast.success("Character deleted");
    },
  });

  const handleUpdate = (id: string, updates: Partial<Character>) => {
    queryClient.setQueryData(
      ["characters", campaignId],
      (old?: Character[]) => {
        if (!old) return old;
        return old.map((c) => {
          if (c.id === id) {
            return { ...c, ...updates };
          } else {
            return c;
          }
        });
      },
    );
    let debounced = debouncedUpdatesRef.current.get(id);
    if (!debounced) {
      debounced = debounce((data: Partial<Character>) => {
        updateCharacterMutation.mutate({ id, data });
      }, 300);
      debouncedUpdatesRef.current.set(id, debounced);
    }
    debounced(updates);
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
    return () => {
      for (const debounced of debouncedUpdatesRef.current.values()) {
        debounced.flush();
      }
    };
  }, []);

  useEffect(() => {
    const pusher = createPusherClient(campaignId);

    const channel = pusher.subscribe(
      `private-campaign-${campaignId}-characters`,
    );

    channel.bind(
      "update",
      ({
        character,
        triggeredUserId,
      }: {
        character: Character;
        triggeredUserId: string;
      }) => {
        if (session?.user.id !== triggeredUserId) {
          console.log(
            "Updating from socket event",
            session?.user.id,
            triggeredUserId,
            session?.user.id === triggeredUserId,
          );
          queryClient.setQueryData(
            ["characters", campaignId],
            (old: Character[]) => {
              return old.map((c) => {
                if (c.id === character.id) {
                  return character;
                } else {
                  return c;
                }
              });
            },
          );
        }
      },
    );
    return () => {
      pusher.unsubscribe(`private-campaign-${campaignId}-characters`);
      pusher.disconnect();
    };
  }, [queryClient, campaignId, session]);

  // Fullscreen state
  const [fullscreenCharacterId, setFullscreenCharacterId] = useState<
    string | null
  >(null);
  const [rightExpandedId, setRightExpandedId] = useState<string | null>(null);

  if (charactersLoading) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div
              key={index}
              className="space-y-4 rounded-3xl border border-border bg-background p-6"
            >
              <Skeleton className="h-8 w-3/4 rounded-md" />
              <Skeleton className="h-5 w-1/2 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Skeleton className="h-10 rounded-2xl" />
                <Skeleton className="h-10 rounded-2xl" />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-center rounded-3xl border border-dashed border-border bg-background p-6">
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </main>
    );
  }

  // If fullscreen is active render a split view overlay
  if (fullscreenCharacterId) {
    const primary = characters.find(
      (c) => c.id === fullscreenCharacterId,
    ) as Character;
    const others = characters.filter((c) => c.id !== fullscreenCharacterId);

    return (
      <div className="fixed inset-0 z-50 bg-[url('/background.jpg')] bg-cover bg-center bg-fixed">
        <div className="flex h-full flex-col overflow-hidden">
          <div className="px-6 py-5">
            {campaignData ? (
              <CampaignOverview campaign={campaignData as Campaign} />
            ) : null}
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className="w-3/4 overflow-hidden">
              <div className="flex h-full">
                <div className="w-1/2 overflow-auto p-6">
                  <div className="overflow-auto">
                    <CharacterCard
                      character={primary}
                      onUpdate={(data) => handleUpdate(primary.id, data)}
                      onEdit={handleEdit}
                      onDelete={() => handleDeleteConfirm(primary.id)}
                      onMinimize={() => setFullscreenCharacterId(null)}
                      campaignId={campaignId}
                      large
                    />
                  </div>
                </div>
                <div className="w-1/2 overflow-auto p-6">
                  <div className="overflow-auto">
                    <DiceRoller campaignId={campaignId} />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/4 overflow-auto p-4">
              <div className="space-y-3">
                {others.map((c) => (
                  <div key={c.id}>
                    {rightExpandedId === c.id ? (
                      <CharacterCard
                        character={c}
                        onUpdate={(data) => handleUpdate(c.id, data)}
                        onEdit={handleEdit}
                        onDelete={() => handleDeleteConfirm(c.id)}
                        campaignId={campaignId}
                        onMinimize={() => setRightExpandedId(null)}
                        onFullscreen={() => setFullscreenCharacterId(c.id)}
                      />
                    ) : (
                      <CharacterCard
                        compact
                        character={c}
                        onUpdate={() => {}}
                        onEdit={handleEdit}
                        onDelete={() => handleDeleteConfirm(c.id)}
                        campaignId={campaignId}
                        onClick={() => setRightExpandedId(c.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <CharacterDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          character={editingCharacter}
          onSave={(data) => handleEditSave(data)}
        />
      </div>
    );
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
                campaignId={campaignId}
                onFullscreen={() => setFullscreenCharacterId(character.id)}
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
