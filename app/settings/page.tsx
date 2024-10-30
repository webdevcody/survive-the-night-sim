"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { redirect, useRouter } from "next/navigation";
import { Page, PageTitle } from "@/components/Page";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

export default function Settings() {
  const { signOut } = useAuthActions();
  const deleteAccount = useMutation(api.users.deleteUserById);
  const user = useQuery(api.users.getUserOrNull);

  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete your account?")) {
      if (user) {
        await signOut();
        await deleteAccount();

        router.push("/");
      }
    }
  };

  return (
    <Page>
      <PageTitle>Settings</PageTitle>
      <div>
        <h1 className="pb-4 text-2xl">Delete your account</h1>
        <p className="text-md">
          If you delete your account, all of your data will be permanently
          removed. This includes your game results, and your user information.
          Any maps you created and that were approved will not be removed but
          you will no longer be the creator of them. This action cannot be
          undone.
        </p>
        <div className="flex justify-end pt-4">
          <Button variant="destructive" onClick={handleDelete}>
            Confirm
          </Button>
        </div>
      </div>
    </Page>
  );
}
