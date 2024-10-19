"use client";

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
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter,redirect } from "next/navigation";

const Page = () => {
  const prompts = useQuery(api.prompts.getAllPrompts);
  const enablePrompt = useMutation(api.prompts.enablePrompt);
  const deletePrompt = useMutation(api.prompts.deletePrompt);
  const createPrompt = useMutation(api.prompts.createPrompt);

  const router = useRouter();

  const handleCreatePrompt = async () => {
    const newPromptId = await createPrompt({
      promptName: "",
      prompt: "",
    });
    router.push(`/prompts/${newPromptId}`);
  };

  return (
    <div className="container mx-auto min-h-screen py-12 pb-24 gap-8">
      <div className="flex justify-between mb-4">
        <h1 className="font-semibold mb-4">Review Prompts</h1>
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
                <TableCell className="space-x-4 flex">
                  <Button
                    variant="default"
                    onClick={async () => {
                      await enablePrompt({ promptId: row._id });
                    }}
                  >
                    Activate
                  </Button>
                  <Link
                    href={`/prompts/${row._id}`}
                    className="flex items-center"
                  >
                    <Button variant="secondary">Edit</Button>
                  </Link>
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
    </div>
  );
};

export default Page;
