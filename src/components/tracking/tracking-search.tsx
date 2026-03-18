"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

export function TrackingSearch({ currentId }: { currentId?: string }) {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState(currentId || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/track?id=${encodeURIComponent(trackingId.trim())}`);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 max-w-lg mx-auto"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Contoh: TF-20260319-0001"
          className="pl-10 h-12 border-border text-base"
        />
      </div>
      <Button
        type="submit"
        className="h-12 px-6"
      >
        Lacak
      </Button>
    </form>
  );
}
