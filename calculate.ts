import { mean, median, variance, quantile } from "simple-statistics";

function d6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

interface CombatResult {
  side1HitsSuffered: number;
  side2HitsSuffered: number;
}

interface GeneratesCombatResult {
  fight1v1: () => CombatResult;
  fight3v3: () => CombatResult;
  fight5v5: () => CombatResult;
  fight10v10: () => CombatResult;
}

class V1Combat {}

class V1Combat {}
