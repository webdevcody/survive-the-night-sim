import MapTester from "@/components/MapTester";
import { Map } from "./map";

const hardCodedMapTemp = [
  [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", "P", "B", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", "B", " ", " ", " ", " ", " "],
  ["R", "R", "R", "R", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " ", "Z", " "],
  [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  [" ", "Z", " ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
];

export default function MainPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Map map={hardCodedMapTemp} />
      <MapTester map={hardCodedMapTemp} />
    </div>
  );
}
