/**
 * DGEM Design System – standalone CSS build.
 *
 * Bundles src/index.css (tokens + typography + components + utilities) into a
 * single, minified dist/dgem.css for non-Tailwind consumers.
 *
 * The component styles in components.css are wrapped in `@layer components`
 * so that, in a Tailwind project, utility classes can override them. For the
 * standalone bundle we flatten that layer back to plain CSS so the stylesheet
 * behaves predictably when loaded on its own (native cascade layers would
 * otherwise sit below a consumer's unlayered styles).
 */
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const atImport = require("postcss-import");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

/** Unwrap `@layer <name> { … }` blocks, hoisting their children. */
const flattenLayers = () => ({
  postcssPlugin: "dgem-flatten-layers",
  Once(root) {
    root.walkAtRules("layer", (atRule) => {
      atRule.replaceWith(atRule.nodes || []);
    });
  },
});
flattenLayers.postcss = true;

const inputPath = path.join(__dirname, "..", "src", "index.css");
const outputPath = path.join(__dirname, "..", "dist", "dgem.css");
const srcDir = path.join(__dirname, "..", "src");

function build() {
  const css = fs.readFileSync(inputPath, "utf8");
  return postcss([
    atImport(),
    flattenLayers(),
    autoprefixer(),
    cssnano({ preset: "default" }),
  ])
    .process(css, { from: inputPath, to: outputPath })
    .then((result) => {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, result.css);
      console.log(`Built ${path.relative(process.cwd(), outputPath)} (${result.css.length} bytes)`);
    })
    .catch((error) => {
      console.error(error.message);
      if (!process.argv.includes("--watch")) process.exit(1);
    });
}

build();

if (process.argv.includes("--watch")) {
  console.log("Watching src/ for changes…");
  let timer = null;
  fs.watch(srcDir, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 100);
  });
}
