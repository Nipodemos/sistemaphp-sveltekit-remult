<script lang="ts">
  import { remult, repo, type FindOptions } from "remult";
  import { Fornecedor } from "$shared/fornecedor/fornecedor.model";
  import {
    Plus,
    Search,
    Trash2,
    Edit,
    Truck,
    ChevronLeft,
    ChevronRight,
    BadgeCheck,
    Building2,
    Phone,
    Mail,
    UserRound,
  } from "@lucide/svelte";
  import { Pagination, Progress } from "@skeletonlabs/skeleton-svelte";

  let fornecedores = $state<Fornecedor[]>([]);
  let carregando = $state(true);
  let erro = $state<string | null>(null);
  let totalCount = $state(0);
  const repoFornecedor = remult.repo(Fornecedor);

  let searchTerm = $state("");
  let currentPage = $state(1);
  let pageSize = $state(10);

  let totalPages = $derived(Math.max(1, Math.ceil(totalCount / pageSize)));
  let totalExibidos = $derived(fornecedores.length);

  $effect(() => {
    currentPage = Math.min(currentPage, totalPages);
  });

  $effect(() => {
    searchTerm;
    currentPage = 1;
  });

  $effect(() => {
    (async () => {
      try {
        carregando = true;
        erro = null;

        const termo = searchTerm.trim();
        const where = termo
          ? {
              $or: [
                { razaoSocial: { $contains: termo } },
                { nomeFantasia: { $contains: termo } },
                { email: { $contains: termo } },
                { codigo: { $contains: termo } },
              ],
            }
          : undefined;

        const options: FindOptions<Fornecedor> = {
          limit: pageSize,
          page: currentPage,
          where,
          orderBy: { razaoSocial: "asc" },
        };

        fornecedores = await repoFornecedor.find(options);
        totalCount = await repoFornecedor.count(where);
      } catch (err) {
        erro =
          "Erro ao carregar fornecedores: " +
          (err instanceof Error ? err.message : String(err));
      } finally {
        carregando = false;
      }
    })();
  });

  async function excluirFornecedor(fornecedor: Fornecedor) {
    if (
      !confirm(
        `Tem certeza que deseja excluir o fornecedor "${fornecedor.razaoSocial}"?`,
      )
    ) {
      return;
    }

    try {
      await repoFornecedor.delete(fornecedor.id);
      fornecedores = fornecedores.filter((f) => f.id !== fornecedor.id);
      totalCount -= 1;
    } catch (err) {
      alert(
        "Erro ao excluir fornecedor: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  function formatarDocumento(documento: string, tipo: string): string {
    if (!documento) return "";
    const limpo = documento.replace(/\D/g, "");
    if (tipo === "CPF" && limpo.length === 11) {
      return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    if (tipo === "CNPJ" && limpo.length === 14) {
      return limpo.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    }

    return documento;
  }

  function formatarTelefone(telefone: string): string {
    if (!telefone) return "";
    const limpo = telefone.replace(/\D/g, "");
    if (limpo.length === 11) {
      return limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    if (limpo.length === 10) {
      return limpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return telefone;
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

<svelte:head>
  <title>Fornecedores</title>
</svelte:head>

<div class="space-y-6">
  <header class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
    <div class="space-y-3">
      <div class="flex items-center gap-3">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500"
        >
          <Truck size={28} />
        </div>
        <div>
          <h1 class="h2 font-bold">Fornecedores</h1>
          <p class="text-sm text-surface-600-400">
            Gerencie fornecedores, contatos e documentos em um só lugar
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article class="card preset-outlined-surface-200-800 bg-surface-50-950 p-4">
          <p class="text-xs font-bold uppercase tracking-wider text-surface-500">
            Total
          </p>
          <div class="mt-2 flex items-center gap-2">
            <Building2 size={18} class="text-primary-500" />
            <span class="text-2xl font-bold">{totalCount}</span>
          </div>
        </article>

        <article class="card preset-outlined-surface-200-800 bg-surface-50-950 p-4">
          <p class="text-xs font-bold uppercase tracking-wider text-surface-500">
            Página atual
          </p>
          <div class="mt-2 flex items-center gap-2">
            <ChevronRight size={18} class="text-primary-500" />
            <span class="text-2xl font-bold">{currentPage}</span>
          </div>
        </article>

        <article class="card preset-outlined-surface-200-800 bg-surface-50-950 p-4">
          <p class="text-xs font-bold uppercase tracking-wider text-surface-500">
            Visíveis
          </p>
          <div class="mt-2 flex items-center gap-2">
            <BadgeCheck size={18} class="text-primary-500" />
            <span class="text-2xl font-bold">{totalExibidos}</span>
          </div>
        </article>
      </div>
    </div>

    <a
      href="/app/fornecedores/criar_editar?id=novo"
      class="btn preset-filled-primary-500 flex items-center gap-2 self-start"
    >
      <Plus size={18} />
      <span>Novo Fornecedor</span>
    </a>
  </header>

  <section class="card preset-outlined-surface-200-800 bg-surface-50-950 p-4">
    <label
      for="searchTerm"
      class="label mb-2 text-xs font-bold uppercase tracking-wider text-surface-500"
    >
      Pesquisar fornecedores
    </label>
    <div class="input-group grid-cols-[auto_1fr]">
      <div class="ig-cell preset-tonal">
        <Search size={18} />
      </div>
      <input
        id="searchTerm"
        type="text"
        class="ig-input"
        bind:value={searchTerm}
        placeholder="Buscar por razão social, nome fantasia, e-mail ou código"
      />
    </div>
  </section>

  {#if erro}
    <div class="alert preset-filled-error flex items-center gap-3">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-white/20 font-bold">
        !
      </div>
      <p>{erro}</p>
    </div>
  {/if}

  {#if carregando}
    <div class="flex flex-col items-center justify-center py-24 space-y-6">
      <Progress value={null} class="w-64">
        <Progress.Track>
          <Progress.Range class="bg-primary-500 animate-[custom-animation_2s_ease-in-out_infinite]" />
        </Progress.Track>
      </Progress>
      <p class="font-medium text-surface-600-400 animate-pulse">
        Carregando fornecedores...
      </p>
    </div>
  {:else}
    <div class="card overflow-hidden preset-outlined-surface-200-800 bg-surface-50-950">
      <div class="table-container">
        <table class="table table-hover">
          <thead>
            <tr>
              <th class="bg-surface-100-900! border-b border-surface-200-800">Código</th>
              <th class="bg-surface-100-900! border-b border-surface-200-800">Razão Social</th>
              <th class="bg-surface-100-900! border-b border-surface-200-800">Nome Fantasia</th>
              <th class="bg-surface-100-900! border-b border-surface-200-800">Documento</th>
              <th class="bg-surface-100-900! border-b border-surface-200-800">Contato</th>
              <th class="bg-surface-100-900! border-b border-surface-200-800">Representante</th>
              <th class="bg-surface-100-900! border-b border-surface-200-800 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-200-800">
            {#each fornecedores as fornecedor}
              <tr class="transition-colors hover:bg-surface-100-900/50">
                <td class="font-mono text-sm">
                  {repo(Fornecedor).fields.codigo.displayValue(fornecedor)}
                </td>
                <td class="font-medium">
                  <div class="flex flex-col">
                    <span>{fornecedor.razaoSocial}</span>
                    <span class="text-xs text-surface-600-400">
                      {fornecedor.cidade} - {fornecedor.estado}
                    </span>
                  </div>
                </td>
                <td>{fornecedor.nomeFantasia}</td>
                <td>
                  <div class="flex flex-col">
                    <span class="badge preset-tonal-surface self-start">
                      {fornecedor.tipoDocumento}
                    </span>
                    <span class="mt-2 text-sm text-surface-600-400">
                      {formatarDocumento(
                        fornecedor.documento,
                        fornecedor.tipoDocumento,
                      )}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="space-y-1 text-sm">
                    <div class="flex items-center gap-2">
                      <Phone size={14} class="text-surface-500" />
                      <span>{formatarTelefone(fornecedor.telefonePrincipal)}</span>
                    </div>
                    {#if fornecedor.email}
                      <div class="flex items-center gap-2 text-surface-600-400">
                        <Mail size={14} />
                        <span>{fornecedor.email}</span>
                      </div>
                    {/if}
                  </div>
                </td>
                <td>
                  {#if fornecedor.representanteNome}
                    <div class="space-y-1 text-sm">
                      <div class="flex items-center gap-2">
                        <UserRound size={14} class="text-surface-500" />
                        <span>{fornecedor.representanteNome}</span>
                      </div>
                      {#if fornecedor.representanteEmail}
                        <div class="text-xs text-surface-600-400">
                          {fornecedor.representanteEmail}
                        </div>
                      {/if}
                    </div>
                  {:else}
                    <span class="text-surface-500">-</span>
                  {/if}
                </td>
                <td class="text-right">
                  <div class="flex justify-end gap-2">
                    <a
                      href={"/app/fornecedores/criar_editar?id=" + fornecedor.id}
                      class="btn btn-sm preset-tonal-surface hover:preset-filled-primary-500"
                      title="Editar"
                    >
                      <Edit size={14} />
                    </a>
                    <button
                      onclick={() => excluirFornecedor(fornecedor)}
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

      {#if fornecedores.length === 0}
        <div class="flex flex-col items-center justify-center py-16 space-y-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-surface-100-900 text-surface-400">
            <Truck size={32} />
          </div>
          <div class="space-y-1 text-center">
            <p class="font-medium text-surface-600-400">Nenhum fornecedor encontrado.</p>
            <p class="text-sm text-surface-500">
              Tente ajustar a busca ou cadastre o primeiro fornecedor.
            </p>
          </div>
          <a
            href="/app/fornecedores/criar_editar?id=novo"
            class="btn preset-filled-primary-500 flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Adicionar primeiro fornecedor</span>
          </a>
        </div>
      {/if}

      {#if totalCount > 0}
        <footer class="flex flex-col gap-4 border-t border-surface-200-800 bg-surface-100-900/10 p-4 md:flex-row md:items-center md:justify-between">
          <div class="text-sm text-surface-600-400">
            Mostrando
            <span class="font-bold text-surface-900-50">{(currentPage - 1) * pageSize + 1}</span>
            a
            <span class="font-bold text-surface-900-50">{Math.min(currentPage * pageSize, totalCount)}</span>
            de
            <span class="font-bold text-surface-900-50">{totalCount}</span>
            fornecedores
          </div>

          <Pagination
            count={totalCount}
            {pageSize}
            page={currentPage}
            onPageChange={(e) => (currentPage = e.page)}
            class="flex items-center gap-1"
          >
            <Pagination.PrevTrigger class="btn-icon btn-icon-sm preset-tonal-surface">
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
                    <Pagination.Ellipsis {index} class="px-2 opacity-50">
                      &#8230;
                    </Pagination.Ellipsis>
                  {/if}
                {/each}
              {/snippet}
            </Pagination.Context>
            <Pagination.NextTrigger class="btn-icon btn-icon-sm preset-tonal-surface">
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
