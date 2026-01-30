<script lang="ts">
  import { remult, type FindOptions } from "remult";
  import { Produto } from "$shared/produto/produto.model";
  import { Fornecedor } from "$shared/fornecedor/fornecedor.model";
  import {
    Plus,
    Search,
    Trash2,
    Edit,
    Package,
    ChevronLeft,
    ChevronRight,
  } from "@lucide/svelte";
  import { Pagination, Progress } from "@skeletonlabs/skeleton-svelte";

  let produtos = $state<Produto[]>([]);
  let carregando = $state(true);
  let erro = $state<string | null>(null);
  let totalCount = $state(0);
  const repoProduto = remult.repo(Produto);
  const repoFornecedor = remult.repo(Fornecedor);

  let searchTerm = $state("");
  let searchType = $state<"produto" | "fornecedor">("produto");
  let currentPage = $state(1);
  let pageSize = $state(10);

  let totalPages = $derived(Math.ceil(totalCount / pageSize));

  $effect(() => {
    (async () => {
      try {
        carregando = true;
        erro = null;
        let conditions: FindOptions<Produto> = {};

        if (searchTerm.trim()) {
          if (searchType === "produto") {
            const conditions: FindOptions<Produto> = {};

            if (
              searchTerm.toUpperCase().startsWith("PROD") ||
              /^\d+$/.test(searchTerm.trim())
            ) {
              conditions.where = { codigo: searchTerm };
            } else {
              conditions.where = { descricao: { $contains: searchTerm } };
            }
          } else if (searchType === "fornecedor") {
            const conditions: FindOptions<Produto> = {};

            if (
              searchTerm.toUpperCase().startsWith("PROD") ||
              /^\d+$/.test(searchTerm.trim())
            ) {
              let codigo = searchTerm.replace("FORN", "");
              conditions.where = {
                fornecedor: await repoFornecedor.findOne({
                  where: { codigo: codigo },
                }),
              };
            } else {
              conditions.where = {
                fornecedor: await repoFornecedor.findOne({
                  where: {
                    $or: [
                      { nomeFantasia: searchTerm },
                      { razaoSocial: searchTerm },
                    ],
                  },
                }),
              };
            }
          }
        }

        const result = await repoProduto.find({
          ...conditions,
          limit: pageSize,
          page: currentPage,

          include: { fornecedor: true, categoria: true },
        });
        produtos = result;
        totalCount = await repoProduto.count(conditions.where);
      } catch (err) {
        console.log("err :>> ", err);
        erro =
          "Erro ao carregar produtos: " +
          (err instanceof Error ? err.message : String(err));
      } finally {
        carregando = false;
      }
    })();
  });

  async function excluirProduto(produto: Produto) {
    if (
      !confirm(
        `Tem certeza que deseja excluir o produto "${produto.descricao}"?`,
      )
    ) {
      return;
    }

    try {
      await repoProduto.delete(produto.id);
      produtos = produtos.filter((p) => p.id !== produto.id);
      totalCount -= 1;
    } catch (err) {
      alert(
        "Erro ao excluir produto: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
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
        <Package size={28} />
      </div>
      <div>
        <h1 class="h2">Produtos</h1>
        <p class="text-surface-600-400 text-sm">
          Gerencie o catálogo de produtos da sua loja
        </p>
      </div>
    </div>

    <a
      href="/app/produtos/criar_editar"
      class="btn preset-filled-primary-500 flex items-center gap-2"
    >
      <Plus size={18} />
      <span>Novo Produto</span>
    </a>
  </header>

  <!-- Filtros e Pesquisa -->
  <div
    class="card p-4 preset-outlined-surface-200-800 bg-surface-50-950 space-y-4"
  >
    <div class="flex flex-col md:flex-row gap-4">
      <div class="w-full md:w-64">
        <label
          for="searchType"
          class="label text-xs mb-1 opacity-75 uppercase font-bold"
          >Tipo de Busca</label
        >
        <select id="searchType" bind:value={searchType} class="select">
          <option value="produto">Produto (código/descrição)</option>
          <option value="fornecedor">Fornecedor (código/descrição)</option>
        </select>
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
          <div class="input-group-shim flex items-center justify-center px-3">
            <Search size={18} class="opacity-50" />
          </div>
          <input
            id="searchTerm"
            type="text"
            bind:value={searchTerm}
            placeholder={searchType === "produto"
              ? "Ex: PROD001 ou Camiseta Algodão"
              : "Ex: FORN123 ou Nome do Fornecedor"}
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
        Buscando produtos...
      </p>
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
  {:else}
    <div
      class="card overflow-hidden preset-outlined-surface-200-800 bg-surface-50-950"
    >
      <div class="table-container">
        <table class="table table-hover">
          <thead>
            <tr>
              <th class="bg-surface-100-900! border-b border-surface-200-800"
                >Código</th
              >
              <th class="bg-surface-100-900! border-b border-surface-200-800"
                >Descrição</th
              >
              <th class="bg-surface-100-900! border-b border-surface-200-800"
                >Preço Venda</th
              >
              <th class="bg-surface-100-900! border-b border-surface-200-800"
                >Categoria</th
              >
              <th class="bg-surface-100-900! border-b border-surface-200-800"
                >Fornecedor</th
              >
              <th
                class="bg-surface-100-900! border-b border-surface-200-800 text-right"
                >Ações</th
              >
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-200-800">
            {#each produtos as produto}
              <tr class="transition-colors hover:bg-surface-100-900/50">
                <td class="font-mono text-sm">{produto.codigo}</td>
                <td class="font-medium">{produto.descricao}</td>
                <td>
                  <span class="badge preset-tint-success">
                    {Number(produto.precoVenda).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </td>
                <td>
                  {#if produto.categoria}
                    <span class="badge preset-tonal-surface"
                      >{produto.categoria.nome}</span
                    >
                  {:else}
                    <span class="opacity-30">-</span>
                  {/if}
                </td>
                <td class="text-sm">{produto.fornecedor?.razaoSocial || ""}</td>
                <td class="text-right">
                  <div class="flex justify-end gap-2">
                    <a
                      href={"/app/produtos/criar_editar?id=" + produto.id}
                      class="btn btn-sm preset-tonal-surface hover:preset-filled-primary-500"
                      title="Editar"
                    >
                      <Edit size={14} />
                    </a>
                    <button
                      onclick={() => excluirProduto(produto)}
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

      {#if produtos.length === 0}
        <div class="flex flex-col items-center justify-center py-16 space-y-4">
          <div
            class="h-16 w-16 rounded-full bg-surface-100-900 flex items-center justify-center opacity-50"
          >
            <Package size={32} />
          </div>
          <p class="text-surface-600-400">Nenhum produto encontrado.</p>
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
            <span class="text-surface-900-50 font-bold">{totalCount}</span> produtos
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
                    <Pagination.Ellipsis {index} class="opacity-50 px-2"
                      >&#8230;</Pagination.Ellipsis
                    >
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
