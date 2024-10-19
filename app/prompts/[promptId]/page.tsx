"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function editPromtPage({
  params,
}: {
  params: { promptId: string };
}) {
  const prompt = useQuery(api.prompts.getPromptById, {
    promptId: params.promptId,
  });
  console.log(prompt);
  const updatePrompt = useMutation(api.prompts.updatePrompt);
  const isAdmin = useQuery(api.users.isAdmin);

  const [promptName, setPromptName] = useState("");
  const [promptText, setPromptText] = useState("");

  useEffect(() => {
    if (prompt) {
      setPromptName(prompt.promptName);
      setPromptText(prompt.prompt);
    }
  }, [prompt]);

  const handlePromptNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromptName(e.target.value);
  };

  const handlePromptTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setPromptText(e.target.value);
  };

  const router = useRouter();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt) return;

    updatePrompt({ promptId: prompt._id, promptName, prompt: promptText });
    router.push("/prompts");
  };

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="container mx-auto min-h-screen pb-24 py-12 gap-8">
      <form className="py-6 px-6 h-full" onSubmit={handleSubmit}>
        <div className="flex justify-between mb-4">
          <h1 className="font-semibold mb-4">Edit your prompt</h1>
          <div className="flex space-x-4">
            <Button variant="default">Save</Button>
            <Link href="/prompts">
              <Button variant="default">Return</Button>
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-start space-y-4 min-h-screen h-screen">
          <Input
            placeholder="Prompt Name"
            value={promptName}
            onChange={handlePromptNameChange}
          />
          <textarea
            placeholder="Prompt"
            className=" h-full w-full rounded-md border border-input bg-transparent px-3 py-1"
            value={promptText}
            onChange={handlePromptTextChange}
          />
        </div>
      </form>
    </div>
  );
}
