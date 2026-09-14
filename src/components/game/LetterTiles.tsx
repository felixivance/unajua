"use client";

import { useEffect, useState } from "react";
import { buildLetterTiles, normalizeAnswer } from "@/lib/game/answer";

type LetterTilesProps = {
  answer: string;
  disabled?: boolean;
  onSubmit: (value: string) => void;
};

type Tile = { id: string; letter: string; used: boolean };

export function LetterTiles({ answer, disabled, onSubmit }: LetterTilesProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selected, setSelected] = useState<Tile[]>([]);
  const answerLength = normalizeAnswer(answer).replace(/ /g, "").length;

  useEffect(() => {
    const letters = buildLetterTiles(answer);
    setTiles(letters.map((letter, i) => ({ id: `${i}-${letter}`, letter, used: false })));
    setSelected([]);
  }, [answer]);

  function selectTile(tile: Tile) {
    if (disabled || tile.used || selected.length >= answerLength) return;
    setTiles((prev) => prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t)));
    setSelected((prev) => [...prev, tile]);
  }

  function removeLast() {
    if (disabled || selected.length === 0) return;
    const last = selected[selected.length - 1];
    setSelected((prev) => prev.slice(0, -1));
    setTiles((prev) => prev.map((t) => (t.id === last.id ? { ...t, used: false } : t)));
  }

  function submit() {
    if (disabled || selected.length !== answerLength) return;
    onSubmit(selected.map((t) => t.letter).join(""));
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: answerLength }).map((_, i) => {
          const tile = selected[i];
          return (
            <button
              key={i}
              onClick={removeLast}
              disabled={!tile || disabled}
              className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-emerald-600 bg-white text-xl font-bold text-emerald-900 disabled:opacity-100"
            >
              {tile?.letter ?? ""}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => selectTile(tile)}
            disabled={tile.used || disabled}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-xl font-bold text-white transition disabled:bg-emerald-200 disabled:text-emerald-400"
          >
            {tile.letter}
          </button>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={disabled || selected.length !== answerLength}
        className="rounded-full bg-red-600 px-10 py-3 text-lg font-bold text-white transition disabled:bg-gray-300"
      >
        Submit
      </button>
    </div>
  );
}
