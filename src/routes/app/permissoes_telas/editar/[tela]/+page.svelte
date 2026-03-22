<script lang="ts">
  import { goto } from "$app/navigation";
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";
  import type { MetadadoPermissao } from "$lib/types/permissoes";

  export let data: {
    tela: string;
    nomeTela: string;
    usuarios: Array<{
      id: string;
      nome: string;
      login: string;
      isAdmin: boolean;
      permissoes: Record<string, boolean>;
    }>;
    permissoesDisponiveis: MetadadoPermissao[];
  };

  export let form: ActionData;

  let usuariosModificados = new Set<string>();
  let salvando = false;
  let erroLocal = "";

  // Função para marcar/desmarcar todas as permissões de uma coluna
  function toggleColuna(permissao: string) {
    const algumMarcado = data.usuarios
      .filter((u) => !u.isAdmin)
      .some(
      (u) => u.permissoes[permissao],
    );

    data.usuarios.filter((u) => !u.isAdmin).forEach((usuario) => {
      usuario.permissoes[permissao] = !algumMarcado;
      usuariosModificados.add(usuario.id);
    });
  }

  // Função para marcar/desmarcar todas as permissões de uma linha (usuário)
  function toggleLinha(usuarioId: string) {
    const usuario = data.usuarios.find((u) => u.id === usuarioId);
    if (!usuario) return;

    if (usuario.isAdmin) {
      erroLocal = "Administradores não podem ter permissões modificadas.";
      return;
    }

    const algumaPermissaoMarcada = Object.values(usuario.permissoes).some(
      Boolean,
    );

    Object.keys(usuario.permissoes).forEach((permissao) => {
      usuario.permissoes[permissao] = !algumaPermissaoMarcada;
    });

    usuariosModificados.add(usuarioId);
  }

  // Função chamada quando uma permissão individual é alterada
  function onPermissaoChange(
    usuarioId: string,
    permissao: string,
    checked: boolean,
  ) {
    const usuario = data.usuarios.find((u) => u.id === usuarioId);
    if (!usuario) return;

    if (usuario.isAdmin && !checked) {
      usuario.permissoes[permissao] = true;
      erroLocal = "Administradores não podem ter permissões modificadas.";
      return;
    }

    usuariosModificados.add(usuarioId);
    erroLocal = "";
  }

  $: permissoesKeys = data.permissoesDisponiveis.map(
    (permissao) => permissao.chave,
  );
</script>

<svelte:head>
  <title>Editar Permissões - {data.nomeTela}</title>
</svelte:head>

<div class="container mx-auto p-6">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-3xl font-bold">Editar Permissões - {data.nomeTela}</h1>
      <p class="text-gray-600 mt-1">
        Gerencie as permissões desta tela para todos os usuários
      </p>
    </div>
    <button
      on:click={() => goto("/app/permissoes_telas")}
      class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
    >
      ← Voltar
    </button>
  </div>

  {#if form?.success}
    <div
      class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
    >
      Permissões salvas com sucesso!
    </div>
  {/if}

  {#if form?.error}
    <div
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
    >
      Erro ao salvar permissões: {form.error}
    </div>
  {/if}

  {#if erroLocal}
    <div
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
    >
      {erroLocal}
    </div>
  {/if}

  <form method="POST" action="?/salvar" use:enhance>
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Usuário
              </th>
              {#each permissoesKeys as permissao}
                <th
                  class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                >
                  <div class="flex flex-col items-center">
                    <span class="text-xs mb-1"
                      >{data.permissoesDisponiveis.find(
                        (item) => item.chave === permissao,
                      )?.descricao}</span
                    >
                    <button
                      type="button"
                      on:click={() => toggleColuna(permissao)}
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {#if data.usuarios.filter((u) => !u.isAdmin).some((u) => u.permissoes[permissao])}
                        Desmarcar todos
                      {:else}
                        Marcar todos
                      {/if}
                    </button>
                  </div>
                </th>
              {/each}
              <th
                class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each data.usuarios as usuario}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="flex items-center gap-2">
                        <div class="text-sm font-medium text-gray-900">
                          {usuario.nome}
                        </div>
                        {#if usuario.isAdmin}
                          <span
                            class="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                          >
                            Administrador
                          </span>
                        {/if}
                      </div>
                      <div class="text-sm text-gray-500">{usuario.login}</div>
                    </div>
                  </div>
                </td>
                {#each permissoesKeys as permissao}
                  <td class="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      name={`usuario_${usuario.id}_${permissao}`}
                      value="on"
                      bind:checked={usuario.permissoes[permissao]}
                      on:change={(e) =>
                        onPermissaoChange(
                          usuario.id,
                          permissao,
                          e.currentTarget.checked,
                        )}
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                {/each}
                <td class="px-4 py-4 text-center">
                  {#if usuario.isAdmin}
                    <span class="text-sm font-medium text-amber-700"
                      >Bloqueado</span
                    >
                  {:else}
                    <button
                      type="button"
                      on:click={() => toggleLinha(usuario.id)}
                      class="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {#if Object.values(usuario.permissoes).some(Boolean)}
                        Remover todas
                      {:else}
                        Conceder todas
                      {/if}
                    </button>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-600">
        {#if usuariosModificados.size > 0}
          {usuariosModificados.size} usuário(s) com alterações pendentes
        {:else}
          Nenhuma alteração pendente
        {/if}
      </div>

      <button
        type="submit"
        disabled={usuariosModificados.size === 0 || salvando}
        class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {#if salvando}
          Salvando...
        {:else}
          Salvar Permissões
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
  .container {
    max-width: 1400px;
  }

  table {
    border-collapse: collapse;
  }

  th,
  td {
    border: 1px solid #e5e7eb;
  }
</style>
