<script lang="ts">
  import { remult } from "remult";
  import { Categoria } from "$shared/categoria/categoria.model";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import {
    Save,
    ArrowLeft,
    Layers,
    Eraser,
    Info,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Tag,
    CircleAlert,
    CircleCheck,
  } from "@lucide/svelte";
  import { Progress } from "@skeletonlabs/skeleton-svelte";

  // Estados do formulário
  let nome = $state("");
  let nivel = $state<number>(1);
  let nivel1Id = $state<string | null>(null);
  let nivel2Id = $state<string | null>(null);
  let ativo = $state(true);

  // Listas para selects
  let categoriasNivel1 = $state<Categoria[]>([]);
  let categoriasNivel2 = $state<Categoria[]>([]);

  // Estados da aplicação
  let carregando = $state(true);
  let salvando = $state(false);
  let erro = $state<string | null>(null);
  let sucesso = $state<string | null>(null);

  // Modo de operação
  let modoEdicao = $state(false);
  let categoriaIdEdicao = $state<string | null>(null);

  // Repositório
  const repoCategoria = remult.repo(Categoria);

  // Carregar dados iniciais
  onMount(async () => {
    const urlParams = new URLSearchParams(page.url.search);
    const id = urlParams.get("id");

    await carregarListasIniciais();

    if (id) {
      modoEdicao = true;
      categoriaIdEdicao = id;
      await carregarCategoria(id);
    } else {
      carregando = false;
    }
  });

  async function carregarListasIniciais() {
    try {
      categoriasNivel1 = await repoCategoria.find({
        where: { nivel: 1 },
        orderBy: { nome: "asc" },
      });
    } catch (err) {
      erro =
        "Erro ao carregar categorias: " +
        (err instanceof Error ? err.message : String(err));
    }
  }

  async function carregarCategoria(id: string) {
    try {
      const cat = await repoCategoria.findId(id, {
        include: { categoriaPai: true },
      });
      if (cat) {
        nome = cat.nome;
        nivel = cat.nivel;
        ativo = cat.ativo;

        if (cat.nivel === 2) {
          nivel1Id = cat.categoriaPai?.id || null;
        } else if (cat.nivel === 3) {
          nivel2Id = cat.categoriaPai?.id || null;
          // Buscar pai do nível 2 para achar o nível 1
          if (cat.categoriaPai) {
            const paiNivel2 = await repoCategoria.findId(cat.categoriaPai.id, {
              include: { categoriaPai: true },
            });
            nivel1Id = paiNivel2?.categoriaPai?.id || null;
            if (nivel1Id) await carregarCategoriasNivel2(nivel1Id);
          }
        }
      } else {
        erro = "Categoria não encontrada";
      }
    } catch (err) {
      erro =
        "Erro ao carregar dados: " +
        (err instanceof Error ? err.message : String(err));
    } finally {
      carregando = false;
    }
  }

  // Efeito para carregar Nível 2 quando Nível 1 muda
  $effect(() => {
    if (nivel1Id) {
      carregarCategoriasNivel2(nivel1Id);
    } else {
      categoriasNivel2 = [];
    }
  });

  async function carregarCategoriasNivel2(parentId: string) {
    try {
      categoriasNivel2 = await repoCategoria.find({
        where: { categoriaPai: { $id: parentId }, nivel: 2 },
        orderBy: { nome: "asc" },
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function salvar() {
    try {
      salvando = true;
      erro = null;
      sucesso = null;

      if (!nome.trim()) {
        erro = "O nome da categoria é obrigatório";
        return;
      }

      if (nivel === 2 && !nivel1Id) {
        erro = "Selecione uma categoria pai (Nível 1)";
        return;
      }

      if (nivel === 3 && !nivel2Id) {
        erro = "Selecione uma categoria pai (Nível 2)";
        return;
      }

      let categoria: Categoria;
      if (modoEdicao && categoriaIdEdicao) {
        categoria = (await repoCategoria.findId(categoriaIdEdicao))!;
      } else {
        categoria = repoCategoria.create();
      }

      categoria.nome = nome.trim();
      categoria.nivel = nivel;
      categoria.ativo = ativo;

      if (nivel === 1) {
        categoria.categoriaPai = undefined;
      } else if (nivel === 2) {
        categoria.categoriaPai = categoriasNivel1.find(
          (c) => c.id === nivel1Id,
        );
      } else if (nivel === 3) {
        categoria.categoriaPai = categoriasNivel2.find(
          (c) => c.id === nivel2Id,
        );
      }

      await repoCategoria.save(categoria);

      sucesso = modoEdicao ? "Categoria atualizada!" : "Categoria criada!";
      setTimeout(() => goto("/app/categorias"), 1500);
    } catch (err) {
      erro =
        "Erro ao salvar: " + (err instanceof Error ? err.message : String(err));
    } finally {
      salvando = false;
    }
  }

  function limparFormulario() {
    if (!modoEdicao) {
      nome = "";
      nivel = 1;
      nivel1Id = null;
      nivel2Id = null;
      ativo = true;
    }
  }

  const getBreadcrumb = $derived(() => {
    let parts = [];
    if (nivel1Id) {
      const p1 = categoriasNivel1.find((c) => c.id === nivel1Id);
      if (p1) parts.push(p1.nome);
    }
    if (nivel >= 3 && nivel2Id) {
      const p2 = categoriasNivel2.find((c) => c.id === nivel2Id);
      if (p2) parts.push(p2.nome);
    }
    if (nome) parts.push(nome);
    return parts.join(" > ") || "Nova Categoria";
  });
</script>

<div class="space-y-6">
  <!-- Header -->
  <header class="flex items-center justify-between gap-4">
    <div class="flex items-center space-x-3">
      <button
        onclick={() => goto("/app/categorias")}
        class="btn-icon preset-tonal-surface hover:preset-filled-surface-200-800"
        title="Voltar"
      >
        <ArrowLeft size={20} />
      </button>
      <div
        class="h-10 w-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500"
      >
        <Layers size={24} />
      </div>
      <div>
        <h1 class="h3 font-bold">
          {modoEdicao ? "Editar Categoria" : "Nova Categoria"}
        </h1>
        <p class="text-surface-600-400 text-xs">{getBreadcrumb()}</p>
      </div>
    </div>
  </header>

  {#if erro}
    <div
      class="alert preset-filled-error flex items-center gap-3 animate-in fade-in slide-in-from-top-4"
    >
      <CircleAlert size={20} />
      <p>{erro}</p>
    </div>
  {/if}

  {#if sucesso}
    <div
      class="alert preset-filled-success flex items-center gap-3 animate-in fade-in slide-in-from-top-4"
    >
      <CheckCircle size={20} />
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
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Coluna da Esquerda: Hierarquia -->
        <div class="lg:col-span-2 space-y-6">
          <section
            class="card preset-outlined-surface-200-800 bg-surface-50-950 overflow-hidden"
          >
            <header
              class="bg-surface-100-900/10 p-4 border-b border-surface-200-800 flex items-center gap-2"
            >
              <Info size={18} class="text-primary-500" />
              <h2 class="font-bold text-sm uppercase tracking-wider">
                Definição de Nível
              </h2>
            </header>

            <div class="p-6 space-y-6">
              <!-- Nível -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                {#each [1, 2, 3] as n}
                  <button
                    type="button"
                    class="btn border-2 transition-all flex flex-col items-center py-4 gap-2
                      {nivel === n
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-surface-200-800 hover:border-surface-400'}"
                    disabled={modoEdicao}
                    onclick={() => {
                      nivel = n;
                      nivel1Id = null;
                      nivel2Id = null;
                    }}
                  >
                    <span class="text-xs font-bold uppercase opacity-60"
                      >Nível {n}</span
                    >
                    <span class="font-bold text-lg"
                      >{n === 1 ? "Raiz" : n === 2 ? "Grupo" : "Detalhe"}</span
                    >
                    {#if nivel === n}
                      <CircleCheck size={16} class="text-primary-500" />
                    {/if}
                  </button>
                {/each}
              </div>

              {#if modoEdicao}
                <p class="text-[10px] text-surface-500 italic">
                  * O nível não pode ser alterado após a criação.
                </p>
              {/if}

              <!-- Seleção de Pais Dinâmica -->
              {#if nivel >= 2}
                <div
                  class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-4"
                >
                  <!-- Parent Nivel 1 -->
                  <div>
                    <label class="label">
                      <span class="label-text">Categoria Pai (Nível 1)</span>
                      <div class="input-group grid-cols-[auto_1fr]">
                        <div class="ig-cell preset-tonal">
                          <Layers size={16} />
                        </div>
                        <select
                          bind:value={nivel1Id}
                          class="ig-select"
                          disabled={salvando || (modoEdicao && nivel === 2)}
                        >
                          <option value={null}>-- Selecione --</option>
                          {#each categoriasNivel1 as cat}
                            <option value={cat.id}>{cat.nome}</option>
                          {/each}
                        </select>
                      </div>
                    </label>
                  </div>

                  <!-- Parent Nivel 2 (apenas se nivel for 3) -->
                  {#if nivel === 3}
                    <div class="animate-in slide-in-from-left-4">
                      <label class="label">
                        <span class="label-text"
                          >Subcategoria Pai (Nível 2)</span
                        >
                        <div class="input-group grid-cols-[auto_1fr]">
                          <div class="ig-cell preset-tonal">
                            <Layers size={16} />
                          </div>
                          <select
                            bind:value={nivel2Id}
                            class="ig-select"
                            disabled={salvando || !nivel1Id || modoEdicao}
                          >
                            <option value={null}
                              >{nivel1Id
                                ? "-- Selecione --"
                                : "Selecione o Nível 1 primeiro"}</option
                            >
                            {#each categoriasNivel2 as cat}
                              <option value={cat.id}>{cat.nome}</option>
                            {/each}
                          </select>
                        </div>
                      </label>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </section>

          <section
            class="card preset-outlined-surface-200-800 bg-surface-50-950 overflow-hidden"
          >
            <header
              class="bg-surface-100-900/10 p-4 border-b border-surface-200-800 flex items-center gap-2"
            >
              <Tag size={18} class="text-primary-500" />
              <h2 class="font-bold text-sm uppercase tracking-wider">
                Identificação
              </h2>
            </header>

            <div class="p-6">
              <label class="label">
                <span class="label-text">Nome da Categoria</span>
                <div
                  class="input-group grid-cols-[auto_1fr] divide-x divide-surface-200-800"
                >
                  <div class="ig-cell preset-tonal"><Tag size={16} /></div>
                  <input
                    type="text"
                    class="ig-input"
                    placeholder="Ex: Eletrônicos, Smartphones, Acessórios..."
                    bind:value={nome}
                    disabled={salvando}
                    required
                  />
                </div>
              </label>
            </div>
          </section>
        </div>

        <!-- Coluna da Direita: Status e Info -->
        <div class="space-y-6">
          <section
            class="card preset-outlined-surface-200-800 bg-surface-50-950 overflow-hidden"
          >
            <header
              class="bg-surface-100-900/10 p-4 border-b border-surface-200-800 flex items-center gap-2"
            >
              <CheckCircle size={18} class="text-primary-500" />
              <h2 class="font-bold text-sm uppercase tracking-wider">
                Configurações
              </h2>
            </header>

            <div class="p-6">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={ativo}
                  class="checkbox"
                  disabled={salvando}
                />
                <span class="font-medium">Categoria Ativa</span>
              </label>
              <p class="text-xs text-surface-500 mt-2">
                Inativar uma categoria oculta ela dos filtros de produtos.
              </p>
            </div>
          </section>

          <div class="card p-6 preset-tonal-primary space-y-4">
            <h3 class="font-bold flex items-center gap-2">
              <Info size={18} />
              Dica
            </h3>
            <p class="text-sm opacity-80">
              Categorias de <strong>Nível 1</strong> são as grandes divisões da
              loja.
              <strong>Nível 2</strong> serve para agrupar e
              <strong>Nível 3</strong> é para detalhamento máximo.
            </p>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <footer
        class="flex flex-col sm:flex-row items-center justify-end gap-4 pb-12"
      >
        <button
          type="button"
          onclick={limparFormulario}
          class="btn preset-tonal-surface w-full sm:w-auto flex items-center gap-2"
          disabled={salvando || modoEdicao}
        >
          <Eraser size={18} />
          <span>Limpar</span>
        </button>

        <button
          type="button"
          onclick={() => goto("/app/categorias")}
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
            <span>{modoEdicao ? "Atualizar" : "Salvar Categoria"}</span>
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
