<script lang="ts">
  import { remult } from "remult";
  import { Fornecedor } from "$shared/fornecedor/fornecedor.model";
  import type { TipoDocumento } from "$shared/fornecedor/fornecedor.model";
  import type { PageProps } from "./$types";
  import { goto } from "$app/navigation";
  import {
    Save,
    ArrowLeft,
    Truck,
    Eraser,
    BadgeCheck,
    FileText,
    MapPinned,
    Phone,
    Mail,
    UserRound,
    CircleAlert,
    CircleCheck,
    Building2,
  } from "@lucide/svelte";
  import { Progress } from "@skeletonlabs/skeleton-svelte";

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

  let salvando = $state(false);
  let erro = $state<string | null>(null);
  let sucesso = $state<string | null>(null);

  const isEditing = $derived(!!data.fornecedor?.id);
  const repoFornecedor = remult.repo(Fornecedor);

  function preencherFormulario(fornecedor: FornecedorPageData | null) {
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
        sucesso = "Fornecedor adicionado com sucesso!";
      }

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

  function aplicarMascaraCEP() {
    const limpo = cep.replace(/\D/g, "");
    if (limpo.length <= 8) {
      cep = limpo.replace(/(\d{5})(\d{3})/, "$1-$2");
    }
  }
</script>

<svelte:head>
  <title>{isEditing ? "Editar" : "Adicionar"} Fornecedor</title>
</svelte:head>

