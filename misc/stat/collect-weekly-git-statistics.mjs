import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * @param {{ projectRoot: string, targetPath: string, measure: (content: string) => number }} options
 */
export function collectWeeklyGitStatistics({
  projectRoot,
  targetPath,
  measure,
}) {
  const history = runGit(projectRoot, [
    "log",
    "--format=%H%x00%ct%x00%cI",
    "--date-order",
    "HEAD",
    "--",
    targetPath,
  ]);
  const latestCommitByWeek = new Map();

  for (const entry of history.trim().split("\n")) {
    if (!entry) {
      continue;
    }

    const [commit, committedAtUnix, committedAt] = entry.split("\0");
    const week = getIsoWeek(committedAt);
    const knownCommit = latestCommitByWeek.get(week);
    if (!knownCommit || Number(committedAtUnix) > knownCommit.committedAtUnix) {
      latestCommitByWeek.set(week, {
        commit,
        committedAtUnix: Number(committedAtUnix),
      });
    }
  }

  if (latestCommitByWeek.size === 0) {
    throw new Error(`No Git history found for ${targetPath}.`);
  }

  const weeks = [...latestCommitByWeek.keys()].sort();
  const lastWeek = getIsoWeekStart(weeks.at(-1));
  let weekStart = getIsoWeekStart(weeks[0]);
  let value = 0;
  const points = [];

  while (weekStart <= lastWeek) {
    const week = formatIsoWeek(weekStart);
    const latestCommit = latestCommitByWeek.get(week);
    if (latestCommit) {
      value = measure(
        runGit(projectRoot, ["show", `${latestCommit.commit}:${targetPath}`]),
      );
    }

    points.push({
      weekStart: formatDate(weekStart),
      value,
    });
    weekStart = new Date(weekStart);
    weekStart.setUTCDate(weekStart.getUTCDate() + 7);
  }

  return points;
}

export function resolveRepositoryPath(projectRoot, filePath) {
  const absolutePath = path.resolve(projectRoot, filePath);
  const relativePath = path.relative(projectRoot, absolutePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("The analysed file must be inside the repository.");
  }

  return relativePath.split(path.sep).join("/");
}

function getIsoWeek(committedAt) {
  const localDate = new Date(`${committedAt.slice(0, 10)}T00:00:00Z`);
  return formatIsoWeek(localDate);
}

function formatIsoWeek(date) {
  const thursday = new Date(date);
  const weekday = thursday.getUTCDay() || 7;
  thursday.setUTCDate(thursday.getUTCDate() + 4 - weekday);
  const isoYear = thursday.getUTCFullYear();
  const firstDayOfYear = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(
    (thursday - firstDayOfYear + 86_400_000) / 604_800_000,
  );
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

function getIsoWeekStart(week) {
  const [year, weekNumber] = week
    .match(/^(\d{4})-W(\d{2})$/)
    .slice(1)
    .map(Number);
  const fourthJanuary = new Date(Date.UTC(year, 0, 4));
  const weekday = fourthJanuary.getUTCDay() || 7;
  fourthJanuary.setUTCDate(
    fourthJanuary.getUTCDate() - weekday + 1 + (weekNumber - 1) * 7,
  );
  return fourthJanuary;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function runGit(projectRoot, args) {
  try {
    return execFileSync("git", args, {
      cwd: projectRoot,
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const details = error.stderr?.toString().trim();
    throw new Error(details || `Could not run git ${args[0]}.`);
  }
}
