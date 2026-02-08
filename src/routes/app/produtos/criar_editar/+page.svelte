<script lang="ts">
  import { remult } from "remult";
  import { Produto } from "$shared/produto/produto.model";
  import { Categoria } from "$shared/categoria/categoria.model";
  import { Fornecedor } from "$shared/fornecedor/fornecedor.model";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import {
    Save,
    ArrowLeft,
    Package,
    Trash2,
    Hash,
    Tag,
    Truck,
    Pencil,
    Eraser,
    Coins,
    Layers,
    ClipboardList,
    Ruler,
  } from "@lucide/svelte";
  import { Progress } from "@skeletonlabs/skeleton-svelte";
  import { tipoVariacao } from "$lib/types/variacao.types";

  // Estados do formulário
  let descricao = $state("");
  let precoCusto = $state(0);
  let precoVenda = $state(0);
  let unidadeMedida = $state<"UN" | "KG" | "LT" | "M">("UN");
  let nivel1Id = $state<string | null>(null);
  let nivel2Id = $state<string | null>(null);
  let nivel3Id = $state<string | null>(null);
  let categoriaId = $state<string | null>(null);
  let fornecedorId = $state<string | null>(null);
  let variacao1 = $state<string>("");
  let variacao2 = $state<string>("");
  let variacao3 = $state<string>("");

  // Estados da aplicação
  let carregando = $state(true);
  let salvando = $state(false);
  let erro = $state<string | null>(null);
  let sucesso = $state<string | null>(null);

  // Modo de operação
  let modoEdicao = $state(false);
  let produtoIdEdicao = $state<string | null>(null);

  // Listas para selects
  let categorias = $state<Categoria[]>([]);
  let fornecedores = $state<Fornecedor[]>([]);

  // Categorias filtradas por nível
  let categoriasNivel1 = $derived(categorias.filter((c) => c.nivel === 1));
  let categoriasNivel2 = $derived(
    categorias.filter((c) => c.nivel === 2 && c.categoriaPai?.id === nivel1Id),
  );
  let categoriasNivel3 = $derived(
    categorias.filter((c) => c.nivel === 3 && c.categoriaPai?.id === nivel2Id),
  );

  // Repositórios
  const repoProduto = remult.repo(Produto);
  const repoCategoria = remult.repo(Categoria);
  const repoFornecedor = remult.repo(Fornecedor);

  // Carregar dados quando o componente for montado
  onMount(async () => {
    // Verificar se tem ID nos query params (edição)
    const urlParams = new URLSearchParams(page.url.search);
    const produtoId = urlParams.get("id");

    await carregarListas();

    if (produtoId) {
      modoEdicao = true;
      produtoIdEdicao = produtoId;
      await carregarProdutoParaEdicao(produtoId);
    }
  });

  async function carregarListas() {
    try {
      categorias = await repoCategoria.find({ orderBy: { caminho: "asc" } });
      fornecedores = await repoFornecedor.find({
        orderBy: { razaoSocial: "asc" },
      });
    } catch (err) {
      erro =
        "Erro ao carregar listas: " +
        (err instanceof Error ? err.message : String(err));
    } finally {
      carregando = false;
    }
  }

  async function carregarProdutoParaEdicao(produtoId: string) {
    try {
      const produto = await repoProduto.findId(produtoId, {
        include: { categoria: true, fornecedor: true },
      });
      if (produto) {
        descricao = produto.descricao;
        precoCusto = produto.precoCusto;
        precoVenda = produto.precoVenda;
        unidadeMedida = produto.unidadeMedida;
        if (produto.categoria) {
          categoriaId = produto.categoria.id;
          const ids = produto.categoria.caminhoIds?.split(",") || [];
          nivel1Id = ids[0] || null;
          nivel2Id = ids[1] || null;
          nivel3Id = ids[2] || null;
        }
        fornecedorId = produto.fornecedor?.id || null;
        variacao1 = produto.variacao1 || "";
        variacao2 = produto.variacao2 || "";
        variacao3 = produto.variacao3 || "";
      } else {
        erro = "Produto não encontrado";
      }
    } catch (err) {
      erro =
        "Erro ao carregar produto: " +
        (err instanceof Error ? err.message : String(err));
    }
  }

  async function salvar() {
    try {
      salvando = true;
      erro = null;
      sucesso = null;

      // Validações
      if (!descricao.trim()) {
        erro = "A descrição é obrigatória";
        return;
      }

      if (!fornecedorId) {
        erro = "O fornecedor é obrigatório";
        return;
      }

      const finalCategoriaId = nivel3Id || nivel2Id || nivel1Id;
      if (!finalCategoriaId) {
        erro = "A categoria é obrigatória";
        return;
      }

      if (precoCusto <= 0) {
        erro = "O preço de custo deve ser maior que zero";
        return;
      }

      if (precoVenda <= 0) {
        erro = "O preço de venda deve ser maior que zero";
        return;
      }

      // Criar ou atualizar produto
      let produto: Produto;
      if (modoEdicao && produtoIdEdicao) {
        const produtoEncontrado = await repoProduto.findId(produtoIdEdicao);
        if (!produtoEncontrado) {
          erro = "Produto não encontrado";
          return;
        }
        produto = produtoEncontrado;
      } else {
        produto = repoProduto.create();
      }

      // Preencher dados
      produto.descricao = descricao.trim();
      produto.precoCusto = precoCusto;
      produto.precoVenda = precoVenda;
      produto.unidadeMedida = unidadeMedida;
      produto.variacao1 = (variacao1 as any) || undefined;
      produto.variacao2 = (variacao2 as any) || undefined;
      produto.variacao3 = (variacao3 as any) || undefined;

      if (finalCategoriaId) {
        const categoria = await repoCategoria.findId(finalCategoriaId);
        if (categoria) {
          produto.categoria = categoria;
        }
      }

      if (fornecedorId) {
        const fornecedor = await repoFornecedor.findId(fornecedorId);
        if (fornecedor) {
          produto.fornecedor = fornecedor;
        }
      }

      // Salvar
      await repoProduto.save(produto);

      sucesso = modoEdicao
        ? "Produto atualizado com sucesso!"
        : "Produto criado com sucesso!";

      // Voltar para a listagem após 1.5 segundos
      setTimeout(() => {
        goto("/app/produtos");
      }, 1500);
    } catch (err) {
      erro =
        "Erro ao salvar: " + (err instanceof Error ? err.message : String(err));
    } finally {
      salvando = false;
    }
  }

  function limparFormulario() {
    descricao = "";
    precoCusto = 0;
    precoVenda = 0;
    unidadeMedida = "UN";
    nivel1Id = null;
    nivel2Id = null;
    nivel3Id = null;
    categoriaId = null;
    fornecedorId = null;
    variacao1 = "";
    variacao2 = "";
    variacao3 = "";
  }
