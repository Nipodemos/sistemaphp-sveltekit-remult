<script lang="ts">
  import { repo } from "remult";
  import { Usuario } from "$shared/usuario/usuario.model";
  import { Funcao } from "$lib/enums/Funcao";
  import type { PageProps } from "./$types";
  import { enhance } from "$app/forms";
  import type {
    PermissaoCompleta,
    PermissoesCompletas,
    Tela,
  } from "$lib/types/permissoes";
  import { METADADOS_TELAS, desserializarPermissoesDoDB } from "$lib/types/permissoes";

  let { data, form }: PageProps = $props();

  const repoUsuario = repo(Usuario);

  let user = $state<Usuario>(repoUsuario.create());
  let permissoesCompletasUsuario = $state<PermissoesCompletas>(
    desserializarPermissoesDoDB([])
  );
  let confirmPassword = $state("");
  let showPassword = $state(false);

  // Mensagens de feedback
  const message = $derived(form?.success ? form.message : "");
  const error = $derived(form?.error ?? "");

  const isEditing = $derived(!!data.user?.id);

  // Lista de funções disponíveis
  const funcaoValues = Object.values(Funcao);

  // Keys helpers para evitar erros de indexação no template
  const telas = $derived(Object.keys(permissoesCompletasUsuario) as Tela[]);

  function criarUsuarioState(usuario: PageProps["data"]["user"]) {
    return repoUsuario.create(usuario ? repoUsuario.toJson(usuario) : undefined);
  }

  function criarPermissoesState(
    permissoes: PageProps["data"]["permissoesCompletasUsuario"] | null | undefined
  ) {
    return structuredClone(permissoes ?? desserializarPermissoesDoDB([]));
  }

  $effect(() => {
    user = criarUsuarioState(data.user);
    permissoesCompletasUsuario = criarPermissoesState(
      data.permissoesCompletasUsuario
    );
  });

  // Retorna as chaves (regras) de uma tela com tipagem correta
  function regrasDaTela(tela: Tela) {
    return Object.keys(permissoesCompletasUsuario[tela]);
  }

  // Retorna a referência tipada para o objeto de permissão (para bind/alteração)
  function getPermissao(tela: Tela, regra: string): PermissaoCompleta {
    return (permissoesCompletasUsuario[tela] as Record<string, PermissaoCompleta>)[regra];
  }

  function togglePermission(tela: Tela, regra: string, checked: boolean) {
    getPermissao(tela, regra).temPermissao = checked;
  }

  // Informação adicional sobre a permissão (descrição), se existir
  function permissaoInfo(tela: Tela, regra: string) {
    const permissao = METADADOS_TELAS[tela]?.permissoes.find(
      (p) => p.chave === regra
    );
    return permissao ? { descricao: permissao.descricao } : { descricao: "" };
  }
</script>

<svelte:head>
  <title>{isEditing ? "Editar" : "Criar"} Usuário</title>
</svelte:head>

<div>
  <div>
    <h1>{isEditing ? "Editar" : "Criar"} Usuário</h1>
    <a href="/app/usuarios">← Voltar</a>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}
  {#if message}
    <div
      style="background-color: #d4edda; color: #155724; padding: 10px; border: 1px solid #c3e6cb; border-radius: 4px; margin-bottom: 15px;"
    >
      ✅ {message}
    </div>
  {/if}

  <form method="POST" action="?/save" use:enhance>
    {#if isEditing}
      <input type="hidden" name="id" value={user.id} />
    {/if}

    <div>
      <h2>Informações Básicas</h2>

      <div>
        <div>
          <label for="nome">Nome *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            bind:value={user.nome}
            required
            minlength="3"
            placeholder="Digite o nome completo"
          />
        </div>

        <div>
          <label for="login">Login *</label>
          <input
            type="text"
            id="login"
            name="login"
            bind:value={user.login}
            required
            minlength="3"
            placeholder="Digite o login do usuário"
          />
        </div>
      </div>

      <div>
        <div>
          <label for="senha">
            {isEditing ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
          </label>
          <div>
            <input
              type={showPassword ? "text" : "password"}
              id="senha"
              name="senha"
              bind:value={user.senha}
              required={!isEditing}
              minlength="8"
              placeholder={isEditing
                ? "Digite a nova senha (deixe em branco para manter)"
                : "Digite a senha"}
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>
        </div>

        {#if !isEditing}
          <div>
            <label for="confirmPassword">Confirmar Senha *</label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              bind:value={confirmPassword}
              required={!isEditing}
              placeholder="Confirme a senha"
            />
          </div>
        {/if}
      </div>
    </div>

    <div>
      <h2>Cargos</h2>
      <div>
        {#each funcaoValues as funcao}
          <label>
            <input
              type="checkbox"
              name="cargos"
              value={funcao}
              checked={user.cargos?.includes(funcao)}
            />
            <span>{funcao}</span>
          </label>
        {/each}
      </div>
    </div>

    <div>
      <h2>Permissões por Tela</h2>

      {#each telas as tela}
        <div>
          <h3>
            {tela}
          </h3>

          <div>
            {#each regrasDaTela(tela) as regra}
              <label>
                <input
                  type="checkbox"
                  name={`permission_${tela}_${regra}`}
                  checked={getPermissao(tela, regra).temPermissao}
                  onchange={(e) =>
                    togglePermission(tela, regra, e.currentTarget.checked)}
                />
                <span>
                  <strong>{regra}:</strong>
                  {permissaoInfo(tela, regra).descricao}
                </span>
              </label>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div>
      <button type="submit">
        {isEditing ? "Salvar Alterações" : "Criar Usuário"}
      </button>
      <a href="/app/usuarios">Cancelar</a>
    </div>
  </form>
</div>
