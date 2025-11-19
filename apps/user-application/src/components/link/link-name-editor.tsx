import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, Edit3, Check, Eye } from "lucide-react";
import { queryClient, trpc } from "@/router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";


interface LinkNameEditorProps {
  linkId: string;
  initialName: string;
}

export function LinkNameEditor({ linkId, initialName }: LinkNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);

  const nameMutation = useMutation(
    trpc.links.updateLinkName.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.links.linkList.queryKey(),
          
        }); // Invalidate link list to reflect name change
        toast.success("Link name updated successfully");
      },
    }),
  );

  const handleSave = () => {
    setIsEditing(false);
    nameMutation.mutate({
      linkId,
      name,
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Link className="w-4 h-4" />
        Link Name
      </Label>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter a memorable name for your link"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 text-base flex-1"
          />
          <Button onClick={handleSave} size="sm" className="h-12 px-3">
            <Check className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
          <div className="flex-1 text-base font-medium">{name}</div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
