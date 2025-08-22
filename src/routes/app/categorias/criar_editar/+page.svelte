<script lang="ts">
  import { remult } from "remult";
  import { Categoria } from "$shared/categoria/categoria.model";
  import { CategoriaController } from "$shared/categoria/categoria.controller";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";

  // Estados reativos para cada nível
  let nivel1Id = $state<string | null>(null);
  let nivel2Id = $state<string | null>(null);
  let nivel3Id = $state<string | null>(null);

  // Nomes para criação de novas categorias
  let novoNivel1 = $state("");
  let novoNivel2 = $state("");
  let novoNivel3 = $state("");

  // Descrições
  let descricaoNivel1 = $state("");
  let descricaoNivel2 = $state("");
  let descricaoNivel3 = $state("");

  // Categorias existentes
  let categoriasNivel1 = $state<Categoria[]>([]);
  let categoriasNivel2 = $state<Categoria[]>([]);
  let categoriasNivel3 = $state<Categoria[]>([]);

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

  // Carregar dados quando o componente for montado
  onMount(async () => {
    // Verificar se tem ID nos query params (edição)
    const urlParams = new URLSearchParams(page.url.search);
    const categoriaId = urlParams.get("id");

    if (categoriaId) {
      modoEdicao = true;
      categoriaIdEdicao = categoriaId;
      await carregarCategoriaParaEdicao(categoriaId);
    }

    await carregarCategorias();
  });

  async function carregarCategorias() {
    try {
      const todasCategorias = await repoCategoria.find();
      categoriasNivel1 = todasCategorias.filter((c) => c.nivel === 1);
      // As categorias de nível 2 e 3 serão carregadas conforme a seleção do nível 1 e 2
    } catch (err) {
      erro =
        "Erro ao carregar categorias: " +
        (err instanceof Error ? err.message : String(err));
    } finally {
      carregando = false;
    }
  }

  async function carregarCategoriaParaEdicao(categoriaId: string) {
    try {
      const categoria = await repoCategoria.findId(categoriaId);
      if (categoria) {
        // Preencher os campos com os dados da categoria
        if (categoria.nivel === 3 && categoria.categoriaPai?.id) {
          nivel3Id = categoria.id;
          nivel2Id = categoria.categoriaPai.id;

          const nivel2 = await repoCategoria.findId(nivel2Id);
          if (nivel2 && nivel2.categoriaPai?.id) {
            nivel1Id = nivel2.categoriaPai.id;
          }
        } else if (categoria.nivel === 2 && categoria.categoriaPai?.id) {
          nivel2Id = categoria.id;
          nivel1Id = categoria.categoriaPai.id;
        } else if (categoria.nivel === 1) {
          nivel1Id = categoria.id;
        }

        // Carregar categorias filhas conforme necessário
        await atualizarCategoriasNivel2();
        await atualizarCategoriasNivel3();
      } else {
        erro = "Categoria não encontrada";
      }
    } catch (err) {
      erro =
        "Erro ao carregar categoria: " +
        (err instanceof Error ? err.message : String(err));
    }
  }

  async function atualizarCategoriasNivel2() {
    if (nivel1Id) {
      try {
        const todasCategorias = await repoCategoria.find();
        categoriasNivel2 = todasCategorias.filter(
          (cat) => cat.categoriaPai?.id === nivel1Id && cat.nivel === 2
        );
      } catch (err) {
        erro =
          "Erro ao carregar categorias de nível 2: " +
          (err instanceof Error ? err.message : String(err));
      }
    } else {
      categoriasNivel2 = [];
    }
    // Resetar nível 3 quando muda o nível 2
    nivel2Id = null;
    categoriasNivel3 = [];
    nivel3Id = null;
  }

  async function atualizarCategoriasNivel3() {
    if (nivel2Id) {
      try {
        const todasCategorias = await repoCategoria.find();
        categoriasNivel3 = todasCategorias.filter(
          (cat) => cat.categoriaPai?.id === nivel2Id && cat.nivel === 3
        );
      } catch (err) {
        erro =
          "Erro ao carregar categorias de nível 3: " +
          (err instanceof Error ? err.message : String(err));
      }
    } else {
      categoriasNivel3 = [];
    }
    nivel3Id = null;
  }

  async function salvar() {
    try {
      salvando = true;
      erro = null;
      sucesso = null;

      // Validações
      if (!nivel1Id && !novoNivel1.trim()) {
        erro = "Selecione ou crie uma categoria de nível 1";
        return;
      }

      // Se estiver em modo de edição, verificar se a categoria existe
      if (modoEdicao && categoriaIdEdicao) {
        const categoriaExistente =
          await repoCategoria.findId(categoriaIdEdicao);
        if (!categoriaExistente) {
          erro = "Categoria não encontrada";
          return;
        }
      }

      // Criar ou selecionar nível 1
      let nivel1: Categoria;
      if (nivel1Id) {
        const nivel1Temp = await repoCategoria.findId(nivel1Id);
        if (!nivel1Temp) {
          erro = "Categoria de nível 1 não encontrada";
          return;
        }
        nivel1 = nivel1Temp;
      } else {
        // Criar nova categoria de nível 1
        nivel1 = repoCategoria.create();
        nivel1.nome = novoNivel1.trim();
        nivel1.nivel = 1;
        nivel1 = await repoCategoria.save(nivel1);
        // Atualizar caminho
        await CategoriaController.atualizarCaminho(nivel1.id);
        // Atualizar lista de categorias
        categoriasNivel1 = [...categoriasNivel1, nivel1];
      }

      // Criar ou selecionar nível 2
      let nivel2: Categoria | undefined;
      if (nivel2Id) {
        const nivel2Temp = await repoCategoria.findId(nivel2Id);
        if (!nivel2Temp) {
          erro = "Categoria de nível 2 não encontrada";
          return;
        }
        nivel2 = nivel2Temp;
      } else if (novoNivel2.trim()) {
        // Criar nova categoria de nível 2
        nivel2 = repoCategoria.create();
        nivel2.nome = novoNivel2.trim();
        nivel2.nivel = 2;
        nivel2.categoriaPai = nivel1;
        nivel2 = await repoCategoria.save(nivel2);
        // Atualizar caminho
        await CategoriaController.atualizarCaminho(nivel2.id);
        // Atualizar lista de categorias
        categoriasNivel2 = [...categoriasNivel2, nivel2];
      }

      // Criar ou selecionar nível 3
      let nivel3: Categoria | undefined;
      if (nivel3Id) {
        const nivel3Temp = await repoCategoria.findId(nivel3Id);
        if (!nivel3Temp) {
          erro = "Categoria de nível 3 não encontrada";
          return;
        }
        nivel3 = nivel3Temp;
      } else if (novoNivel3.trim()) {
        // Verificar se nível 2 existe, se não, criar um "Geral"
        if (!nivel2) {
          // Criar categoria "Geral" de nível 2
          nivel2 = repoCategoria.create();
          nivel2.nome = "Geral";
          nivel2.nivel = 2;
          nivel2.categoriaPai = nivel1;
          nivel2 = await repoCategoria.save(nivel2);
          // Atualizar caminho
          await CategoriaController.atualizarCaminho(nivel2.id);
          // Atualizar lista de categorias
          categoriasNivel2 = [...categoriasNivel2, nivel2];
        }

        // Criar nova categoria de nível 3
        nivel3 = repoCategoria.create();
        nivel3.nome = novoNivel3.trim();
        nivel3.nivel = 3;
        nivel3.categoriaPai = nivel2;
        nivel3 = await repoCategoria.save(nivel3);
        // Atualizar caminho
        await CategoriaController.atualizarCaminho(nivel3.id);
      }

      // Se estiver em modo de edição, atualizar a categoria existente
      if (modoEdicao && categoriaIdEdicao) {
        // Determinar qual é a categoria que está sendo editada (a de nível mais baixo)
        let categoriaEditada: Categoria;
        if (nivel3) {
          categoriaEditada = nivel3;
        } else if (nivel2) {
          categoriaEditada = nivel2;
        } else {
          categoriaEditada = nivel1;
        }

        sucesso = "Categoria atualizada com sucesso!";
      } else {
        sucesso = "Categoria(s) criada(s) com sucesso!";
      }

      // Voltar para a listagem após 1.5 segundos
      setTimeout(() => {
        goto("/app/categorias");
      }, 1500);
    } catch (err) {
      erro =
        "Erro ao salvar: " + (err instanceof Error ? err.message : String(err));
    } finally {
      salvando = false;
    }
  }

  function limparNiveis() {
    nivel1Id = null;
    nivel2Id = null;
    nivel3Id = null;
    novoNivel1 = "";
    novoNivel2 = "";
    novoNivel3 = "";
    descricaoNivel1 = "";
    descricaoNivel2 = "";
    descricaoNivel3 = "";
    categoriasNivel2 = [];
    categoriasNivel3 = [];
  }
