import type { ModuleDefinition } from "./types";

const modules: ModuleDefinition[] = [];

export function registerModules(defs: ModuleDefinition[]) {
  modules.push(...defs);
}

export function getRegisteredModules(): readonly ModuleDefinition[] {
  return modules;
}
