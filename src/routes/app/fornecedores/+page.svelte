<script lang="ts">
  import { remult, repo } from "remult";
  import { Fornecedor } from "$shared/fornecedor/fornecedor.model";

  let fornecedores = $state<Fornecedor[]>([]);
  let carregando = $state(true);
  let erro = $state<string | null>(null);
  let totalCount = $state(0);
  const repoFornecedor = remult.repo(Fornecedor);

  let searchTerm = $state("");
  let currentPage = $state(1);
  let pageSize = $state(10);

  let totalPages = $derived(Math.ceil(totalCount / pageSize));

  $effect(() => {
    (async () => {
      try {
        carregando = true;
        erro = null;
        const where = searchTerm
          ? {
              $or: [
                { razaoSocial: { $contains: searchTerm } },
                { nomeFantasia: { $contains: searchTerm } },
                { email: { $contains: searchTerm } },
              ],
            }
          : undefined;
        const result = await repoFornecedor.find({
          limit: pageSize,
          page: currentPage,
          where,
        });
        fornecedores = result;
        totalCount = await repoFornecedor.count(where);
      } catch (err) {
        console.log("err :>> ", err);
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
    } else if (tipo === "CNPJ" && limpo.length === 14) {
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
    } else if (limpo.length === 10) {
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
    if (currentPage > 0) {
      currentPage--;
    }
  }
</script>

<div>
  <h1>Listagem de Fornecedores</h1>

  <div>
    <a href="/app/fornecedores/gerenciar-novo">
      <button>Novo Fornecedor</button>
    </a>
  </div>

  {#if erro}
    <div>{erro}</div>
  {/if}

  {#if carregando}
    <p>Carregando fornecedores...</p>
  {:else}
    <div>
      <h2>Fornecedores</h2>

      <div>
        <input
          type="text"
          placeholder="Pesquisar fornecedores..."
          bind:value={searchTerm}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Razão Social</th>
            <th>Nome Fantasia</th>
            <th>Tipo</th>
            <th>Documento</th>
            <th>Cidade</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Representante</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {#each fornecedores as fornecedor}
            <tr>
              <td>{repo(Fornecedor).fields.codigo.displayValue(fornecedor)}</td>
              <td>{fornecedor.razaoSocial}</td>
              <td>{fornecedor.nomeFantasia}</td>
              <td>{fornecedor.tipoDocumento}</td>
              <td
                >{formatarDocumento(
                  fornecedor.documento,
                  fornecedor.tipoDocumento,
                )}</td
              >
              <td>{fornecedor.cidade}</td>
              <td>{formatarTelefone(fornecedor.telefonePrincipal)}</td>
              <td>{fornecedor.email}</td>
              <td>{fornecedor.representanteNome}</td>
              <td>
                <a href="/app/fornecedores/gerenciar-{fornecedor.id}">Editar</a>
                <button onclick={() => excluirFornecedor(fornecedor)}
                  >Excluir</button
                >
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div>
        <button onclick={prevPage} disabled={currentPage === 1}>Anterior</button
        >
        <span>Página {currentPage} de {totalPages}</span>
        <button onclick={nextPage} disabled={currentPage >= totalPages}
          >Próxima</button
        >
      </div>

      {#if fornecedores.length === 0}
        <p>Nenhum fornecedor encontrado.</p>
        <a href="/app/fornecedores/gerenciar-novo">Criar primeiro fornecedor</a>
      {/if}
    </div>
  {/if}
</div>
