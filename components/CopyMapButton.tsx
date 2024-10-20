"use client";

import * as React from "react";
import { ClipboardCopyIcon, SmileIcon } from "lucide-react";

export function CopyMapButton({ map }: { map: string[][] }) {
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function handleClick() {
    await navigator.clipboard.writeText(JSON.stringify(map));
    setCopied(true);

    timeout.current = setTimeout(() => {
      timeout.current = null;
      setCopied(false);
    }, 2000);
  }

  React.useEffect(() => {
    return () => {
      if (timeout.current !== null) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return (
    <button
      className={
        copied
          ? "cursor-default"
          : "transition enabled:hover:scale-125 disabled:opacity-50"
      }
      onClick={copied ? undefined : handleClick}
      type="button"
    >
      {copied ? <SmileIcon size={16} /> : <ClipboardCopyIcon size={16} />}
    </button>
  );
}
