// The prebuilt (precompiled) Expo modules crashed at launch on this project (missing
// React.framework), so React Native and the Expo modules are compiled from source. These keys
// live in the generated ios/Podfile.properties.json; setting them here keeps them on every prebuild.
const { withPodfileProperties } = require("expo/config-plugins");

module.exports = function withBuildFromSource(config) {
  return withPodfileProperties(config, (cfg) => {
    cfg.modResults.EXPO_USE_PRECOMPILED_MODULES = "false";
    cfg.modResults["ios.buildReactNativeFromSource"] = "true";
    return cfg;
  });
};
