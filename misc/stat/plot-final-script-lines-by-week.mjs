#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  collectWeeklyGitStatistics,
  resolveRepositoryPath,
} from "./collect-weekly-git-statistics.mjs";
import { renderWeeklyChart } from "./render-weekly-chart.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(directory, "../..");
const defaultTargetPath = "better-osm-org.user.js";
const outputPath = path.join(directory, "final-script-lines-by-week.svg");

main();

function main() {
  const targetPath = parseArguments(process.argv.slice(2));
  const points = collectWeeklyGitStatistics({
    projectRoot,
    targetPath,
    measure: countLines,
  });
  const svg = renderWeeklyChart(points, {
    title: `${path.basename(targetPath)} — lines of code`,
    description:
      "Line count at the last commit of each ISO week. Weeks without commits retain the previous value.",
    valueLabel: "Lines of code",
  });

  fs.writeFileSync(outputPath, svg);
  console.log(`Saved ${path.relative(projectRoot, outputPath)}`);
}

function parseArguments(args) {
  if (args.length === 0) {
    return defaultTargetPath;
  }

  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    console.log(`Usage: node misc/plot-final-script-lines-by-week.mjs [file]

The optional argument is the file whose Git history is analysed. The chart is saved to ${path.relative(projectRoot, outputPath)}.`);
    process.exit(0);
  }

  if (args.length === 1) {
    return resolveRepositoryPath(projectRoot, args[0]);
  }

  throw new Error(
    "Expected no arguments or one file path. Use --help for details.",
  );
}

function countLines(text) {
  if (text === "") {
    return 0;
  }

  return text.split("\n").length - Number(text.endsWith("\n"));
}
