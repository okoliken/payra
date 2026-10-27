const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// @okoli/ui is linked from ~/Desktop/okoli-ui. Watch its source, and resolve its own imports
// (react, reanimated, unistyles…) from this app's node_modules so there is one copy of each.
const kit = path.resolve(__dirname, "../okoli-ui/packages/ui");
config.watchFolders = [kit];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const fromKit = context.originModulePath.startsWith(kit) && !moduleName.startsWith(".");
  const origin = fromKit ? path.join(__dirname, "index.ts") : context.originModulePath;
  return context.resolveRequest({ ...context, originModulePath: origin }, moduleName, platform);
};

module.exports = config;
