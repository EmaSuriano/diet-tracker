import { atom } from "nanostores";

// https://docs.astro.build/en/recipes/sharing-state-islands/
export const searchAtom = atom("");
export const categoryAtom = atom<string[]>([]);
export const severityAtom = atom<string[]>([]);
