import { ZombieSurvival } from "./games/ZombieSurvival";

const config = [
  [" ", " ", " ", " ", " ", " ", " ", "Z", " ", " "],
  [" ", " ", " ", "P", "B", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", "B", " ", " ", " ", " ", " "],
  ["R", "R", "R", "R", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " ", "Z", " "],
  [" ", " ", " ", " ", " ", " ", " ", "Z", " ", " "],
  [" ", " ", " ", " ", " ", " ", "Z", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
];

console.time("game");

const game = new ZombieSurvival(config);

while (!game.finished()) {
  game.step();

  console.log(
    game
      .getState()
      .map((it) => it.map((it2) => it2.replace(" ", "-")).join(" "))
      .join("\n"),
  );
  console.log();
}

console.timeEnd("game");
