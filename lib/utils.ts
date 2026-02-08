import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateBattleId() {
  return `bat_${nanoid(12)}`;
}

export function generateRoastId() {
  return `rst_${nanoid(12)}`;
}

export function generateFighterId() {
  return `ftr_${nanoid(12)}`;
}

export function generateFighterApiKey() {
  return `roastbots_sk_${nanoid(32)}`;
}
