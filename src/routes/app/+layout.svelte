<script>
  import { routes } from "$lib/ROUTES";
  import { page } from "$app/stores";
  const { children } = $props();

  let errorMessage = $derived($page.url.searchParams.get("error"));
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
    {#if errorMessage === "permissao_negada"}
      <div
        style="color: red; border: 1px solid red; padding: 1rem; margin-bottom: 1rem;"
      >
        Você não tem permissão para acessar esta página.
      </div>
    {/if}
    {@render children()}
  </div>
</div>
