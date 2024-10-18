import React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react";
import { ZombieSurvival } from "@/simulators/zombie-survival";
import { cn } from "@/lib/utils";

export function MapBuilder({
  disabled,
  onChange,
  play,
  value,
}: {
  disabled?: boolean;
  onChange: (value: string[][]) => unknown;
  play?: boolean;
  value: string[][];
}) {
  const map = ZombieSurvival.mapIsEmpty(value) ? [[" "]] : value;

  React.useEffect(() => {
    if (ZombieSurvival.mapIsEmpty(value)) {
      onChange([[" "]]);
    }
  }, [value]);

  function handleClickCell(row: number, cell: number) {
    const initialValue = map[row][cell];
    let newValue;

    if (play) {
      if (initialValue === "R" || initialValue === "Z") {
        alert("You can't replace zombie or rock in play mode");
        return;
      }

      newValue = initialValue === " " ? "P" : initialValue === "P" ? "B" : " ";
    } else {
      newValue = initialValue === " " ? "Z" : initialValue === "Z" ? "R" : " ";
    }

    const newMap = ZombieSurvival.cloneMap(map);
    newMap[row][cell] = newValue;
    onChange(newMap);
  }

  function handleIncreaseDown() {
    onChange([...map.map((row) => [...row]), [...map[0].map(() => " ")]]);
  }

  function handleDecreaseDown() {
    onChange([...map.slice(0, -1).map((row) => [...row])]);
  }

  function handleIncreaseLeft() {
    onChange(map.map((row) => [" ", ...row]));
  }

  function handleDecreaseLeft() {
    onChange(map.map((row) => [...row.slice(1)]));
  }

  function handleIncreaseRight() {
    onChange(map.map((row) => [...row, " "]));
  }

  function handleDecreaseRight() {
    onChange(map.map((row) => [...row.slice(0, -1)]));
  }

  function handleIncreaseUp() {
    onChange([[...map[0].map(() => " ")], ...map.map((row) => [...row])]);
  }

  function handleDecreaseUp() {
    onChange([...map.slice(1).map((row) => [...row])]);
  }

  const moreThanOneRow = map.length > 1;
  const moreThanOneCell = map[0].length > 1;

  const buttonClassName = cn(
    "border border-white w-[64px] h-[64px] disabled:opacity-50",
  );

  const controlClassName = cn(
    "h-8 absolute enabled:hover:scale-125 transition disabled:opacity-50",
  );

  return (
    <div className="relative inline-flex flex-col p-7 w-fit">
      {!play && (
        <>
          <button
            className={cn(
              controlClassName,
              "top-0 left-1/2 translate-x-[-100%]",
            )}
            disabled={disabled}
            type="button"
            onClick={handleIncreaseUp}
          >
            <ChevronUpIcon />
          </button>
          {moreThanOneRow && (
            <button
              className={cn(controlClassName, "top-0 left-1/2")}
              disabled={disabled}
              type="button"
              onClick={handleDecreaseUp}
            >
              <ChevronDownIcon />
            </button>
          )}
          <button
            className={cn(
              controlClassName,
              "top-1/2 left-0 translate-y-[-100%]",
            )}
            disabled={disabled}
            type="button"
            onClick={handleIncreaseLeft}
          >
            <ChevronLeftIcon />
          </button>
          {moreThanOneCell && (
            <button
              className={cn(controlClassName, "top-1/2 left-0")}
              disabled={disabled}
              type="button"
              onClick={handleDecreaseLeft}
            >
              <ChevronRightIcon />
            </button>
          )}
          <button
            className={cn(
              controlClassName,
              "bottom-0 left-1/2 translate-x-[-100%]",
            )}
            disabled={disabled}
            type="button"
            onClick={handleIncreaseDown}
          >
            <ChevronDownIcon />
          </button>
          {moreThanOneRow && (
            <button
              className={cn(controlClassName, "bottom-0 left-1/2")}
              disabled={disabled}
              type="button"
              onClick={handleDecreaseDown}
            >
              <ChevronUpIcon />
            </button>
          )}
          <button
            className={cn(
              controlClassName,
              "top-1/2 right-0 translate-y-[-100%]",
            )}
            disabled={disabled}
            type="button"
            onClick={handleIncreaseRight}
          >
            <ChevronRightIcon />
          </button>
          {moreThanOneCell && (
            <button
              className={cn(controlClassName, "top-1/2 right-0")}
              disabled={disabled}
              type="button"
              onClick={handleDecreaseRight}
            >
              <ChevronLeftIcon />
            </button>
          )}
        </>
      )}
      {map.map((row, rowIdx) => (
        <div key={rowIdx} className="inline-flex">
          {row.map((cell, cellIdx) => (
            <button
              className={buttonClassName}
              disabled={disabled === true}
              key={`${rowIdx}.${cellIdx}`}
              onClick={() => handleClickCell(rowIdx, cellIdx)}
              type="button"
            >
              {cell}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
