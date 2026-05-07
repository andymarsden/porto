<script>
  import { BarChart } from "layerchart";

  const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 213, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
  ];

  const chartProps = {
    bars: {
      radius: 6,
      strokeWidth: 0,
    },
    xAxis: {
      format: (value) => value.slice(0, 3),
    },
    yAxis: {
      format: "integer",
    },
  };
</script>

<div class="w-full max-w-xl rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
  <div class="mb-5 flex items-end justify-between gap-4">
    <div>
      <p class="text-sm font-medium text-muted-foreground">Example chart</p>
      <h3 class="text-lg font-semibold">Hello world bars</h3>
    </div>
    <p class="text-xs text-muted-foreground">Desktop sessions by month</p>
  </div>

  <div class="h-64 w-full" aria-label="Desktop sessions bar chart">
    <BarChart
      data={chartData}
      x="month"
      y="desktop"
      cRange={["var(--chart-1)"]}
      props={chartProps}
    />
  </div>
</div>