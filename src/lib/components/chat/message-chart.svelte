<script>
  import { onMount } from "svelte";
  import { Line } from "svelte-chartjs";
  import {
    Chart as ChartJS,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
  } from "chart.js";
  import { THEME_EVENT } from "$lib/services/theme.js";

  ChartJS.register(Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

  let { message } = $props();

  message = "Client trend data for the last 6 weeks"; // Placeholder until we have real API data
  const labels = ["02/04", "09/04", "16/04", "23/04", "30/04", "07/05"];

  const clientData = {
    SLAN: [42, 60, 72, 99, 115, 109],
    CWAC: [55, 91, 100, 131, 149, 159],
    GATE: [0, 0, 2, 6, 14, 12],
    SBOR: [1, 9, 22, 41, 60, 91],
  };

  let data = $state({ labels, datasets: [] });
  let options = $state({});
  const commentary = $derived(String(message?.card?.commentary ?? message?.content ?? "").trim());

  function getTokenValue(name, fallback) {
    if (typeof window === "undefined") return fallback;

    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();

    return value || fallback;
  }

  function applyThemeColors() {
    const tickColor = getTokenValue("--color-muted-foreground", "oklch(0.556 0 0)");
    const gridColor = getTokenValue("--color-border", "oklch(0.922 0 0)");

const colors = [
  getTokenValue("--color-blue", "oklch(0.646 0.222 41.116)"),
  getTokenValue("--color-green", "oklch(0.6 0.118 184.704)"),
  getTokenValue("--color-red", "oklch(0.398 0.07 227.392)"),
  getTokenValue("--color-yellow", "oklch(0.828 0.189 84.429)"),
];

    data = {
      labels,
      datasets: Object.entries(clientData).map(([label, values], index) => ({
        label,
        data: values,
        borderColor: colors[index],
        backgroundColor: colors[index],
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 3,
        pointBackgroundColor: colors[index],
        pointBorderWidth: 0,
      })),
    };

    options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: tickColor,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            font: { size: 10 },
          },
        },
        tooltip: {
          enabled: true,
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
          ticks: {
            color: tickColor,
            maxRotation: 0,
            font: { size: 10 },
          },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor,
            drawTicks: false,
          },
          ticks: {
            color: tickColor,
            maxTicksLimit: 4,
            font: { size: 10 },
          },
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
  <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
    Client Trend
  </p>

  <div class="border-border bg-muted/40 rounded-xl border p-4">
    <div class="h-64 w-full" aria-label="Client trend line chart">
      <Line {data} {options} />
    </div>
  </div>

  <div class="border-border/70 mt-3 rounded-xl border border-dashed p-4" aria-label="Chart commentary">
    <p class="text-muted-foreground mb-2 text-[11px] font-medium uppercase tracking-wide">Commentary</p>
    <p id="chart-commentary" class="text-foreground text-sm leading-6">

CWAC showed the strongest overall growth during the reporting period, rising steadily from 55 to 159 and remaining the highest-volume client throughout most weeks.

SLAN also demonstrated consistent upward performance, increasing from 42 to a peak of 115 before dipping slightly to 109 in the final week, suggesting growth may be beginning to stabilise.

SBOR experienced the fastest relative growth, climbing rapidly from 1 to 91, particularly after mid-April, indicating a significant recent increase in activity.

GATE remained comparatively low-volume but still showed gradual progression, increasing from 0 to 12 over the six-week period.

    </p>
    <!-- {#if commentary}
      <p class="text-foreground text-sm leading-6">{commentary}</p>
    {:else}
      <p class="text-muted-foreground text-sm leading-6">No commentary yet.</p>
    {/if} -->
  </div>
</article>