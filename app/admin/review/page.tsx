"use client";

import { useMutation, useQuery } from "convex/react";
import { Map } from "@/components/Map";
import { PlayMapButton } from "@/components/PlayMapButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

export default function AdminReviewPage() {
  const isAdmin = useQuery(api.users.isAdmin);
  const maps = useQuery(api.maps.getUnreviewedMaps);
  const adminApprovalMutation = useMutation(api.maps.approveMap);
  const adminRejectMapMutation = useMutation(api.maps.rejectMap);

  if (isAdmin == true) {
    return (
      <div className="container mx-auto min-h-screen gap-8 py-12 pb-24">
        <h1 className="mb-6 text-center text-3xl font-bold">Review Maps</h1>
        <div className="grid grid-cols-[max-content_max-content] justify-center gap-4">
          {maps?.map((map) => (
            <Card key={map._id}>
              <CardHeader>
                <CardTitle> </CardTitle>
              </CardHeader>

              <CardContent>
                <Map map={map.grid} />
              </CardContent>

              <CardFooter className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    await adminApprovalMutation({ mapId: map._id });
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await adminRejectMapMutation({ mapId: map._id });
                  }}
                >
                  Reject
                </Button>
                <PlayMapButton mapId={map._id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return <div>Not an admin</div>;
}
