// Test-only ESM resolve hook: lets `node --test` resolve the app's extensionless
// relative imports (Next/bundler convention) by appending `.ts`. Used solely via
// `node --test --import ./tools/register-ts-resolver.mjs`. Next never loads this.
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[mc]?[jt]sx?$/.test(specifier)) {
      try {
        return nextResolve(specifier + ".ts", context);
      } catch {
        // fall through to default resolution
      }
    }
    return nextResolve(specifier, context);
  },
});
