<script>
	import { Toaster as Sonner } from "svelte-sonner";

	let { ...restProps } = $props();
</script>

<Sonner {...restProps} />
