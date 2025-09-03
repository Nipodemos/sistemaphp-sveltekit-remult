<script lang="ts">
  import { remult, type FindOptions } from "remult";
  import { Produto } from "$shared/produto/produto.model";

  let produtos = $state<Produto[]>([]);
  let carregando = $state(true);
  let erro = $state<string | null>(null);
  let pesquisa = $state("");
  let pagina = $state(1);
  const repoProduto = remult.repo(Produto);

  $effect(() => {
    carregando = true;
    const query: FindOptions<Produto> = {
      orderBy: { criadoEm: "desc" },
      limit: 10,
      page: pagina,
    };

    if (pesquisa.trim()) {
      query.where = {
        $or: [{ descricao: { $contains: pesquisa } }, { codigo: pesquisa }],
      };
    }

    repoProduto
      .find(query)
      .then((result) => {
        carregando = false;
        produtos = result;
      })
      .catch((err) => {
        erro = "Erro ao carregar produtos: " + err.message;
        carregando = false;
      });
  });

  $effect(() => {
    // Resetar página quando pesquisa muda
    pagina = 1;
  });

  async function excluirProduto(produto: Produto) {
    if (
      !confirm(
        `Tem certeza que deseja excluir o produto "${produto.descricao}"?`
      )
    ) {
      return;
    }

    try {
      await repoProduto.delete(produto.id);
      produtos = produtos.filter((p) => p.id !== produto.id);
    } catch (err) {
      alert(
        "Erro ao excluir produto: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  }

  function paginaAnterior() {
    if (pagina > 1) {
      pagina -= 1;
    }
  }

  function paginaProxima() {
    if (produtos.length === 10) {
      pagina += 1;
    }
  }
</script>

<div>
  <h1>Listagem de Produtos</h1>

  <div>
    <a href="/app/produtos/criar_editar">
      <button>Novo Produto</button>
    </a>
  </div>

  <div>
    <input
      type="text"
      bind:value={pesquisa}
      placeholder="Pesquisar por descrição ou código"
    />
  </div>

  {#if erro}
    <div>{erro}</div>
  {/if}

  {#if carregando}
    <p>Carregando produtos...</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Descrição</th>
          <th>Preço Venda</th>
          <th>Categoria</th>
          <th>Fornecedor</th>
          <th>Criado Em</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {#each produtos as produto}
          <tr>
            <td>{produto.codigo}</td>
            <td>{produto.descricao}</td>
            <td>{produto.precoVenda}</td>
            <td>{produto.categoria?.nome || ""}</td>
            <td>{produto.fornecedor?.razaoSocial || ""}</td>
            <td>{produto.criadoEm?.toLocaleDateString() || ""}</td>
            <td>
              <a href={"/app/produtos/criar_editar?id=" + produto.id}>Editar</a>
              <button onclick={() => excluirProduto(produto)}>Excluir</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if produtos.length === 0}
      <p>Nenhum produto encontrado.</p>
    {/if}

    {#if produtos.length > 0}
      <div>
        <button onclick={paginaAnterior} disabled={pagina === 1}
          >Anterior</button
        >
        <span>Página {pagina}</span>
        <button onclick={paginaProxima} disabled={produtos.length < 10}
          >Próxima</button
        >
      </div>
    {/if}
  {/if}
</div>