</script>

<div class="space-y-6">
  <!-- Header da Página -->
  <header class="flex items-center justify-between gap-4">
    <div class="flex items-center space-x-3">
      <button
        onclick={() => goto("/app/produtos")}
        class="btn-icon preset-tonal-surface hover:preset-filled-surface-200-800"
        title="Voltar"
      >
        <ArrowLeft size={20} />
      </button>
      <div
        class="h-10 w-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500"
      >
        <Package size={24} />
      </div>
      <div>
        <h1 class="h3 font-bold">
          {modoEdicao ? "Editar Produto" : "Novo Produto"}
        </h1>
        <p class="text-surface-600-400 text-xs hidden sm:block">
          {modoEdicao
            ? "Atualize as informações do produto"
            : "Preencha os campos para cadastrar um novo produto"}
        </p>
      </div>
    </div>
  </header>

  {#if erro}
    <div
      class="alert preset-filled-error flex items-center gap-3 animate-in fade-in slide-in-from-top-4"
    >
      <div
        class="h-8 w-8 rounded bg-white/20 flex items-center justify-center font-bold"
      >
        !
      </div>
      <p>{erro}</p>
    </div>
  {/if}

  {#if sucesso}
    <div
      class="alert preset-filled-success flex items-center gap-3 animate-in fade-in slide-in-from-top-4"
    >
      <div
        class="h-8 w-8 rounded bg-white/20 flex items-center justify-center font-bold"
      >
        ✓
      </div>
      <p>{sucesso}</p>
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
        Carregando dados...
      </p>
    </div>
  {:else}
    <form
      onsubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
      class="space-y-6"
    >
      <!-- Informações Básicas -->
      <section
        class="card preset-outlined-surface-200-800 bg-surface-50-950 overflow-hidden"
      >
        <header
          class="bg-surface-100-900/10 p-4 border-b border-surface-200-800 flex items-center gap-2"
        >
          <Tag size={18} class="text-primary-500" />
          <h2 class="font-bold text-sm uppercase tracking-wider">
            Informações Básicas
          </h2>
        </header>

        <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="md:col-span-2 lg:col-span-3">
            <label class="label">
              <span class="label-text">Descrição</span>
              <div
                class="input-group grid-cols-[auto_1fr] divide-x divide-surface-200-800"
              >
                <div class="ig-cell preset-tonal"><Tag size={16} /></div>
                <input
                  type="text"
                  class="ig-input"
                  placeholder="Ex: Camiseta Algodão Premium"
                  bind:value={descricao}
                  disabled={salvando}
                  required
                />
              </div>
            </label>
          </div>

          <div>
            <label class="label">
              <span class="label-text">Unidade</span>
              <div class="input-group grid-cols-[auto_1fr]">
                <div class="ig-cell preset-tonal"><Ruler size={16} /></div>
                <select
                  bind:value={unidadeMedida}
                  class="ig-select"
                  disabled={salvando}
                >
                  <option value="UN">Unidade (UN)</option>
                  <option value="KG">Quilograma (KG)</option>
                  <option value="LT">Litro (LT)</option>
                  <option value="M">Metro (M)</option>
                </select>
              </div>
            </label>
          </div>
        </div>
      </section>

      <!-- Precificação e Relacionamentos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Precificação -->
        <section
          class="card preset-outlined-surface-200-800 bg-surface-50-950 overflow-hidden"
        >
          <header
            class="bg-surface-100-900/10 p-4 border-b border-surface-200-800 flex items-center gap-2"
          >
            <Coins size={18} class="text-primary-500" />
            <h2 class="font-bold text-sm uppercase tracking-wider">
              Precificação
            </h2>
          </header>

          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="label">
                <span class="label-text">Preço de Custo</span>
                <div
                  class="input-group grid-cols-[auto_1fr] divide-x divide-surface-200-800"
                >
                  <div class="ig-cell preset-tonal text-sm font-bold">R$</div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    class="ig-input"
                    bind:value={precoCusto}
                    disabled={salvando}
                    required
                  />
                </div>
              </label>
            </div>

            <div>
              <label class="label">
                <span class="label-text">Preço de Venda</span>
                <div
                  class="input-group grid-cols-[auto_1fr] divide-x divide-surface-200-800"
                >
                  <div class="ig-cell preset-tonal text-sm font-bold">R$</div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    class="ig-input"
                    bind:value={precoVenda}
                    disabled={salvando}
                    required
                  />
                </div>
              </label>
            </div>
          </div>
        </section>

        <!-- Categorias e Fornecedor -->
        <section
          class="card preset-outlined-surface-200-800 bg-surface-50-950 overflow-hidden"
        >
          <header
            class="bg-surface-100-900/10 p-4 border-b border-surface-200-800 flex items-center gap-2"
          >
            <Layers size={18} class="text-primary-500" />
            <h2 class="font-bold text-sm uppercase tracking-wider">
              Categorização
            </h2>
          </header>

          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="sm:col-span-2 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <!-- Nível 1 -->
                <div>
                  <label class="label">
                    <span class="label-text">Categoria Nível 1</span>
                    <div class="input-group grid-cols-[auto_1fr]">
                      <div class="ig-cell preset-tonal">
                        <Layers size={16} />
                      </div>
                      <select
                        bind:value={nivel1Id}
                        onchange={() => {
                          nivel2Id = null;
                          nivel3Id = null;
                        }}
                        class="ig-select"
                        disabled={salvando}
                        required
                      >
                        <option value={null}>-- Selecione --</option>
                        {#each categoriasNivel1 as cat}
                          <option value={cat.id}>{cat.nome}</option>
                        {/each}
                      </select>
                    </div>
                  </label>
                </div>

                <!-- Nível 2 -->
                {#if nivel1Id && categoriasNivel2.length > 0}
                  <div class="animate-in fade-in slide-in-from-left-4">
                    <label class="label">
                      <span class="label-text">Categoria Nível 2</span>
                      <div class="input-group grid-cols-[auto_1fr]">
                        <div class="ig-cell preset-tonal">
                          <Layers size={16} />
                        </div>
                        <select
                          bind:value={nivel2Id}
                          onchange={() => (nivel3Id = null)}
                          class="ig-select"
                          disabled={salvando}
                        >
                          <option value={null}>-- Selecione --</option>
                          {#each categoriasNivel2 as cat}
                            <option value={cat.id}>{cat.nome}</option>
                          {/each}
                        </select>
                      </div>
                    </label>
                  </div>
                {/if}

                <!-- Nível 3 -->
                {#if nivel2Id && categoriasNivel3.length > 0}
                  <div class="animate-in fade-in slide-in-from-left-4">
                    <label class="label">
                      <span class="label-text">Categoria Nível 3</span>
                      <div class="input-group grid-cols-[auto_1fr]">
                        <div class="ig-cell preset-tonal">
                          <Layers size={16} />
                        </div>
                        <select
                          bind:value={nivel3Id}
                          class="ig-select"
                          disabled={salvando}
                        >
                          <option value={null}>-- Selecione --</option>
                          {#each categoriasNivel3 as cat}
                            <option value={cat.id}>{cat.nome}</option>
                          {/each}
                        </select>
                      </div>
                    </label>
                  </div>
                {/if}
              </div>
            </div>

            <div>
              <label class="label">
                <span class="label-text">Fornecedor</span>
                <div class="input-group grid-cols-[auto_1fr]">
                  <div class="ig-cell preset-tonal"><Truck size={16} /></div>
                  <select
                    bind:value={fornecedorId}
                    class="ig-select"
                    disabled={salvando || modoEdicao}
                    required
                  >
                    <option value={null}>-- Selecione --</option>
                    {#each fornecedores as fornecedor}
                      <option value={fornecedor.id}
                        >{fornecedor.razaoSocial}</option
                      >
                    {/each}
                  </select>
                </div>
                {#if modoEdicao}
                  <p class="text-[10px] text-surface-500 mt-1 italic">
                    * O fornecedor não pode ser alterado após a criação.
                  </p>
                {/if}
              </label>
            </div>
          </div>
        </section>
      </div>

      <!-- Variações -->
      <section
        class="card preset-outlined-surface-200-800 bg-surface-50-950 overflow-hidden"
      >
        <header
          class="bg-surface-100-900/10 p-4 border-b border-surface-200-800 flex items-center gap-2"
        >
          <ClipboardList size={18} class="text-primary-500" />
          <h2 class="font-bold text-sm uppercase tracking-wider">
            Atributos e Variações
          </h2>
        </header>

        <div class="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label class="label">
              <span class="label-text">Variação 1</span>
              <select
                bind:value={variacao1}
                class="ig-select"
                disabled={salvando}
              >
                <option value="">-- Nenhuma --</option>
                {#each tipoVariacao as tipo}
                  <option value={tipo}>{tipo}</option>
                {/each}
              </select>
            </label>
          </div>

          <div>
            <label class="label">
              <span class="label-text">Variação 2</span>
              <select
                bind:value={variacao2}
                class="ig-select"
                disabled={salvando}
              >
                <option value="">-- Nenhuma --</option>
                {#each tipoVariacao as tipo}
                  <option value={tipo}>{tipo}</option>
                {/each}
              </select>
            </label>
          </div>

          <div>
            <label class="label">
              <span class="label-text">Variação 3</span>
              <select
                bind:value={variacao3}
                class="ig-select"
                disabled={salvando}
              >
                <option value="">-- Nenhuma --</option>
                {#each tipoVariacao as tipo}
                  <option value={tipo}>{tipo}</option>
                {/each}
              </select>
            </label>
          </div>
        </div>
      </section>

      <!-- Ações -->
      <footer
        class="flex flex-col sm:flex-row items-center justify-end gap-4 pb-12"
      >
        <button
          type="button"
          onclick={limparFormulario}
          class="btn preset-tonal-surface w-full sm:w-auto flex items-center gap-2"
          disabled={salvando}
        >
          <Eraser size={18} />
          <span>Limpar</span>
        </button>

        <button
          type="button"
          onclick={() => goto("/app/produtos")}
          class="btn preset-tonal-surface hover:preset-tonal-error w-full sm:w-auto"
          disabled={salvando}
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="btn preset-filled-primary-500 w-full sm:w-auto flex items-center gap-2 min-w-[140px]"
          disabled={salvando}
        >
          {#if salvando}
            <div
              class="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></div>
            <span>Salvando...</span>
          {:else}
            <Save size={18} />
            <span>{modoEdicao ? "Atualizar" : "Salvar Produto"}</span>
          {/if}
        </button>
      </footer>
    </form>
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
