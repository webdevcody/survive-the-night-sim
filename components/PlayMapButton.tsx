"use client";

import * as React from "react";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function PlayMapButton({ mapId }: { mapId: string }) {
  return (
    <Button asChild variant="outline" size="icon">
      <Link href={`/playground?map=${mapId}`}>
        <ExternalLinkIcon size={16} />
      </Link>
    </Button>
  );
}
