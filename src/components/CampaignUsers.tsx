import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  addUserToCampaign,
  getCampaignUsers,
  removeUserFromCampaign,
} from "@/actions";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "./ui/item";
import { Spinner } from "./ui/spinner";

const addUserFormSchema = z.object({
  email: z.email(),
});

export function CampaignUsers({ id }: { id: string }) {
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const {
    data: users,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["campaignUsers", id],
    queryFn: () => {
      return getCampaignUsers(id);
    },
    initialData: [],
  });

  const addUserMutation = useMutation({
    mutationFn: ({ email }: z.infer<typeof addUserFormSchema>) => {
      console.log("Email:", email);
      return addUserToCampaign({ campaignId: id, userEmail: email });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["campaignUsers", id] });
      toast.success("Added user to the campaign");
      setIsDialogOpen(false);
      addUserForm.reset();
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: (userId: string) => {
      return removeUserFromCampaign({ userId: userId, campaignId: id });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["campaignUsers", id] });
      toast.success("Removed user from the campaign");
    },
  });

  const addUserForm = useForm<z.infer<typeof addUserFormSchema>>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(addUserFormSchema),
  });

  const handleAddNewUserSubmit = (data: z.infer<typeof addUserFormSchema>) => {
    console.log("submit", data);
    addUserMutation.mutate(data);
  };

  if (isFetching) {
    return <Spinner className="size-16 text-primary" />;
  }

  if (error) {
    return <p className="text-xl">{error.message}</p>;
  }

  return (
    <>
      <h1>Campaign users</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Add user</Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={addUserForm.handleSubmit(handleAddNewUserSubmit)}>
            <DialogHeader>
              <DialogTitle>Add a new user</DialogTitle>
              <DialogDescription>
                Add a user to view and manage characters for this campaign
              </DialogDescription>
            </DialogHeader>
            {addUserMutation.isError && (
              <p className="text-destructive py-4">
                {addUserMutation.error.message}
              </p>
            )}
            <FieldGroup>
              <Controller
                name="email"
                control={addUserForm.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-2"
                  >
                    <FieldLabel>User Email</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      type="email"
                      placeholder="Enter user email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    addUserForm.reset();
                    addUserMutation.reset();
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button variant="default" type="submit">
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {users.map((user) => (
        <Item key={user.id} variant="outline" className="my-4">
          <ItemContent>
            <ItemTitle>{user.name}</ItemTitle>
            <ItemDescription>{user.email}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeUserMutation.mutate(user.id)}
            >
              Remove
              <Trash2 />
            </Button>
          </ItemActions>
        </Item>
      ))}
    </>
  );
}
