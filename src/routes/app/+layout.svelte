<script>
  import { routes } from "$lib/ROUTES";
  const { children } = $props();
</script>

oi
<form action="?/logout" method="POST">
  <button type="submit">Deslogar</button>
</form>
{#each routes as route}
  <div>
    <a href={route}>{route}</a>
  </div>
{/each}

{@render children()}
