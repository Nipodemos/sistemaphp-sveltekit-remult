<script lang="ts">
  import { repo } from "remult";
  import { Usuario } from "../usuario.model";
  import { Funcao } from "$lib/enums/Funcao";
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";
  import type { PermissoesUsuarioInput } from "$lib/types/permissoes";

  interface Props {
    data: PageData & {
      userPermissions: PermissoesUsuarioInput;
      availablePermissions: typeof import("$lib/types/permissoes").permissoes;
    };
    form?: ActionData & { error?: string };
  }

  let { data, form }: Props = $props();

  const isEditing = !!data.user?.id;

  let user = $state<Usuario>(data.user || repo(Usuario).create());
  let confirmPassword = $state("");
  let showPassword = $state(false);
  let userPermissions = $state<PermissoesUsuarioInput>(
    data.userPermissions || {}
  );

  // Se estiver editando, limpar a senha do objeto user para não exibi-la
  if (isEditing && user.senha) {
    user.senha = "";
  }

  const availablePermissions = data.availablePermissions;

  // Lista de funções disponíveis
  const funcaoValues = Object.values(Funcao);

  // Função para verificar se uma permissão está marcada
  function isPermissionChecked(tela: string, regra: string): boolean {
    return (
      userPermissions[tela as keyof PermissoesUsuarioInput]?.includes(
        regra as any
      ) || false
    );
  }

  // Função para toggle de permissão
  function togglePermission(tela: string, regra: string, checked: boolean) {
    const telaKey = tela as keyof PermissoesUsuarioInput;
    if (!userPermissions[telaKey]) {
      userPermissions[telaKey] = [] as any;
    }

    if (checked) {
      if (!userPermissions[telaKey]?.includes(regra as any)) {
        userPermissions[telaKey]?.push(regra as any);
      }
    } else {
      userPermissions[telaKey] = userPermissions[telaKey]?.filter(
        (r: string) => r !== regra
      ) as any;
    }
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

  {#if form?.error}
    <div>
      {form.error}
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

      {#each Object.entries(availablePermissions) as [tela, regras]}
        <div>
          <h3>
            {tela.charAt(0).toUpperCase() + tela.slice(1)}
          </h3>

          <div>
            {#each Object.entries(regras as Record<string, string>) as [regra, descricao]}
              <label>
                <input
                  type="checkbox"
                  name="permission_{tela}_{regra}"
                  checked={isPermissionChecked(tela, regra)}
                  onchange={(e) =>
                    togglePermission(tela, regra, e.currentTarget.checked)}
                />
                <span>
                  <strong>{regra}:</strong>
                  {descricao}
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
