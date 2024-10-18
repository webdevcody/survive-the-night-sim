"use client";

import React from "react";
import { Button } from "./ui/button";

export function CopyMapButton({ map }: { map: string[][] }) {
  async function handleClick() {
    await navigator.clipboard.writeText(JSON.stringify(map));
  }

  return (
    <Button onClick={handleClick} type="button">
      Copy As Code
    </Button>
  );
}
