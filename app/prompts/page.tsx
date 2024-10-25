"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { Page } from "@/components/Page";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";

export default function PromptsPage() {
  const prompts = useQuery(api.prompts.getAllPrompts);
  const enablePrompt = useMutation(api.prompts.enablePrompt);
  const deletePrompt = useMutation(api.prompts.deletePrompt);
  const createPrompt = useMutation(api.prompts.createPrompt);

  const isAdmin = useQuery(api.users.isAdmin);

  const router = useRouter();

  const handleCreatePrompt = async () => {
    const newPromptId = await createPrompt({
      promptName: "",
      prompt: "",
    });
    router.push(`/prompts/${newPromptId}`);
  };

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <Page>
      <div className="mb-4 flex justify-between">
        <h1 className="mb-4 font-semibold">Review Prompts</h1>
        <Button variant="default" onClick={handleCreatePrompt}>
          Create Prompt
        </Button>
      </div>
      <div className="flex items-center justify-around">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prompt Name </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts?.map((row) => (
              <TableRow key={row._id}>
                <TableCell>{row.promptName}</TableCell>
                <TableCell>{row._id}</TableCell>
                <TableCell>{row.isActive ? "Yes" : "No"}</TableCell>
                <TableCell className="flex space-x-4">
                  <Button
                    variant="default"
                    onClick={async () => {
                      await enablePrompt({ promptId: row._id });
                    }}
                  >
                    Activate
                  </Button>
                  <Button asChild variant="secondary">
                    <Link
                      className="flex items-center"
                      href={`/prompts/${row._id}`}
                    >
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await deletePrompt({ promptId: row._id });
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Page>
  );
}
