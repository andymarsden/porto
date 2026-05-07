<script>
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Button } from "$lib/components/ui/button";

</script>

<header
	class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex items-center gap-2 px-4">
		<Sidebar.Trigger class="-ms-1" />
		<Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item class="hidden md:block">
					<Breadcrumb.Link href="##">Build Your Application</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator class="hidden md:block" />
				<Breadcrumb.Item>
					<Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
</header>
<!-- <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="grid auto-rows-min gap-4 md:grid-cols-3">
		<div class="bg-muted/50 aspect-video rounded-xl"></div>
		<div class="bg-muted/50 aspect-video rounded-xl"></div>
		<div class="bg-muted/50 aspect-video rounded-xl"></div>
	</div>
	<div class="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min"></div>
</div> -->
<div class="flex flex-1 flex-col gap-4 px-4 py-10">
	<div class="bg-muted/50 mx-auto h-24 w-full max-w-3xl rounded-xl">
	


<!-- <button class="cool-btn">
  Launch
</button> -->
<div class="relative inline-flex rounded-md bg-[linear-gradient(135deg,#ff00aa,#ffea00,#ff00aa,#ffea00)] bg-[length:300%_300%] p-[2px] animate-gradient">
  <div class="absolute -inset-1.5 -z-10 rounded-md bg-[inherit] blur-xl opacity-50"></div>

  <Button class="rounded-sm bg-zinc-950 text-white hover:bg-zinc-900">
    Launch
  </Button>
</div>

<style>
  :global(.animate-gradient) {
    animation: gradientFlow 4s ease infinite;
  }

  @keyframes gradientFlow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
</style>


	</div>
	<div class="bg-muted/50 mx-auto h-full w-full max-w-3xl rounded-xl"></div>
</div>

<!-- <style>
  .cool-btn {
    position: relative;
    padding: 0.9rem 1.8rem;
    border: none;
    border-radius: 14px;
    background: #111;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    z-index: 0;
    overflow: hidden;
    transition: transform 0.2s ease;
  }

  .cool-btn:hover {
    transform: translateY(-2px) scale(1.02);
  }

  .cool-btn::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 16px;
    background: linear-gradient(
      135deg,
      #ff00aa,
      #ffea00,
      #ff00aa,
      #ffea00
    );
    background-size: 300% 300%;
    animation: borderFlow 4s ease infinite;
    z-index: -2;
  }

  .cool-btn::after {
    content: "";
    position: absolute;
    inset: 2px;
    border-radius: 12px;
    background: #111;
    z-index: -1;
  }

  @keyframes borderFlow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
</style> -->