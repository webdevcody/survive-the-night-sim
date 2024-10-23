import * as React from "react";
import { useQuery } from "convex/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";

export function ModelSelector({
  onChange,
  value,
}: {
  onChange: (value: string) => unknown;
  value: string;
}) {
  const models = useQuery(api.models.getActiveModels);

  React.useEffect(() => {
    if (models !== undefined && models.length !== 0 && value === "") {
      onChange(models[0].slug);
    }
  }, [models, value]);

  if (models === undefined) {
    return <p>Loading...</p>;
  } else if (models.length === 0) {
    return <p>No models found.</p>;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model._id} value={model.slug}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
