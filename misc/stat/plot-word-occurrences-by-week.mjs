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
const outputPath = path.join(directory, "word-occurrences-by-week.svg");

main();

function main() {
  const { word, targetPath } = parseArguments(process.argv.slice(2));
  const points = collectWeeklyGitStatistics({
    projectRoot,
    targetPath,
    measure: (content) => countWordOccurrences(content, word),
  });
  const svg = renderWeeklyChart(points, {
    title: `${path.basename(targetPath)} — “${word}” occurrences`,
    description: `Case-insensitive whole-word occurrences of “${word}” at the last commit of each ISO week. Weeks without commits retain the previous value.`,
    valueLabel: "Occurrences",
  });

  fs.writeFileSync(outputPath, svg);
  console.log(`Saved ${path.relative(projectRoot, outputPath)}`);
}

function parseArguments(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    console.log(`Usage: node misc/plot-word-occurrences-by-week.mjs <word> [file]

The first argument is the whole word to count. The optional second argument is the file whose Git history is analysed. The chart is saved to ${path.relative(projectRoot, outputPath)}.`);
    process.exit(0);
  }

  if (args.length === 1 || args.length === 2) {
    const [word, filePath = defaultTargetPath] = args;
    if (word.trim() === "") {
      throw new Error("The word to count cannot be empty.");
    }

    return {
      word,
      targetPath:
        filePath === defaultTargetPath
          ? defaultTargetPath
          : resolveRepositoryPath(projectRoot, filePath),
    };
  }

  throw new Error(
    "Expected a word and optionally one file path. Use --help for details.",
  );
}

function countWordOccurrences(text, word) {
  const target = word.toLocaleLowerCase();
  const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
  let count = 0;

  for (const segment of segmenter.segment(text)) {
    if (segment.isWordLike && segment.segment.toLocaleLowerCase() === target) {
      count += 1;
    }
  }

  return count;
}