<div class="space-y-6">
  <header class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
    <div class="space-y-3">
      <div class="flex items-center gap-3">
        <button
          onclick={() => goto("/app/fornecedores")}
          class="btn-icon preset-tonal-surface hover:preset-filled-surface-200-800"
          title="Voltar"
        >
          <ArrowLeft size={20} />
        </button>

        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500">
          <Truck size={28} />
        </div>

        <div>
          <h1 class="h2 font-bold">
            {isEditing ? "Editar Fornecedor" : "Adicionar Fornecedor"}
          </h1>
          <p class="text-sm text-surface-600-400">
            {isEditing
              ? "Atualize os dados cadastrais, contato e endereço"
              : "Cadastre um novo fornecedor com informações completas"}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article class="card preset-outlined-surface-200-800 bg-surface-50-950 p-4">
          <p class="text-xs font-bold uppercase tracking-wider text-surface-500">
            Status
          </p>
          <div class="mt-2 flex items-center gap-2">
            <CircleCheck size={18} class="text-primary-500" />
            <span class="font-medium">{isEditing ? "Edição" : "Novo cadastro"}</span>
          </div>
        </article>

        <article class="card preset-outlined-surface-200-800 bg-surface-50-950 p-4">
          <p class="text-xs font-bold uppercase tracking-wider text-surface-500">
            Documento
          </p>
          <div class="mt-2 flex items-center gap-2">
            <FileText size={18} class="text-primary-500" />
            <span class="font-medium">{tipoDocumento}</span>
          </div>
        </article>

        <article class="card preset-outlined-surface-200-800 bg-surface-50-950 p-4">
          <p class="text-xs font-bold uppercase tracking-wider text-surface-500">
            Código
          </p>
          <div class="mt-2 flex items-center gap-2">
            <BadgeCheck size={18} class="text-primary-500" />
            <span class="font-medium">{codigo || "-"}</span>
          </div>
        </article>
      </div>
    </div>
  </header>

  {#if erro}
    <div class="alert preset-filled-error flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
      <CircleAlert size={20} />
      <p>{erro}</p>
    </div>
  {/if}

  {#if sucesso}
    <div class="alert preset-filled-success flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
      <CircleCheck size={20} />
      <p>{sucesso}</p>
    </div>
  {/if}

  {#if salvando}
    <div class="flex flex-col items-center justify-center py-24 space-y-6">
      <Progress value={null} class="w-64">
        <Progress.Track>
          <Progress.Range class="bg-primary-500 animate-[custom-animation_2s_ease-in-out_infinite]" />
        </Progress.Track>
      </Progress>
      <p class="font-medium text-surface-600-400 animate-pulse">
        Salvando fornecedor...
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
      <section class="card overflow-hidden preset-outlined-surface-200-800 bg-surface-50-950">
        <header class="flex items-center gap-2 border-b border-surface-200-800 bg-surface-100-900/10 p-4">
          <Building2 size={18} class="text-primary-500" />
          <h2 class="text-sm font-bold uppercase tracking-wider">
            Informações Básicas
          </h2>
        </header>

        <div class="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
          <label class="label">
            <span class="label-text">Razão Social *</span>
            <div class="input-group grid-cols-[auto_1fr]">
              <div class="ig-cell preset-tonal"><Building2 size={16} /></div>
              <input
                type="text"
                class="ig-input"
                bind:value={razaoSocial}
                disabled={salvando}
                required
                placeholder="Ex: Empresa de Serviços LTDA"
              />
            </div>
          </label>

          <label class="label">
            <span class="label-text">Nome Fantasia *</span>
            <div class="input-group grid-cols-[auto_1fr]">
              <div class="ig-cell preset-tonal"><BadgeCheck size={16} /></div>
              <input
                type="text"
                class="ig-input"
                bind:value={nomeFantasia}
                disabled={salvando}
                required
                placeholder="Ex: Serviços Alpha"
              />
            </div>
          </label>

          <label class="label">
            <span class="label-text">Tipo de Documento *</span>
            <div class="input-group grid-cols-[auto_1fr]">
              <div class="ig-cell preset-tonal"><FileText size={16} /></div>
              <select
                class="ig-select"
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
          </label>

          <label class="label">
            <span class="label-text">{tipoDocumento} *</span>
            <div class="input-group grid-cols-[auto_1fr]">
              <div class="ig-cell preset-tonal"><FileText size={16} /></div>
              <input
                type="text"
                class="ig-input"
                bind:value={documento}
                disabled={salvando}
                oninput={aplicarMascaraDocumento}
                required
                placeholder={tipoDocumento === "CNPJ"
                  ? "00.000.000/0000-00"
                  : "000.000.000-00"}
              />
            </div>
          </label>
        </div>
      </section>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section class="card overflow-hidden preset-outlined-surface-200-800 bg-surface-50-950">
          <header class="flex items-center gap-2 border-b border-surface-200-800 bg-surface-100-900/10 p-4">
            <MapPinned size={18} class="text-primary-500" />
            <h2 class="text-sm font-bold uppercase tracking-wider">
              Endereço
            </h2>
          </header>

          <div class="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            <label class="label md:col-span-2">
              <span class="label-text">Rua</span>
              <div class="input-group grid-cols-[auto_1fr]">
                <div class="ig-cell preset-tonal"><MapPinned size={16} /></div>
                <input type="text" class="ig-input" bind:value={rua} disabled={salvando} placeholder="Ex: Rua das Flores" />
              </div>
            </label>

            <label class="label">
              <span class="label-text">Número</span>
              <div class="input-group grid-cols-[auto_1fr]">
                <div class="ig-cell preset-tonal"><span class="text-xs font-bold">#</span></div>
                <input type="text" class="ig-input" bind:value={numero} disabled={salvando} placeholder="123" />
              </div>
            </label>

            <label class="label">
              <span class="label-text">Complemento</span>
              <input type="text" class="input" bind:value={complemento} disabled={salvando} placeholder="Sala 2, Fundos..." />
            </label>

            <label class="label">
              <span class="label-text">Bairro</span>
              <input type="text" class="input" bind:value={bairro} disabled={salvando} placeholder="Centro" />
            </label>

            <label class="label">
              <span class="label-text">Cidade</span>
              <input type="text" class="input" bind:value={cidade} disabled={salvando} placeholder="São Paulo" />
            </label>

            <label class="label">
              <span class="label-text">Estado</span>
              <input
                type="text"
                class="input uppercase"
                bind:value={estado}
                disabled={salvando}
                maxlength="2"
                placeholder="UF"
              />
            </label>

            <label class="label md:col-span-2">
              <span class="label-text">CEP</span>
              <div class="input-group grid-cols-[auto_1fr]">
                <div class="ig-cell preset-tonal">CEP</div>
                <input
                  type="text"
                  class="ig-input"
                  bind:value={cep}
                  disabled={salvando}
                  oninput={aplicarMascaraCEP}
                  placeholder="00000-000"
                />
              </div>
            </label>
          </div>
        </section>

        <section class="card overflow-hidden preset-outlined-surface-200-800 bg-surface-50-950">
          <header class="flex items-center gap-2 border-b border-surface-200-800 bg-surface-100-900/10 p-4">
            <Phone size={18} class="text-primary-500" />
            <h2 class="text-sm font-bold uppercase tracking-wider">
              Contato
            </h2>
          </header>

          <div class="grid grid-cols-1 gap-6 p-6">
            <label class="label">
              <span class="label-text">Telefone Principal *</span>
              <div class="input-group grid-cols-[auto_1fr]">
                <div class="ig-cell preset-tonal"><Phone size={16} /></div>
                <input
                  type="text"
                  class="ig-input"
                  bind:value={telefonePrincipal}
                  disabled={salvando}
                  oninput={() => aplicarMascaraTelefone("principal")}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </label>

            <label class="label">
              <span class="label-text">Telefone Secundário</span>
              <div class="input-group grid-cols-[auto_1fr]">
                <div class="ig-cell preset-tonal"><Phone size={16} /></div>
                <input
                  type="text"
                  class="ig-input"
                  bind:value={telefoneSecundario}
                  disabled={salvando}
                  oninput={() => aplicarMascaraTelefone("secundario")}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </label>

            <label class="label">
              <span class="label-text">E-mail</span>
              <div class="input-group grid-cols-[auto_1fr]">
                <div class="ig-cell preset-tonal"><Mail size={16} /></div>
                <input
                  type="email"
                  class="ig-input"
                  bind:value={email}
                  disabled={salvando}
                  placeholder="contato@fornecedor.com"
                />
              </div>
            </label>
          </div>
        </section>
      </div>

      <section class="card overflow-hidden preset-outlined-surface-200-800 bg-surface-50-950">
        <header class="flex items-center gap-2 border-b border-surface-200-800 bg-surface-100-900/10 p-4">
          <UserRound size={18} class="text-primary-500" />
          <h2 class="text-sm font-bold uppercase tracking-wider">
            Representante
          </h2>
        </header>

        <div class="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
          <label class="label lg:col-span-1">
            <span class="label-text">Nome</span>
            <div class="input-group grid-cols-[auto_1fr]">
              <div class="ig-cell preset-tonal"><UserRound size={16} /></div>
              <input
                type="text"
                class="ig-input"
                bind:value={representanteNome}
                disabled={salvando}
                placeholder="Nome do responsável"
              />
            </div>
          </label>

          <label class="label">
            <span class="label-text">Telefone</span>
            <div class="input-group grid-cols-[auto_1fr]">
              <div class="ig-cell preset-tonal"><Phone size={16} /></div>
              <input
                type="text"
                class="ig-input"
                bind:value={representanteTelefone}
                disabled={salvando}
                oninput={() => aplicarMascaraTelefone("representante")}
                placeholder="(00) 00000-0000"
              />
            </div>
          </label>

          <label class="label">
            <span class="label-text">E-mail</span>
            <div class="input-group grid-cols-[auto_1fr]">
              <div class="ig-cell preset-tonal"><Mail size={16} /></div>
              <input
                type="email"
                class="ig-input"
                bind:value={representanteEmail}
                disabled={salvando}
                placeholder="representante@fornecedor.com"
              />
            </div>
          </label>
        </div>
      </section>

      <section class="card preset-tonal-primary space-y-3 p-6">
        <h3 class="flex items-center gap-2 font-bold">
          <CircleCheck size={18} />
          Dica rápida
        </h3>
        <p class="text-sm opacity-85">
          O formulário aceita máscara visual, mas os dados são validados na gravação.
          Preencha pelo menos um contato do representante para concluir o cadastro.
        </p>
      </section>

      <footer class="flex flex-col gap-4 pb-12 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onclick={limparFormulario}
          class="btn preset-tonal-surface w-full gap-2 sm:w-auto"
          disabled={salvando}
        >
          <Eraser size={18} />
          <span>Limpar</span>
        </button>

        <button
          type="button"
          onclick={() => goto("/app/fornecedores")}
          class="btn preset-tonal-surface hover:preset-tonal-error w-full sm:w-auto"
          disabled={salvando}
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="btn preset-filled-primary-500 w-full min-w-[160px] gap-2 sm:w-auto"
          disabled={salvando}
        >
          <Save size={18} />
          <span>{isEditing ? "Atualizar Fornecedor" : "Salvar Fornecedor"}</span>
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
