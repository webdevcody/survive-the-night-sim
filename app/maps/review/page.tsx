"use client";

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
import { useMutation, useQuery } from "convex/react";

const Page = () => {
  const isAdmin = useQuery(api.users.isAdmin);
  const maps = useQuery(api.maps.getMaps, { isReviewed: false });
  const adminApprovalMutation = useMutation(api.maps.approveMap);

  if (isAdmin == true) {
    return (
      <div className="py-6">
        <h1 className="text-center font-semibold mb-4">Review Maps</h1>
        <div className="flex items-center justify-around">
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
