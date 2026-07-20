import dgemPresetModule from "../package/tailwind.config.js";

console.log("DGEM PRESET =", dgemPresetModule);

const dgemPreset = dgemPresetModule.default || dgemPresetModule;

export default {
  presets: [dgemPreset],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../package/src/**/*.{js,jsx,ts,tsx}",
  ],
};