</script>

<div>
  <h1>{modoEdicao ? "Editar Categoria" : "Nova Categoria"}</h1>

  {#if erro}
    <div class="error">
      <strong>Erro:</strong>
      {erro}
    </div>
  {/if}

  {#if sucesso}
    <div class="success">
      <strong>Sucesso:</strong>
      {sucesso}
    </div>
  {/if}

  {#if carregando}
    <p>Carregando...</p>
  {:else}
    <form
      onsubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
    >
      <!-- Nível 1 -->
      <div class="nivel-container">
        <h2>Nível 1 (obrigatório)</h2>
        <div>
          <label for="nivel1">Selecione uma categoria existente:</label>
          <select
            id="nivel1"
            bind:value={nivel1Id}
            onchange={atualizarCategoriasNivel2}
            disabled={salvando}
          >
            <option value={null}>-- Selecione --</option>
            {#each categoriasNivel1 as categoria}
              <option value={categoria.id}>{categoria.nome}</option>
            {/each}
          </select>
        </div>

        <div>
          <label for="novoNivel1">Ou crie uma nova:</label>
          <input
            type="text"
            id="novoNivel1"
            bind:value={novoNivel1}
            disabled={salvando || !!nivel1Id}
            placeholder="Nome da nova categoria"
          />
        </div>

        {#if nivel1Id || novoNivel1}
          <div>
            <label for="descricaoNivel1">Descrição:</label>
            <textarea
              id="descricaoNivel1"
              bind:value={descricaoNivel1}
              disabled={salvando}
              placeholder="Descrição da categoria"
              rows="2"
            ></textarea>
          </div>
        {/if}
      </div>

      <!-- Nível 2 -->
      <div class="nivel-container">
        <h2>Nível 2 (opcional)</h2>
        {#if nivel1Id || novoNivel1}
          <div>
            <label for="nivel2">Selecione uma categoria existente:</label>
            <select
              id="nivel2"
              bind:value={nivel2Id}
              onchange={atualizarCategoriasNivel3}
              disabled={salvando}
            >
              <option value={null}>-- Selecione --</option>
              {#each categoriasNivel2 as categoria}
                <option value={categoria.id}>{categoria.nome}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="novoNivel2">Ou crie uma nova:</label>
            <input
              type="text"
              id="novoNivel2"
              bind:value={novoNivel2}
              disabled={salvando || !!nivel2Id}
              placeholder="Nome da nova categoria"
            />
          </div>

          {#if nivel2Id || novoNivel2}
            <div>
              <label for="descricaoNivel2">Descrição:</label>
              <textarea
                id="descricaoNivel2"
                bind:value={descricaoNivel2}
                disabled={salvando}
                placeholder="Descrição da categoria"
                rows="2"
              ></textarea>
            </div>
          {/if}
        {:else}
          <p>Selecione ou crie uma categoria de nível 1 primeiro</p>
        {/if}
      </div>

      <!-- Nível 3 -->
      <div class="nivel-container">
        <h2>Nível 3 (opcional)</h2>
        {#if nivel1Id || novoNivel1}
          <div>
            <label for="nivel3">Selecione uma categoria existente:</label>
            <select id="nivel3" bind:value={nivel3Id} disabled={salvando}>
              <option value={null}>-- Selecione --</option>
              {#each categoriasNivel3 as categoria}
                <option value={categoria.id}>{categoria.nome}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="novoNivel3">Ou crie uma nova:</label>
            <input
              type="text"
              id="novoNivel3"
              bind:value={novoNivel3}
              disabled={salvando || !!nivel3Id}
              placeholder="Nome da nova categoria"
            />
          </div>

          {#if nivel3Id || novoNivel3}
            <div>
              <label for="descricaoNivel3">Descrição:</label>
              <textarea
                id="descricaoNivel3"
                bind:value={descricaoNivel3}
                disabled={salvando}
                placeholder="Descrição da categoria"
                rows="2"
              ></textarea>
            </div>
          {/if}

          {#if nivel2Id || novoNivel2 || nivel3Id || novoNivel3}
            <div class="preview">
              <h3>Visualização da Hierarquia</h3>
              <p>
                <strong>Caminho completo:</strong>
                {nivel1Id
                  ? categoriasNivel1.find((c) => c.id === nivel1Id)?.nome
                  : novoNivel1}
                {#if nivel2Id || novoNivel2}
                  {" -> "}
                  {nivel2Id
                    ? categoriasNivel2.find((c) => c.id === nivel2Id)?.nome
                    : novoNivel2 || "Geral"}
                {/if}
                {#if nivel3Id || novoNivel3}
                  {" -> "}
                  {nivel3Id
                    ? categoriasNivel3.find((c) => c.id === nivel3Id)?.nome
                    : novoNivel3}
                {/if}
              </p>
            </div>
          {/if}
        {:else}
          <p>Selecione ou crie uma categoria de nível 1 primeiro</p>
        {/if}
      </div>

      <div class="actions">
        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : modoEdicao ? "Atualizar" : "Criar"}
        </button>

        <button type="button" onclick={limparNiveis} disabled={salvando}>
          Limpar
        </button>

        <button
          type="button"
          onclick={() => goto("/app/categorias")}
          disabled={salvando}
        >
          Cancelar
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .nivel-container {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 20px;
    background-color: #f9f9f9;
  }

  .nivel-container h2 {
    margin-top: 0;
    color: #333;
  }

  .nivel-container > div {
    margin-bottom: 12px;
  }

  label {
    display: block;
    margin-bottom: 4px;
    font-weight: bold;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .actions button {
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .actions button[type="submit"] {
    background-color: #007bff;
    color: white;
  }

  .actions button[type="submit"]:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .actions button:not([type="submit"]) {
    background-color: #6c757d;
    color: white;
  }

  .preview {
    margin-top: 16px;
    padding: 12px;
    background-color: #e9ecef;
    border-radius: 4px;
  }

  .error {
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  .success {
    color: #155724;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
  }
</style>
