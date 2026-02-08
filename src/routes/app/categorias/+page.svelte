<script lang="ts">
  import { remult, type FindOptions } from "remult";
  import { Categoria } from "$shared/categoria/categoria.model";
  import {
    Plus,
    Search,
    Trash2,
    Edit,
    Layers,
    ChevronLeft,
    ChevronRight,
    Filter,
  } from "@lucide/svelte";
  import { Pagination, Progress } from "@skeletonlabs/skeleton-svelte";

  let categorias = $state<Categoria[]>([]);
  let carregando = $state(true);
  let erro = $state<string | null>(null);
  let totalCount = $state(0);
  const repoCategoria = remult.repo(Categoria);

  let searchTerm = $state("");
  let filterNivel = $state<number | null>(null);
  let currentPage = $state(1);
  let pageSize = $state(10);

  let totalPages = $derived(Math.ceil(totalCount / pageSize));

  $effect(() => {
    (async () => {
      try {
        carregando = true;
        erro = null;
        let options: FindOptions<Categoria> = {
          limit: pageSize,
          page: currentPage,
          orderBy: { caminho: "asc" },
        };

        let where: any = {};

        if (searchTerm.trim()) {
          where.$or = [
            { nome: { $contains: searchTerm } },
            { caminho: { $contains: searchTerm } },
          ];
        }

        if (filterNivel) {
          where.nivel = filterNivel;
        }

        options.where = where;

        const result = await repoCategoria.find(options);
        categorias = result;
        totalCount = await repoCategoria.count(where);
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
        erro =
          "Erro ao carregar categorias: " +
          (err instanceof Error ? err.message : String(err));
      } finally {
        carregando = false;
      }
    })();
  });

  async function excluirCategoria(categoria: Categoria) {
    if (
      !confirm(
        `Tem certeza que deseja excluir a categoria "${categoria.nome}"? Isso pode afetar produtos e subcategorias vinculadas.`,
      )
    ) {
      return;
    }

    try {
      await repoCategoria.delete(categoria.id);
      categorias = categorias.filter((c) => c.id !== categoria.id);
      totalCount -= 1;
    } catch (err) {
      alert(
        "Erro ao excluir categoria: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }
</script>

<div class="space-y-6">
  <!-- Header da Página -->
  <header
    class="flex flex-col md:flex-row md:items-center justify-between gap-4"
  >
    <div class="flex items-center space-x-3">
      <div
        class="h-12 w-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500"
      >
        <Layers size={28} />
      </div>
      <div>
        <h1 class="h2">Categorias</h1>
        <p class="text-surface-600-400 text-sm">
          Gerencie a hierarquia de categorias para seus produtos
        </p>
      </div>
    </div>

    <a
      href="/app/categorias/criar_editar"
      class="btn preset-filled-primary-500 flex items-center gap-2"
    >
      <Plus size={18} />
      <span>Nova Categoria</span>
    </a>
  </header>

  <!-- Filtros e Pesquisa -->
  <div
    class="card p-4 preset-outlined-surface-200-800 bg-surface-50-950 space-y-4"
  >
    <div class="flex flex-col md:flex-row gap-4">
      <div class="w-full md:w-64">
        <label
          for="filterNivel"
          class="label text-xs mb-1 opacity-75 uppercase font-bold"
          >Filtrar por Nível</label
        >
        <div class="input-group grid-cols-[auto_1fr]">
          <div class="ig-cell preset-tonal"><Filter size={16} /></div>
          <select id="filterNivel" bind:value={filterNivel} class="ig-select">
            <option value={null}>Todos os Níveis</option>
            <option value={1}>Nível 1 (Raiz)</option>
            <option value={2}>Nível 2 (Subcategoria)</option>
            <option value={3}>Nível 3 (Detalhada)</option>
          </select>
        </div>
      </div>

      <div class="flex-1">
        <label
          for="searchTerm"
          class="label text-xs mb-1 opacity-75 uppercase font-bold"
          >Pesquisa</label
        >
        <div
          class="input-group grid-cols-[auto_1fr_auto] divide-x divide-surface-200-800"
        >
          <div class="ig-cell preset-tonal"><Search size={18} /></div>
          <input
            id="searchTerm"
            type="text"
            bind:value={searchTerm}
            class="ig-input"
            placeholder="Pesquisar por nome ou caminho da categoria..."
          />
        </div>
      </div>
    </div>
  </div>

  {#if erro}
    <div class="alert preset-filled-error flex items-center gap-3">
      <div
        class="h-8 w-8 rounded bg-white/20 flex items-center justify-center font-bold"
      >
        !
      </div>
      <p>{erro}</p>
    </div>
  {/if}

  {#if carregando}
    <div class="flex flex-col items-center justify-center py-24 space-y-6">
      <Progress value={null} class="w-64">
        <Progress.Track>
          <Progress.Range
            class="bg-primary-500 animate-[custom-animation_2s_ease-in-out_infinite]"
          />
        </Progress.Track>
      </Progress>
      <p class="text-surface-600-400 font-medium animate-pulse">
        Buscando categorias...
      </p>
    </div>
  {:else}
    <div
      class="card overflow-hidden preset-outlined-surface-200-800 bg-surface-50-950"
    >
      <div class="table-container">
        <table class="table table-hover">
          <thead>
            <tr>
              <th class="bg-surface-100-900! border-b border-surface-200-800"
                >Nível</th
              >
              <th class="bg-surface-100-900! border-b border-surface-200-800"
                >Nome</th
              >
              <th class="bg-surface-100-900! border-b border-surface-200-800"
                >Caminho Completo</th
              >
              <th class="bg-surface-100-900! border-b border-surface-200-800"
                >Status</th
              >
              <th
                class="bg-surface-100-900! border-b border-surface-200-800 text-right"
                >Ações</th
              >
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-200-800">
            {#each categorias as categoria}
              <tr class="transition-colors hover:bg-surface-100-900/50">
                <td>
                  <span
                    class="badge {categoria.nivel === 1
                      ? 'preset-filled-primary-500'
                      : categoria.nivel === 2
                        ? 'preset-filled-secondary-500'
                        : 'preset-filled-tertiary-500'}"
                  >
                    Nível {categoria.nivel}
                  </span>
                </td>
                <td class="font-medium">{categoria.nome}</td>
                <td class="text-sm text-surface-600-400">
                  {categoria.caminho || categoria.nome}
                </td>
                <td>
                  {#if categoria.ativo}
                    <span class="badge preset-tint-success">Ativo</span>
                  {:else}
                    <span class="badge preset-tint-error">Inativo</span>
                  {/if}
                </td>
                <td class="text-right">
                  <div class="flex justify-end gap-2">
                    <a
                      href={"/app/categorias/criar_editar?id=" + categoria.id}
                      class="btn btn-sm preset-tonal-surface hover:preset-filled-primary-500"
                      title="Editar"
                    >
                      <Edit size={14} />
                    </a>
                    <button
                      onclick={() => excluirCategoria(categoria)}
                      class="btn btn-sm preset-tonal-error hover:preset-filled-error-500"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if categorias.length === 0}
        <div class="flex flex-col items-center justify-center py-16 space-y-4">
          <div
            class="h-16 w-16 rounded-full bg-surface-100-900 flex items-center justify-center opacity-50"
          >
            <Layers size={32} />
          </div>
          <p class="text-surface-600-400">Nenhuma categoria encontrada.</p>
        </div>
      {/if}

      {#if totalCount > 0}
        <footer
          class="p-4 border-t border-surface-200-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-100-900/10"
        >
          <div class="text-sm text-surface-600-400">
            Mostrando <span class="text-surface-900-50 font-bold"
              >{(currentPage - 1) * pageSize + 1}</span
            >
            a
            <span class="text-surface-900-50 font-bold"
              >{Math.min(currentPage * pageSize, totalCount)}</span
            >
            de
            <span class="text-surface-900-50 font-bold">{totalCount}</span> categorias
          </div>

          <Pagination
            count={totalCount}
            {pageSize}
            page={currentPage}
            onPageChange={(e) => (currentPage = e.page)}
            class="flex items-center gap-1"
          >
            <Pagination.PrevTrigger
              class="btn-icon btn-icon-sm preset-tonal-surface"
            >
              <ChevronLeft size={16} />
            </Pagination.PrevTrigger>
            <Pagination.Context>
              {#snippet children(pagination)}
                {#each pagination().pages as page, index (page)}
                  {#if page.type === "page"}
                    <Pagination.Item
                      {...page}
                      class="btn btn-sm {currentPage === page.value
                        ? 'preset-filled-primary-500'
                        : 'preset-tonal-surface hover:preset-filled-surface-200-800'}"
                    >
                      {page.value}
                    </Pagination.Item>
                  {:else}
                    <Pagination.Ellipsis {index} class="opacity-50 px-2">
                      &#8230;
                    </Pagination.Ellipsis>
                  {/if}
                {/each}
              {/snippet}
            </Pagination.Context>
            <Pagination.NextTrigger
              class="btn-icon btn-icon-sm preset-tonal-surface"
            >
              <ChevronRight size={16} />
            </Pagination.NextTrigger>
          </Pagination>
        </footer>
      {/if}
    </div>
  {/if}
</div>

<style>
  @keyframes -global-custom-animation {
    from {
      scale: 0.5 1;
      transform: translateX(-200%);
    }
    25% {
      transform: translateX(50%);
    }
    50% {
      transform: translateX(-50%);
    }
    75% {
      transform: translateX(150%);
    }
    to {
      scale: 0.5 1;
      transform: translateX(200%);
    }
  }
</style>
