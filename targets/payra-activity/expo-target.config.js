/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: "widget",
  name: "PayraActivity",
  displayName: "Payra",
  deploymentTarget: "16.4",
  frameworks: ["SwiftUI", "WidgetKit", "ActivityKit"],
  images: { payraMark: "./payra-mark.png" },
  colors: { brand: "#ECF0AF", brandDark: "#0B4647", success: "#22C55E" },
};
