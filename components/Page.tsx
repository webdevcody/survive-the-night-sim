import React from "react";
import { cn } from "@/lib/utils";

export const PageTitle = (props: { children: React.ReactNode }) => {
  return (
    <h1 className="mb-6 text-center text-3xl font-bold">{props.children}</h1>
  );
};

export const Page = (props: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "container mx-auto min-h-screen py-12 pb-24",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
};
