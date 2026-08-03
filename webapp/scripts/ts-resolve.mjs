// Registers a resolver hook so `node --experimental-strip-types` can follow
// the repo's bundler-style imports ("../sectors", "./recruitment") when chat
// build/tests import app modules like the data-flow pack registry.
// Usage: node --import ./scripts/ts-resolve.mjs --experimental-strip-types <file>
import { register } from "node:module";

register("./ts-resolve-hooks.mjs", import.meta.url);
