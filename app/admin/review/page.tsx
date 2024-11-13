"use client";

import { useMutation, useQuery } from "convex/react";
import { Map } from "@/components/Map";
import { Page, PageTitle } from "@/components/Page";
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
      <Page>
        <PageTitle>Review Maps</PageTitle>
        <div className="grid grid-cols-[max-content_max-content] justify-center gap-4">
          {maps?.map((map) => (
            <Card key={map._id}>
              <CardHeader>
                <CardTitle> </CardTitle>
              </CardHeader>

              <CardContent>
                <Map map={map.grid} />
              </CardContent>

              <CardFooter className="flex flex-col gap-2">
                <p className="text-sm">
                  Blocks: {map.maxBlocks ?? 0}, Landmines:{" "}
                  {map.maxLandmines ?? 0}
                </p>
                <div className="flex justify-center gap-2">
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
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Page>
    );
  }

  return <div>Not an admin</div>;
}
