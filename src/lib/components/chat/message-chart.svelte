<script>
  import { onMount } from "svelte";
  import { Line } from "svelte-chartjs";
  import {
    Chart as ChartJS,
    Tooltip,
    Legend,
    Filler,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
  } from "chart.js";
  import { THEME_EVENT } from "$lib/services/theme.js";

  ChartJS.register(Tooltip, Legend, Filler, LineElement, PointElement, LinearScale, CategoryScale);

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const points = [18, 21, 19, 24, 22, 26, 23];

  let data = $state({
    labels,
    datasets: [
      {
        label: "Activity",
        data: points,
        borderColor: "#666",
        backgroundColor: "rgba(120, 120, 120, 0.2)",
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 3,
        pointBorderWidth: 0,
      },
    ],
  });

  let options = $state({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0 } },
      y: { grid: { drawTicks: false }, ticks: { maxTicksLimit: 4 } },
    },
  });

  function getTokenValue(name, fallback) {
    if (typeof window === "undefined") return fallback;

    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function applyThemeColors() {
    const lineColor = getTokenValue("--chart-blue", "oklch(0.556 0 0)");
    const fillColor = getTokenValue("--color-chart-1", "oklch(0.87 0 0)");
    const tickColor = getTokenValue("--color-muted-foreground", "oklch(0.556 0 0)");
    const gridColor = getTokenValue("--color-border", "oklch(0.922 0 0)");

    data = {
      labels,
      datasets: [
        {
          label: "Activity",
          data: points,
          borderColor: lineColor,
          backgroundColor: `color-mix(in oklab, ${fillColor} 30%, transparent)`,
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 3,
          pointBackgroundColor: lineColor,
          pointBorderWidth: 0,
        },
      ],
    };

    options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          displayColors: false,
          backgroundColor: getTokenValue("--color-card", "oklch(1 0 0)"),
          titleColor: getTokenValue("--color-foreground", "oklch(0.145 0 0)"),
          bodyColor: getTokenValue("--color-foreground", "oklch(0.145 0 0)"),
          borderColor: gridColor,
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: tickColor, maxRotation: 0, font: { size: 10 } },
          border: { display: false },
        },
        y: {
          grid: { color: gridColor, drawTicks: false },
          ticks: { color: tickColor, maxTicksLimit: 4, font: { size: 10 } },
          border: { display: false },
        },
      },
    };
  }

  onMount(() => {
    applyThemeColors();

    const handleThemeChange = () => applyThemeColors();
    window.addEventListener(THEME_EVENT, handleThemeChange);

    return () => {
      window.removeEventListener(THEME_EVENT, handleThemeChange);
    };
  });
</script>

<article class="text-foreground text-[15px] leading-7">
  <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Trend</p>
  <div class="border-border bg-muted/40 rounded-xl border p-4">
    <div class="h-32 w-full" aria-label="Activity line chart">
      <Line {data} {options} />
    </div>
  </div>
</article>