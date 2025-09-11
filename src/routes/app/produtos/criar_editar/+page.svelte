<script lang="ts">
  import { remult } from "remult";
  import { Produto } from "$shared/produto/produto.model";
  import { Categoria } from "$shared/categoria/categoria.model";
  import { Fornecedor } from "$shared/fornecedor/fornecedor.model";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";

  // Estados do formulário
  let descricao = $state("");
  let precoCusto = $state(0);
  let precoVenda = $state(0);
  let categoriaId = $state<string | null>(null);
  let fornecedorId = $state<string | null>(null);

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

  // Repositórios
  const repoProduto = remult.repo(Produto);
  const repoCategoria = remult.repo(Categoria);
  const repoFornecedor = remult.repo(Fornecedor);

  // Carregar dados quando o componente for montado
  onMount(async () => {
    // Verificar se tem ID nos query params (edição)
    const urlParams = new URLSearchParams(page.url.search);
    const produtoId = urlParams.get("id");

    if (produtoId) {
      modoEdicao = true;
      produtoIdEdicao = produtoId;
      await carregarProdutoParaEdicao(produtoId);
    }

    await carregarListas();
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
      const produto = await repoProduto.findId(produtoId);
      if (produto) {
        descricao = produto.descricao;
        precoCusto = produto.precoCusto;
        precoVenda = produto.precoVenda;
        categoriaId = produto.categoria?.id || null;
        fornecedorId = produto.fornecedor?.id || null;
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
      if (!fornecedorId) {
        erro = "Fornecedor é obrigatório";
        return;
      }

      if (precoCusto < 0) {
        erro = "Preço de custo não pode ser negativo";
        return;
      }

      if (precoVenda < 0) {
        erro = "Preço de venda não pode ser negativo";
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

      if (categoriaId) {
        const categoria = await repoCategoria.findId(categoriaId);
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
    categoriaId = null;
    fornecedorId = null;
  }
</script>

<div>
  <h1>{modoEdicao ? "Editar Produto" : "Novo Produto"}</h1>

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
        <label for="descricao">Descrição</label>
        <input
          type="text"
          id="descricao"
          bind:value={descricao}
          disabled={salvando}
        />
      </div>

      <div>
        <label for="precoCusto">Preço de Custo</label>
        <input
          type="number"
          id="precoCusto"
          bind:value={precoCusto}
          disabled={salvando}
          step="0.01"
          min="0"
        />
      </div>

      <div>
        <label for="precoVenda">Preço de Venda</label>
        <input
          type="number"
          id="precoVenda"
          bind:value={precoVenda}
          disabled={salvando}
          step="0.01"
          min="0"
        />
      </div>

      <div>
        <label for="categoria">Categoria</label>
        <select id="categoria" bind:value={categoriaId} disabled={salvando}>
          <option value={null}>-- Selecione --</option>
          {#each categorias as categoria}
            <option value={categoria.id}>{categoria.caminho}</option>
          {/each}
        </select>
      </div>

      <div>
        <label for="fornecedor">Fornecedor</label>
        <select id="fornecedor" bind:value={fornecedorId} disabled={salvando}>
          <option value={null}>-- Selecione --</option>
          {#each fornecedores as fornecedor}
            <option value={fornecedor.id}>{fornecedor.razaoSocial}</option>
          {/each}
        </select>
      </div>

      <div>
        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : modoEdicao ? "Atualizar" : "Criar"}
        </button>

        <button type="button" onclick={limparFormulario} disabled={salvando}>
          Limpar
        </button>

        <button
          type="button"
          onclick={() => goto("/app/produtos")}
          disabled={salvando}
        >
          Cancelar
        </button>
      </div>
    </form>
  {/if}
</div>
