<script lang="ts">
  import { remult } from "remult";
  import { Categoria } from "$shared/categoria/categoria.model";
  import { CategoriaController } from "$shared/categoria/categoria.controller";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  // Estados reativos
  let categoriaId = $state<string | null>(null);
  let nome = $state("");
  let descricao = $state("");
  let categoriaPaiId = $state<string | undefined>(undefined);

  let categoriasDisponiveis = $state<Categoria[]>([]);
  let carregando = $state(true);
  let salvando = $state(false);
  let erro = $state<string | null>(null);
  let sucesso = $state<string | null>(null);

  // Derivados
  let modoEdicao = $derived(!!categoriaId);
  let titulo = $derived(modoEdicao ? "Editar Categoria" : "Nova Categoria");

  // Repositório
  const repoCategoria = remult.repo(Categoria);

  // Carregar dados quando o componente for montado
  onMount(async () => {
    // Verificar se tem IDs nos query params
    const urlParams = new URLSearchParams($page.url.search);
    categoriaId = urlParams.get("id");

    await carregarDados();
  });

  async function carregarDados() {
    try {
      carregando = true;
      erro = null;

      // Carregar todas as categorias disponíveis para selecionar como pai
      categoriasDisponiveis =
        await CategoriaController.obterHierarquiaCompleta();

      // Se está editando, carregar os dados da categoria
      if (categoriaId) {
        const categoria = await repoCategoria.findId(categoriaId);
        if (categoria) {
          nome = categoria.nome;
          descricao = categoria.descricao;
          categoriaPaiId = categoria.categoriaPai?.id;
        } else {
          erro = "Categoria não encontrada";
        }
      }
    } catch (err) {
      erro =
        "Erro ao carregar dados: " +
        (err instanceof Error ? err.message : String(err));
    } finally {
      carregando = false;
    }
  }

  async function salvar() {
    try {
      salvando = true;
      erro = null;
      sucesso = null;

      // Validações
      if (!nome.trim()) {
        erro = "Nome é obrigatório";
        return;
      }

      if (modoEdicao && categoriaId) {
        // Editar categoria existente
        await CategoriaController.editarCategoria(
          categoriaId,
          nome.trim(),
          descricao.trim(),
          categoriaPaiId
        );
        sucesso = "Categoria atualizada com sucesso!";
      } else {
        // Criar nova categoria
        await CategoriaController.criarCategoria(
          nome.trim(),
          descricao.trim(),
          categoriaPaiId
        );
        sucesso = "Categoria criada com sucesso!";
      }

      // Voltar para a listagem após 2 segundos
      setTimeout(() => {
        goto("/app/categorias");
      }, 2000);
    } catch (err) {
      erro =
        "Erro ao salvar: " + (err instanceof Error ? err.message : String(err));
    } finally {
      salvando = false;
    }
  }

  async function excluir() {
    if (!categoriaId) return;

    if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    try {
      salvando = true;
      erro = null;

      await CategoriaController.excluirCategoria(categoriaId);
      sucesso = "Categoria excluída com sucesso!";

      // Voltar para a listagem após 1 segundo
      setTimeout(() => {
        goto("/app/categorias");
      }, 1000);
    } catch (err) {
      erro =
        "Erro ao excluir: " +
        (err instanceof Error ? err.message : String(err));
    } finally {
      salvando = false;
    }
  }

  // Filtrar categorias disponíveis para evitar loops (não pode ser pai de si mesmo)
  function getCategoriasFiltradas(): Categoria[] {
    if (!categoriaId) return categoriasDisponiveis;

    return categoriasDisponiveis.filter((cat) => {
      // Não pode selecionar a própria categoria como pai
      if (cat.id === categoriaId) return false;

      // Não pode selecionar uma categoria que é descendente desta
      if (cat.caminhoIds && categoriaId && cat.caminhoIds.includes(categoriaId))
        return false;

      // Só pode selecionar categorias de nível 1 ou 2 (máximo 3 níveis)
      return cat.nivel <= 2;
    });
  }
</script>

<div>
  <h1>{titulo}</h1>

  {#if carregando}
    <p>Carregando...</p>
  {:else}
    <form
      onsubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
    >
      <div>
        <label for="nome">Nome da Categoria:</label>
        <input
          type="text"
          id="nome"
          bind:value={nome}
          required
          disabled={salvando}
          placeholder="Ex: Eletrônicos, Smartphones, etc."
        />
      </div>

      <div>
        <label for="descricao">Descrição:</label>
        <textarea
          id="descricao"
          bind:value={descricao}
          disabled={salvando}
          placeholder="Descrição opcional da categoria"
          rows="3"
        ></textarea>
      </div>

      <div>
        <label for="categoriaPai">Categoria Pai (opcional):</label>
        <select
          id="categoriaPai"
          bind:value={categoriaPaiId}
          disabled={salvando}
        >
          <option value={undefined}>Nenhuma (categoria raiz)</option>
          {#each getCategoriasFiltradas() as categoria}
            <option value={categoria.id}>
              {categoria.caminho} (Nível {categoria.nivel})
            </option>
          {/each}
        </select>
        <small>
          {#if categoriaPaiId}
            {@const categoriaSelecionada = categoriasDisponiveis.find(
              (c) => c.id === categoriaPaiId
            )}
            {#if categoriaSelecionada}
              Esta categoria será nível {categoriaSelecionada.nivel + 1}
            {/if}
          {:else}
            Esta será uma categoria raiz (nível 1)
          {/if}
        </small>
      </div>

      {#if erro}
        <div>
          <strong>Erro:</strong>
          {erro}
        </div>
      {/if}

      {#if sucesso}
        <div>
          <strong>Sucesso:</strong>
          {sucesso}
        </div>
      {/if}

      <div>
        <button type="submit" disabled={salvando || !nome.trim()}>
          {salvando ? "Salvando..." : modoEdicao ? "Atualizar" : "Criar"}
        </button>

        {#if modoEdicao}
          <button type="button" onclick={excluir} disabled={salvando}>
            {salvando ? "Excluindo..." : "Excluir"}
          </button>
        {/if}

        <button
          type="button"
          onclick={() => goto("/app/categorias")}
          disabled={salvando}
        >
          Cancelar
        </button>
      </div>
    </form>

    <div>
      <h3>Visualização da Hierarquia</h3>
      {#if nome.trim()}
        {@const preview = categoriaPaiId
          ? categoriasDisponiveis.find((c) => c.id === categoriaPaiId)
              ?.caminho +
            " / " +
            nome.trim()
          : nome.trim()}
        <p><strong>Caminho completo:</strong> {preview}</p>
      {:else}
        <p>Digite um nome para ver a visualização</p>
      {/if}
    </div>

    <div>
      <h3>Categorias Existentes</h3>
      {#if categoriasDisponiveis.length > 0}
        <table>
          <thead>
            <tr>
              <th>Caminho Completo</th>
              <th>Nível</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {#each categoriasDisponiveis as categoria}
              <tr>
                <td>{categoria.caminho}</td>
                <td>{categoria.nivel}</td>
                <td>
                  <a href="/app/categorias/criar_editar?id={categoria.id}">
                    Editar
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>Nenhuma categoria encontrada.</p>
      {/if}
    </div>
  {/if}
</div>
