<script>
  import embed from "vega-embed";
  import { onMount } from "svelte";

  const exampleSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "description": "A simple bar chart with embedded data.",
  "data": {
    "values": [
      {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
      {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
      {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
    ]
  },
  "mark": "line",
  "encoding": {
    "x": {"field": "a", "type": "nominal", "axis": {"labelAngle": 0}},
    "y": {"field": "b", "type": "quantitative"}
  }
};

  let { spec = exampleSpec } = $props();

  let chartContainer;

  async function renderChart() {
    if (!chartContainer || !spec) return;

    await embed(chartContainer, spec, {
      actions: false
    });
  }

  onMount(renderChart);

  $effect(() => {
    if (spec) {
      renderChart();
    }
  });
</script>

<div bind:this={chartContainer}></div>