<script>
  import { routes } from "$lib/ROUTES";
  const { children } = $props();
</script>

<div style="display: flex; gap: 1rem;">
  <div style=" border-right: 2px solid red; padding-right: 1rem;">
    <form action="?/logout" method="POST">
      <button type="submit">Deslogar</button>
    </form>
    {#each routes as route}
      <div>
        <a href={route}>{route}</a>
      </div>
    {/each}
  </div>

  <div>
    {@render children()}
  </div>
</div>
