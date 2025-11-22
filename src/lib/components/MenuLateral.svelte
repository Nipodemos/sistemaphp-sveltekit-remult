<script lang="ts">
  import { remult } from "remult";
  import { Tela } from "$shared/tela/tela.model";
  import { verificarPermissao } from "$lib/types/permissoes";
  import { Accordion } from "@skeletonlabs/skeleton-svelte";

  let telas = $state<Tela[]>([]);
  let loading = $state(true);

  let telasAgrupadas = $derived(() => {
    const map = new Map<string, Tela[]>();
    for (const tela of telas) {
      if (tela.permissao) {
        const [entidade, regra] = tela.permissao.split(".");
        if (
          !verificarPermissao(remult.user?.permissoesCompletas, entidade, regra)
        ) {
          continue;
        }
      }

      if (!map.has(tela.categoria)) {
        map.set(tela.categoria, []);
      }
      map.get(tela.categoria)!.push(tela);
    }
    return map;
  });

  $effect(() => {
    remult
      .repo(Tela)
      .find()
      .then((result) => {
        telas = result;
        loading = false;
      })
      .catch((err) => {
        console.error("Erro ao carregar telas:", err);
        loading = false;
      });
  });
</script>

<div
  class="menu-lateral h-full w-80 border-r border-surface-200-800 bg-surface-50-950 overflow-hidden"
>
  <!-- Menu com scroll interno -->
  <div class="h-full overflow-y-auto p-4">
    {#if loading}
      <p>Carregando menu...</p>
    {:else}
      <Accordion>
        {#each Array.from(telasAgrupadas().entries()) as [categoria, telasCategoria]}
          <Accordion.Item value={categoria}>
            <Accordion.ItemTrigger>{categoria}</Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <ul class="space-y-2">
                {#each telasCategoria as tela}
                  <li>
                    <a href={tela.caminhoUrl} class="anchor">{tela.nome}</a>
                  </li>
                {/each}
              </ul>
            </Accordion.ItemContent>
          </Accordion.Item>
        {/each}
      </Accordion>
    {/if}
  </div>
</div>
