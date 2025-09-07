<script lang="ts">
  import { remult } from "remult";
  import { Fornecedor } from "$shared/fornecedor/fornecedor.model";
  import { FornecedorController } from "$shared/fornecedor/fornecedor.controller";

  // Estado reativo para armazenar os fornecedores
  let fornecedores = $state<Fornecedor[]>([]);
  let carregando = $state(true);
  let erro = $state<string | null>(null);
  const repoFornecedor = remult.repo(Fornecedor);

  $effect(() => {
    carregando = true;
    console.log("remult.authenticated() :>> ", remult.authenticated());
    repoFornecedor
      .find()
      .then((result) => {
        carregando = false;
        fornecedores = result;
      })
      .catch((err) => {
        console.log("err :>> ", err);
        erro = "Erro ao carregar fornecedores: " + err.message;
        carregando = false;
      });
  });

  // Função para excluir um fornecedor
  async function excluirFornecedor(fornecedor: Fornecedor) {
    if (
      !confirm(
        `Tem certeza que deseja excluir o fornecedor "${fornecedor.razaoSocial}"?`
      )
    ) {
      return;
    }

    try {
      await FornecedorController.excluirFornecedor(fornecedor.id);
      fornecedores = fornecedores.filter((f) => f.id !== fornecedor.id);
    } catch (err) {
      alert(
        "Erro ao excluir fornecedor: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  }

  // Função para formatar documento
  function formatarDocumento(documento: string, tipo: string): string {
    if (!documento) return "";

    const limpo = documento.replace(/\D/g, "");

    if (tipo === "CPF" && limpo.length === 11) {
      return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (tipo === "CNPJ" && limpo.length === 14) {
      return limpo.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }

    return documento;
  }

  // Função para formatar telefone
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
</script>

<div>
  <h1>Listagem de Fornecedores</h1>

  <div>
    <a href="/app/fornecedores/criar_editar">
      <button>Novo Fornecedor</button>
    </a>
  </div>

  {#if erro}
    <div class="error">
      {erro}
    </div>
  {/if}

  {#if carregando}
    <p>Carregando fornecedores...</p>
  {:else}
    <div>
      <h2>Fornecedores</h2>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Razão Social</th>
            <th>Nome Fantasia</th>
            <th>Documento</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Representante</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {#each fornecedores as fornecedor}
            <tr>
              <td><strong>{fornecedor.codigo}</strong></td>
              <td>{fornecedor.razaoSocial}</td>
              <td>{fornecedor.nomeFantasia}</td>
              <td
                >{formatarDocumento(
                  fornecedor.documento,
                  fornecedor.tipoDocumento
                )}</td
              >
              <td>{formatarTelefone(fornecedor.telefonePrincipal)}</td>
              <td>{fornecedor.email}</td>
              <td>{fornecedor.representanteNome}</td>
              <td>
                <a href="/app/fornecedores/criar_editar?id={fornecedor.id}">
                  Editar
                </a>
                <button onclick={() => excluirFornecedor(fornecedor)}>
                  Excluir
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      {#if fornecedores.length === 0}
        <p>Nenhum fornecedor encontrado.</p>
        <a href="/app/fornecedores/criar_editar">Criar primeiro fornecedor</a>
      {/if}
    </div>
  {/if}
</div>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f5f5f5;
  }

  button {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    margin-left: 5px;
    cursor: pointer;
    border-radius: 4px;
  }

  button:hover {
    background-color: #c82333;
  }

  a {
    color: #007bff;
    text-decoration: none;
    margin-right: 10px;
  }

  a:hover {
    text-decoration: underline;
  }

  .error {
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  h1 {
    color: #333;
    margin-bottom: 20px;
  }

  h2 {
    color: #555;
    margin-bottom: 10px;
  }
</style>
