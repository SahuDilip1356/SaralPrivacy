// Resolve hook: on a failed relative import, retry with ".ts" then "/index.ts"
// (bundler-style resolution for --experimental-strip-types). No transforms —
// resolution only.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    const relative = specifier.startsWith("./") || specifier.startsWith("../");
    // Only a real JS/TS/JSON extension counts as "already extensioned" —
    // dotted basenames like "./data.generated" must still get the ".ts" retry.
    if (!relative || /\.((m|c)?(j|t)sx?|json)$/i.test(specifier)) throw err;
    try {
      return await nextResolve(`${specifier}.ts`, context);
    } catch {
      return nextResolve(`${specifier}/index.ts`, context);
    }
  }
}
