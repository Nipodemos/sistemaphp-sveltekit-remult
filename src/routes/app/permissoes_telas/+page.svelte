<script lang="ts">
  import {
    permissoes,
    descricoesPermissoes,
    descricoesTelas,
    type TelaPermissao,
  } from "$lib/types/permissoes";
  import { goto } from "$app/navigation";

  // Gerar lista de telas a partir das chaves do objeto permissoes
  const telas = (Object.keys(permissoes) as TelaPermissao[]).map((id) => ({
    id,
    nome: id.charAt(0).toUpperCase() + id.slice(1), // Capitalizar primeira letra
    descricao: descricoesTelas[id] ?? "Descrição não encontrada",
  }));

  function editarPermissoesTela(tela: TelaPermissao) {
    goto(`/app/permissoes_telas/editar/${tela}`);
  }
</script>

<svelte:head>
  <title>Gerenciar Permissões por Tela</title>
</svelte:head>

<div class="container mx-auto p-6">
  <h1 class="text-3xl font-bold mb-6">Gerenciar Permissões por Tela</h1>

  <p class="text-gray-600 mb-8">
    Selecione uma tela para editar as permissões de todos os usuários de uma
    vez.
  </p>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each telas as tela}
      <div
        class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
      >
        <h2 class="text-xl font-semibold mb-2">{tela.nome}</h2>
        <p class="text-gray-600 mb-4">{tela.descricao}</p>

        <div class="mb-4">
          <h3 class="font-medium text-sm text-gray-700 mb-2">
            Permissões disponíveis:
          </h3>
          <ul class="text-sm text-gray-600 space-y-1">
            {#each permissoes[tela.id] as permissao (permissao)}
              <li class="flex items-center" data-permissao={permissao}>
                <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {(descricoesPermissoes[tela.id] as any)?.[permissao] ??
                  "Descrição não encontrada"}
              </li>
            {/each}
          </ul>
        </div>

        <button
          on:click={() => editarPermissoesTela(tela.id)}
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Editar Permissões
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
  }
</style>
