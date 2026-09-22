/**
 * @param {{ weekStart: string, value: number }[]} points
 * @param {{ title: string, description: string, valueLabel: string }} options
 */
export function renderWeeklyChart(points, { title, description, valueLabel }) {
  const width = 1000;
  const height = 640;
  const margin = { top: 110, right: 55, bottom: 95, left: 105 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const maximum = Math.max(...points.map((point) => point.value));
  const yMaximum = roundUp(maximum, 5);
  const xFor = (index) =>
    points.length === 1
      ? margin.left + chartWidth / 2
      : margin.left + (index * chartWidth) / (points.length - 1);
  const yFor = (value) =>
    margin.top + chartHeight - (value / yMaximum) * chartHeight;
  const ticks = Array.from({ length: 6 }, (_, index) => (yMaximum * index) / 5);
  const coordinates = points.map((point, index) => ({
    ...point,
    x: xFor(index),
    y: yFor(point.value),
  }));
  const number = new Intl.NumberFormat("ru-RU");
  const grid = ticks
    .map((value) => {
      const y = yFor(value);
      return `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" class="grid" />
        <text x="${margin.left - 14}" y="${y + 5}" class="axis-label" text-anchor="end">${number.format(value)}</text>`;
    })
    .join("\n        ");
  const monthMarkers = coordinates.filter(
    (point, index) =>
      index === 0 ||
      point.weekStart.slice(0, 7) !==
        coordinates[index - 1].weekStart.slice(0, 7),
  );
  const months = monthMarkers
    .map(
      (point) =>
        `<line x1="${point.x}" y1="${margin.top}" x2="${point.x}" y2="${height - margin.bottom}" class="month-grid" />`,
    )
    .join("\n        ");
  const yearMarkers = coordinates.filter(
    (point, index) =>
      index === 0 ||
      point.weekStart.slice(0, 4) !==
        coordinates[index - 1].weekStart.slice(0, 4),
  );
  const years = yearMarkers
    .map(
      (
        point,
      ) => `<line x1="${point.x}" y1="${margin.top}" x2="${point.x}" y2="${height - margin.bottom}" class="year-grid" />
        <text x="${point.x}" y="${height - margin.bottom + 33}" class="axis-label" text-anchor="middle">${point.weekStart.slice(0, 4)}</text>`,
    )
    .join("\n        ");
  const lastPoint = coordinates.at(-1);
  const polyline = coordinates
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
    <title id="title">${escapeXml(title)}</title>
    <desc id="description">${escapeXml(description)}</desc>
    <style>
        .background { fill: #ffffff; }
        .grid { stroke: #dce3ea; stroke-width: 1; }
        .month-grid { stroke: #edf1f5; stroke-width: 1; }
        .year-grid { stroke: #c4ccd5; stroke-width: 1; stroke-dasharray: 4 4; }
        .axis { stroke: #8c99a5; stroke-width: 1.25; }
        .line { fill: none; stroke: #0969da; stroke-width: 4; stroke-linejoin: round; stroke-linecap: round; }
        .point { fill: #ffffff; stroke: #0969da; stroke-width: 4; }
        .title { font: 700 28px system-ui, sans-serif; fill: #1f2328; }
        .axis-label { font: 15px system-ui, sans-serif; fill: #57606a; }
        .value-label { font: 700 15px system-ui, sans-serif; fill: #1f2328; }
    </style>
    <rect width="100%" height="100%" class="background" />
    <text x="${margin.left}" y="55" class="title">${escapeXml(title)}</text>
    <g>
        ${grid}
        <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" class="axis" />
        <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="axis" />
        ${months}
        ${years}
        <polyline points="${polyline}" class="line" />
        <circle cx="${lastPoint.x}" cy="${lastPoint.y}" r="6" class="point" />
        <text x="${lastPoint.x}" y="${lastPoint.y - 14}" class="value-label" text-anchor="middle">${number.format(lastPoint.value)}</text>
        <text x="${margin.left}" y="${margin.top - 20}" class="axis-label">${escapeXml(valueLabel)}</text>
    </g>
</svg>
`;
}

function escapeXml(value) {
  return value.replace(/[<>&'\"]/g, (character) => {
    return {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    }[character];
  });
}

function roundUp(value, steps) {
  if (value <= 0) {
    return steps;
  }

  const minimumStep = value / steps;
  const magnitude = 10 ** Math.floor(Math.log10(minimumStep));
  const normalizedStep = minimumStep / magnitude;
  const niceNormalizedStep = [1, 2, 5, 10].find(
    (step) => step >= normalizedStep,
  );
  return niceNormalizedStep * magnitude * steps;
}
