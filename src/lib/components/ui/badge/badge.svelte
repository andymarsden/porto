<script module>
	import { cn } from "$lib/utils.js";
	import { tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide uppercase whitespace-nowrap",
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground border-transparent",
				secondary: "bg-secondary text-secondary-foreground border-transparent",
				outline: "text-foreground border-border"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	});
</script>

<script>
	let {
		ref = $bindable(null),
		class: className,
		variant = "default",
		children,
		...restProps
	} = $props();
</script>

<span
	bind:this={ref}
	data-slot="badge"
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</span>
