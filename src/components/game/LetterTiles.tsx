"use client";

import { useState } from "react";

type LetterTilesProps = {
  letters: string[];
  answerLength: number;
  disabled?: boolean;
  onSubmit: (value: string) => void | Promise<void>;
};

type Tile = { id: string; letter: string; used: boolean };

export function LetterTiles({ letters, answerLength, disabled, onSubmit }: LetterTilesProps) {
  const [tiles, setTiles] = useState<Tile[]>(() =>
    letters.map((letter, i) => ({ id: `${i}-${letter}`, letter, used: false }))
  );
  const [selected, setSelected] = useState<Tile[]>([]);

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
    void onSubmit(selected.map((t) => t.letter).join(""));
  }

  return (
    <div className="flex w-full flex-col items-center gap-7">
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: answerLength }).map((_, i) => {
          const tile = selected[i];
          return (
            <button
              key={i}
              type="button"
              onClick={removeLast}
              disabled={!tile || disabled}
              className={`grid h-12 w-12 place-items-center rounded-lg border-2 text-xl font-extrabold transition-[transform,background-color,border-color] duration-150 [touch-action:manipulation] ${
                tile
                  ? "game-tile-in border-emerald-700 bg-white text-emerald-900"
                  : "border-stone-300 bg-stone-100 text-stone-400"
              }`}
            >
              {tile?.letter ?? ""}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {tiles.map((tile, i) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => selectTile(tile)}
            disabled={tile.used || disabled}
            style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
            className="game-tile-in grid h-12 w-12 place-items-center rounded-lg bg-emerald-700 text-xl font-extrabold text-white shadow-[0_4px_0_#065f46] [touch-action:manipulation] transition-transform duration-150 active:translate-y-0.5 active:shadow-none disabled:translate-y-0 disabled:bg-emerald-100 disabled:text-emerald-800 disabled:shadow-none"
          >
            {tile.letter}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={disabled || selected.length !== answerLength}
        className="min-h-14 rounded-full bg-red-600 px-12 text-lg font-bold text-white shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:bg-red-500 active:scale-[0.98] disabled:bg-red-50 disabled:text-red-900 disabled:shadow-none"
      >
        {disabled ? "Checking…" : "Submit"}
      </button>
    </div>
  );
}
