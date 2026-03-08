<script lang="ts">
  import { remult } from "remult";
  import { Fornecedor } from "$shared/fornecedor/fornecedor.model";
  import type { TipoDocumento } from "$shared/fornecedor/fornecedor.model";
  import type { PageProps } from "./$types";
  import { goto } from "$app/navigation";

  let { data }: PageProps = $props();

  type FornecedorPageData = PageProps["data"]["fornecedor"];

  let razaoSocial = $state("");
  let nomeFantasia = $state("");
  let tipoDocumento = $state<TipoDocumento>("CNPJ");
  let documento = $state("");
  let rua = $state("");
  let numero = $state("");
  let complemento = $state("");
  let bairro = $state("");
  let cidade = $state("");
  let estado = $state("");
  let cep = $state("");
  let telefonePrincipal = $state("");
  let telefoneSecundario = $state("");
  let email = $state("");
  let representanteNome = $state("");
  let representanteTelefone = $state("");
  let representanteEmail = $state("");
  let codigo = $state("");

  // Estados da aplicação
  let salvando = $state(false);
  let erro = $state<string | null>(null);
  let sucesso = $state<string | null>(null);

  const isEditing = $derived(!!data.fornecedor?.id);

  // Repositório
  const repoFornecedor = remult.repo(Fornecedor);

  function preencherFormulario(fornecedor: FornecedorPageData) {
    razaoSocial = fornecedor?.razaoSocial ?? "";
    nomeFantasia = fornecedor?.nomeFantasia ?? "";
    tipoDocumento = fornecedor?.tipoDocumento ?? "CNPJ";
    documento = fornecedor?.documento ?? "";
    rua = fornecedor?.rua ?? "";
    numero = fornecedor?.numero ?? "";
    complemento = fornecedor?.complemento ?? "";
    bairro = fornecedor?.bairro ?? "";
    cidade = fornecedor?.cidade ?? "";
    estado = fornecedor?.estado ?? "";
    cep = fornecedor?.cep ?? "";
    telefonePrincipal = fornecedor?.telefonePrincipal ?? "";
    telefoneSecundario = fornecedor?.telefoneSecundario ?? "";
    email = fornecedor?.email ?? "";
    representanteNome = fornecedor?.representanteNome ?? "";
    representanteTelefone = fornecedor?.representanteTelefone ?? "";
    representanteEmail = fornecedor?.representanteEmail ?? "";
    codigo = fornecedor?.codigo ?? "";
  }

  $effect(() => {
    preencherFormulario(data.fornecedor);
  });

  async function salvar() {
    try {
      salvando = true;
      erro = null;
      sucesso = null;

      // Validações básicas no frontend
      if (!razaoSocial.trim()) {
        erro = "Razão social é obrigatória";
        return;
      }

      if (!nomeFantasia.trim()) {
        erro = "Nome fantasia é obrigatório";
        return;
      }

      if (!documento.trim()) {
        erro = "Documento é obrigatório";
        return;
      }

      const fornecedorData = {
        razaoSocial: razaoSocial.trim(),
        nomeFantasia: nomeFantasia.trim(),
        tipoDocumento,
        documento: documento.trim(),
        rua: rua.trim(),
        numero: numero.trim(),
        complemento: complemento.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        cep: cep.trim(),
        telefonePrincipal: telefonePrincipal.trim(),
        telefoneSecundario: telefoneSecundario.trim(),
        email: email.trim(),
        representanteNome: representanteNome.trim(),
        representanteTelefone: representanteTelefone.trim(),
        representanteEmail: representanteEmail.trim(),
      };

      if (isEditing && data.fornecedor?.id) {
        const fornecedor = await repoFornecedor.findId(data.fornecedor.id);
        if (fornecedor) {
          await repoFornecedor.save({ ...fornecedor, ...fornecedorData });
          sucesso = "Fornecedor atualizado com sucesso!";
        } else {
          erro = "Fornecedor não encontrado para atualização.";
        }
      } else {
        await repoFornecedor.insert(fornecedorData);
        sucesso = "Fornecedor criado com sucesso!";
      }

      // Voltar para a listagem após 1.5 segundos
      setTimeout(() => {
        goto("/app/fornecedores");
      }, 1500);
    } catch (err) {
      erro =
        "Erro ao salvar: " + (err instanceof Error ? err.message : String(err));
    } finally {
      salvando = false;
    }
  }

  function limparFormulario() {
    preencherFormulario(null);
  }

  // Função para aplicar máscara ao documento
  function aplicarMascaraDocumento() {
    const limpo = documento.replace(/\D/g, "");

    if (tipoDocumento === "CPF" && limpo.length <= 11) {
      documento = limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (tipoDocumento === "CNPJ" && limpo.length <= 14) {
      documento = limpo.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    }
  }

  // Função para aplicar máscara ao telefone
  function aplicarMascaraTelefone(
    campo: "principal" | "secundario" | "representante",
  ) {
    let valor: string;
    let setter: (value: string) => void;

    if (campo === "principal") {
      valor = telefonePrincipal;
      setter = (v) => (telefonePrincipal = v);
    } else if (campo === "secundario") {
      valor = telefoneSecundario;
      setter = (v) => (telefoneSecundario = v);
    } else {
      valor = representanteTelefone;
      setter = (v) => (representanteTelefone = v);
    }

    const limpo = valor.replace(/\D/g, "");

    if (limpo.length <= 11) {
      if (limpo.length === 11) {
        setter(limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3"));
      } else if (limpo.length === 10) {
        setter(limpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3"));
      }
    }
  }

  // Função para aplicar máscara ao CEP
  function aplicarMascaraCEP() {
    const limpo = cep.replace(/\D/g, "");
    if (limpo.length <= 8) {
      cep = limpo.replace(/(\d{5})(\d{3})/, "$1-$2");
    }
  }
</script>

<svelte:head>
  <title>{isEditing ? "Editar" : "Criar"} Fornecedor</title>
</svelte:head>

<div>
  <div>
    <h1>{isEditing ? "Editar" : "Criar"} Fornecedor</h1>
    <a href="/app/fornecedores">← Voltar</a>
  </div>

  {#if sucesso}
    <div class="success">
      <strong>Sucesso:</strong>
      {sucesso}
    </div>
  {/if}

  <form
    onsubmit={(e) => {
      e.preventDefault();
      salvar();
    }}
  >
    <!-- Informações Básicas -->
    <div class="section">
      <h2>Informações Básicas</h2>

      {#if isEditing && codigo}
        <p><strong>Código:</strong> {codigo}</p>
      {/if}

      <div class="form-group">
        <label for="razaoSocial">Razão Social *</label>
        <input
          type="text"
          id="razaoSocial"
          bind:value={razaoSocial}
          disabled={salvando}
          required
        />
      </div>

      <div class="form-group">
        <label for="nomeFantasia">Nome Fantasia *</label>
        <input
          type="text"
          id="nomeFantasia"
          bind:value={nomeFantasia}
          disabled={salvando}
          required
        />
      </div>

      <div class="form-group">
        <label for="tipoDocumento">Tipo de Documento *</label>
        <select
          id="tipoDocumento"
          bind:value={tipoDocumento}
          disabled={salvando}
          onchange={() => {
            documento = "";
          }}
        >
          <option value="CNPJ">CNPJ</option>
          <option value="CPF">CPF</option>
        </select>
      </div>

      <div class="form-group">
        <label for="documento">{tipoDocumento} *</label>
        <input
          type="text"
          id="documento"
          bind:value={documento}
          disabled={salvando}
          oninput={aplicarMascaraDocumento}
          required
          placeholder={tipoDocumento === "CNPJ"
            ? "00.000.000/0000-00"
            : "000.000.000-00"}
        />
      </div>
    </div>

    <!-- Endereço -->
    <div class="section">
      <h2>Endereço</h2>

      <div class="form-row">
        <div class="form-group">
          <label for="rua">Rua</label>
          <input type="text" id="rua" bind:value={rua} disabled={salvando} />
        </div>

        <div class="form-group">
          <label for="numero">Número</label>
          <input
            type="text"
            id="numero"
            bind:value={numero}
            disabled={salvando}
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="complemento">Complemento</label>
          <input
            type="text"
            id="complemento"
            bind:value={complemento}
            disabled={salvando}
          />
        </div>

        <div class="form-group">
          <label for="bairro">Bairro</label>
          <input
            type="text"
            id="bairro"
            bind:value={bairro}
            disabled={salvando}
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="cidade">Cidade</label>
          <input
            type="text"
            id="cidade"
            bind:value={cidade}
            disabled={salvando}
          />
        </div>

        <div class="form-group">
          <label for="estado">Estado</label>
          <input
            type="text"
            id="estado"
            bind:value={estado}
            disabled={salvando}
            maxlength="2"
            placeholder="UF"
          />
        </div>

        <div class="form-group">
          <label for="cep">CEP</label>
          <input
            type="text"
            id="cep"
            bind:value={cep}
            disabled={salvando}
            oninput={aplicarMascaraCEP}
            placeholder="00000-000"
          />
        </div>
      </div>
    </div>

    <!-- Contato -->
    <div class="section">
      <h2>Contato</h2>

      <div class="form-row">
        <div class="form-group">
          <label for="telefonePrincipal">Telefone Principal</label>
          <input
            type="text"
            id="telefonePrincipal"
            bind:value={telefonePrincipal}
            disabled={salvando}
            oninput={() => aplicarMascaraTelefone("principal")}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div class="form-group">
          <label for="telefoneSecundario">Telefone Secundário</label>
          <input
            type="text"
            id="telefoneSecundario"
            bind:value={telefoneSecundario}
            disabled={salvando}
            oninput={() => aplicarMascaraTelefone("secundario")}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" bind:value={email} disabled={salvando} />
      </div>
    </div>

    <!-- Representante -->
    <div class="section">
      <h2>Representante</h2>

      <div class="form-row">
        <div class="form-group">
          <label for="representanteNome">Nome</label>
          <input
            type="text"
            id="representanteNome"
            bind:value={representanteNome}
            disabled={salvando}
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="representanteTelefone">Telefone</label>
          <input
            type="text"
            id="representanteTelefone"
            bind:value={representanteTelefone}
            disabled={salvando}
            oninput={() => aplicarMascaraTelefone("representante")}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div class="form-group">
          <label for="representanteEmail">Email</label>
          <input
            type="email"
            id="representanteEmail"
            bind:value={representanteEmail}
            disabled={salvando}
          />
        </div>
      </div>
    </div>

    {#if erro}
      <div class="error">
        <strong>Erro:</strong>
        {erro}
      </div>
    {/if}

    <div class="actions">
      <button type="submit" disabled={salvando}>
        {salvando ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
      </button>

      <button type="button" onclick={limparFormulario} disabled={salvando}>
        Limpar
      </button>

      <button
        type="button"
        onclick={() => goto("/app/fornecedores")}
        disabled={salvando}
      >
        Cancelar
      </button>
    </div>
  </form>
</div>

<style>
  .section {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
    background-color: #f9f9f9;
  }

  .section h2 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
  }

  .form-row {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
  }

  .form-group {
    flex: 1;
    margin-bottom: 15px;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
  }

  input,
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 14px;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .actions {
    display: flex;
    gap: 10px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
  }

  .actions button {
    padding: 12px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
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

  h1 {
    color: #333;
    margin-bottom: 20px;
  }
</style>
