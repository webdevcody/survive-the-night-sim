"use client";

// import { Map } from "@/app/map";
// import { api } from "@/convex/_generated/api";
// import { useAction } from "convex/react";
// import React, { useState } from "react";
// import { Button } from "./ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
// import { AI_MODELS } from "@/convex/constants";
// import { Id } from "@/convex/_generated/dataModel";

const MapTester = ({ map }: { map: string[][] }) => {
  return null;

  // const getPlayerMap = useAction(api.openai.playMapAction);
  // const [resMap, setResMap] = useState<null | string[][]>();
  // const [loading, setLoading] = useState(false);
  // const [model, setModel] = useState(AI_MODELS[0].model);

  // const handleClick = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await getPlayerMap({
  //       level: 1,
  //       mapId: "zombiemap",
  //       map,
  //       modelId: model,
  //       gameId: "zombiegame" as Id<"games">,
  //     });

  //     // type safe resulting object
  //     console.log(res);
  //     setResMap(res?.map);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // return (
  //   <>
  //     <div className="flex gap-4">
  //       <Select value={model} onValueChange={(value) => setModel(value)}>
  //         <SelectTrigger className="w-[180px]">
  //           <SelectValue placeholder="Select model" />
  //         </SelectTrigger>
  //         <SelectContent>
  //           {AI_MODELS.map((model) => (
  //             <SelectItem key={model.model} value={model.model}>
  //               {model.name}
  //             </SelectItem>
  //           ))}
  //         </SelectContent>
  //       </Select>
  //       <Button onClick={handleClick} disabled={loading}>
  //         Run Simulation
  //       </Button>
  //     </div>
  //     <div className="flex flex-col gap-4">
  //       {loading && <p>Loading result map...</p>}
  //       {resMap && <Map map={resMap} />}
  //     </div>
  //   </>
  // );
};

export default MapTester;
