import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/router";
import { toast } from "sonner";

export const Route = createFileRoute("/app/_authed/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const nav = useNavigate();

  const createMutation = useMutation(
    trpc.links.createLink.mutationOptions({
      onSuccess: (linkId) => {
        nav({
          to: "/app/link/$id",
          params: {
            id: linkId,
          },
        });
      },
      onError: () => {
        toast.error("Failed to create link");
      },
    }),
  );

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-muted/50 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Main Form */}
        <Card className="shadow-xl">
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl font-semibold">
              Create Link
            </CardTitle>
            <CardDescription className="text-base">
              Create a new short link with a name and destination URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Link Name */}
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Link className="w-4 h-4" />
                Link Name
              </Label>
              <Input
                id="name"
                placeholder="Enter a memorable name for your link"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            {/* URL Input */}
            <div className="space-y-3">
              <Label htmlFor="url" className="text-sm font-medium">
                Destination URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                onClick={() => {
                  createMutation.mutate({
                    name,
                    destinations: {
                      default: url,
                    },
                  });
                }}
                disabled={!name || !url || !isValidUrl(url) || createMutation.isPending}
                className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all duration-200"
              >
              {
                createMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Creating...
                  </div>
                ) : (
                  "Create Link"
                )
              }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
