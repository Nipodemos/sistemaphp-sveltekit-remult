<script lang="ts">
  import { remult, type EntityFilter, type FindOptions } from "remult";
  import { Produto } from "$shared/produto/produto.model";
  import { Fornecedor } from "$shared/fornecedor/fornecedor.model";

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
              let codigo = Number(searchTerm.replace("FORN", ""));
              conditions.where = {
                fornecedor: await repoFornecedor.findOne({
                  where: { sequencial: codigo },
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
        `Tem certeza que deseja excluir o produto "${produto.descricao}"?`
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
          (err instanceof Error ? err.message : String(err))
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

<div>
  <h1>Listagem de Produtos</h1>

  <div>
    <a href="/app/produtos/criar_editar">
      <button>Novo Produto</button>
    </a>
  </div>

  <div>
    <select bind:value={searchType}>
      <option value="produto">Produto (código/descrição)</option>
      <option value="fornecedor">Fornecedor (código/descrição)</option>
    </select>
    <input
      type="text"
      bind:value={searchTerm}
      placeholder={searchType === "produto"
        ? "Pesquisar por código ou descrição do produto"
        : "Pesquisar por código ou descrição do fornecedor"}
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
        <button onclick={prevPage} disabled={currentPage === 1}>Anterior</button
        >
        <span>Página {currentPage} de {totalPages}</span>
        <button onclick={nextPage} disabled={currentPage >= totalPages}
          >Próxima</button
        >
      </div>
    {/if}
  {/if}
</div>
