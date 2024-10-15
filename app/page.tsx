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
    <div className="min-h-screen flex items-center justify-center">
      <Map map={hardCodedMapTemp} />
    </div>
  );
}
