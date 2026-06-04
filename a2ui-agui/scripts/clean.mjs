import { rm } from "node:fs/promises";
import { resolve, sep } from "node:path";

const workspace = resolve(".");
const target = resolve("dist");

if (!target.startsWith(`${workspace}${sep}`)) {
  throw new Error(`Refusing to clean outside workspace: ${target}`);
}

await rm(target, { recursive: true, force: true });
