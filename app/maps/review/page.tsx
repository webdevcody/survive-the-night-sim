"use client";

import { useMutation, useQuery } from "convex/react";
import { Map } from "@/components/Map";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

const Page = () => {
  const isAdmin = useQuery(api.users.isAdmin);
  const maps = useQuery(api.maps.getMaps, { isReviewed: false });
  const adminApprovalMutation = useMutation(api.maps.approveMap);

  if (isAdmin == true) {
    return (
      <div className="container mx-auto min-h-screen gap-8 py-12 pb-24">
        <h1 className="mb-6 text-center text-3xl font-bold">Review Maps</h1>
        <div className="flex flex-col items-center justify-around gap-4">
          {maps?.map((map) => (
            <Card key={map._id}>
              <CardHeader>
                <CardTitle> </CardTitle>
              </CardHeader>

              <CardContent>
                <Map map={map.grid} />
              </CardContent>

              <CardFooter className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={async () => {
                    await adminApprovalMutation({ mapId: map._id });
                  }}
                >
                  Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return <div>Not an admin</div>;
};

export default Page;
