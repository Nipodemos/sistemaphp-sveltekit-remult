<script>
  import Header from "$lib/components/Header.svelte";
  import MenuLateral from "$lib/components/MenuLateral.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { page } from "$app/state";
  const { children } = $props();

  let errorMessage = $derived(page.url.searchParams.get("error"));
  let tela = $derived(page.url.searchParams.get("tela"));
</script>

<!-- Header fixo no topo (fora do grid) -->
<Header />

<!-- Layout principal usando CSS Grid -->
<div
  class="h-screen w-full bg-surface-50-950 pt-16"
  style="display: grid; grid-template-columns: 320px auto;"
>
  <!-- Área de conteúdo com sidebar -->
  <MenuLateral />
  <div class="grid grid-rows-[auto_60px]">
    <!-- Menu lateral -->

    <!-- Área de conteúdo principal -->
    <main class="p-3 bg-surface-50-950 h-full overflow-y-auto">
      <!-- Card principal -->
      <div
        class="card p-3 preset-outlined-surface-200-800 bg-surface-50-950 shadow-xl h-full"
      >
        <div class="card-content overflow-y-auto">
          {#if errorMessage === "permissao_negada"}
            <div class="alert preset-filled-error mb-3">
              <p>Você não tem permissão para acessar a página de {tela}.</p>
            </div>
          {:else}
            {@render children()}
          {/if}
        </div>
      </div>
    </main>

    <Footer />
  </div>

  <!-- Footer na linha inferior do grid -->
</div>
