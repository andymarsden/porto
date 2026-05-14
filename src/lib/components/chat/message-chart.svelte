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
  import { renderAssistantMarkdown } from "$lib/utils/markdown.js";

  ChartJS.register(Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

  let { message } = $props();
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
  const renderedCommentary = $derived(renderAssistantMarkdown("**CWAC** showed the strongest overall growth during the reporting period, rising steadily from 55 to 159 and remaining the highest-volume client throughout most weeks.\n\n**SLAN** also demonstrated consistent upward performance, increasing from 42 to a peak of 115 before dipping slightly to 109 in the final week, suggesting growth may be beginning to stabilise.\n\n**SBOR** experienced the fastest relative growth, climbing rapidly from 1 to 91, particularly after mid-April, indicating a significant recent increase in activity.\n\n**GATE** remained comparatively low-volume but still showed gradual progression, increasing from 0 to 12 over the six-week period."));

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

<!-- <article class="text-foreground text-[15px] leading-7"> -->
  <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
    QRIOS Client Trends (Mar - Apr 2026)
  </p>

  <div class="border-border bg-muted/40 rounded-xl border p-4">
    <div class="h-64 w-full" aria-label="Client trend line chart">
      <Line {data} {options} />
    </div>
  </div>

  <!-- <div class="border-border/70 mt-3 rounded-xl border border-dashed p-4" aria-label="Chart commentary"> -->
    <p class="text-muted-foreground mb-2 text-[11px] font-medium uppercase tracking-wide">Commentary</p>
    <!-- {#if commentary} -->
      <div id="chart-commentary" class="assistant-markdown wrap-break-word text-foreground text-sm leading-6">
        {@html renderedCommentary}
      </div>
    <!-- {:else}
      <p id="chart-commentary" class="text-muted-foreground text-sm leading-6">No commentary yet.</p>
    {/if} -->
  <!-- </div> -->
<!-- </article> -->

<style>
  :global(.assistant-markdown h1),
  :global(.assistant-markdown h2),
  :global(.assistant-markdown h3),
  :global(.assistant-markdown h4),
  :global(.assistant-markdown h5),
  :global(.assistant-markdown h6) {
    margin: 0.75rem 0 0.5rem;
    font-weight: 650;
    line-height: 1.25;
  }

  :global(.assistant-markdown h1) {
    font-size: 1.5rem;
  }

  :global(.assistant-markdown h2) {
    font-size: 1.3rem;
  }

  :global(.assistant-markdown h3) {
    font-size: 1.15rem;
  }

  :global(.assistant-markdown p) {
    margin: 0.5rem 0;
  }

  :global(.assistant-markdown ul),
  :global(.assistant-markdown ol) {
    margin: 0.5rem 0;
    padding-left: 1.25rem;
  }

  :global(.assistant-markdown ul) {
    list-style: disc;
  }

  :global(.assistant-markdown ol) {
    list-style: decimal;
  }

  :global(.assistant-markdown code) {
    background: color-mix(in oklab, currentColor 10%, transparent);
    border-radius: 0.25rem;
    padding: 0.1rem 0.3rem;
  }

  :global(.assistant-markdown pre) {
    overflow-x: auto;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: color-mix(in oklab, currentColor 8%, transparent);
  }

  :global(.assistant-markdown a) {
    text-decoration: underline;
  }

  :global(.assistant-markdown table) {
    width: 100%;
    border-collapse: collapse;
    margin: 0.75rem 0;
    font-size: 0.875rem;
  }

  :global(.assistant-markdown th),
  :global(.assistant-markdown td) {
    padding: 0.45rem 0.75rem;
    border: 1px solid color-mix(in oklab, currentColor 18%, transparent);
    text-align: left;
  }

  :global(.assistant-markdown th) {
    font-weight: 600;
    background: color-mix(in oklab, currentColor 6%, transparent);
  }

  :global(.assistant-markdown tbody tr:nth-child(even)) {
    background: color-mix(in oklab, currentColor 3%, transparent);
  }

  :global(.assistant-markdown hr) {
    margin: 0.9rem 0;
    border: 0;
    border-top: 1px solid color-mix(in oklab, currentColor 28%, transparent);
  }

  :global(.assistant-markdown em),
  :global(.assistant-markdown i) {
    font-style: italic;
  }
</style>