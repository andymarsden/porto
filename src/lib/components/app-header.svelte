<script>
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";

    let {
        crumbs = [],
        currentPage,
        showSidebarTrigger = true
    } = $props();
</script>

<header
    class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
    <div class="flex items-center gap-2 px-4">
        {#if showSidebarTrigger}
            <Sidebar.Trigger class="-ms-1" />
        {/if}
        <Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb.Root>
            <Breadcrumb.List>
                {#each crumbs as crumb}
                    <Breadcrumb.Item class="hidden md:block">
                        {#if crumb.href}
                            <Breadcrumb.Link href={crumb.href}>{crumb.label}</Breadcrumb.Link>
                        {:else}
                            {crumb.label}
                        {/if}
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator class="hidden md:block" />
                {/each}
                <Breadcrumb.Item>
                    <Breadcrumb.Page>{currentPage}</Breadcrumb.Page>
                </Breadcrumb.Item>
            </Breadcrumb.List>
        </Breadcrumb.Root>
        
    </div>
</header>