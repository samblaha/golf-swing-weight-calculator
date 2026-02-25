import { useMemo, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileOption {
  id: string;
  name: string;
}

interface ProfileToolbarProps {
  profiles: ProfileOption[];
  activeProfileId: string;
  lastSavedLabel: string;
  onSelectProfile: (profileId: string) => void;
  onCreateProfile: (name: string) => void;
  onRenameProfile: (name: string) => void;
  onDeleteProfile: () => void;
  onResetTemplate: () => void;
  onAddClub: () => void;
}

export function ProfileToolbar({
  profiles,
  activeProfileId,
  lastSavedLabel,
  onSelectProfile,
  onCreateProfile,
  onRenameProfile,
  onDeleteProfile,
  onResetTemplate,
  onAddClub,
}: ProfileToolbarProps) {
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [renameName, setRenameName] = useState("");

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0],
    [activeProfileId, profiles],
  );

  const openRenameDialog = () => {
    setRenameName(activeProfile?.name ?? "");
    setRenameDialogOpen(true);
  };

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-2">
          <p className="text-sm font-medium text-muted-foreground">Bag profile</p>
          <Select value={activeProfileId} onValueChange={onSelectProfile}>
            <SelectTrigger className="w-full min-w-[220px]">
              <SelectValue placeholder="Select bag" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Last saved: {lastSavedLabel}</Badge>

          <Button onClick={onAddClub} size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Add Club
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Bag actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Bag actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setNewDialogOpen(true)}>New bag</DropdownMenuItem>
              <DropdownMenuItem onSelect={openRenameDialog}>Rename bag</DropdownMenuItem>
              <DropdownMenuItem onSelect={onResetTemplate}>Reset template</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onSelect={onDeleteProfile}>
                Delete bag
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create bag profile</DialogTitle>
            <DialogDescription>Name your new bag profile.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Bag name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const trimmed = newName.trim();
                if (!trimmed) {
                  return;
                }
                onCreateProfile(trimmed);
                setNewName("");
                setNewDialogOpen(false);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename bag profile</DialogTitle>
            <DialogDescription>Update the current bag name.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={renameName}
            onChange={(event) => setRenameName(event.target.value)}
            placeholder="Bag name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const trimmed = renameName.trim();
                if (!trimmed) {
                  return;
                }
                onRenameProfile(trimmed);
                setRenameDialogOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
