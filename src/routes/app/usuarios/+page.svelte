<script lang="ts">
  import { repo } from "remult";
  import { Usuario } from "../../../shared/usuario/usuario.model";
  import { Pencil, Trash, Plus } from "@lucide/svelte";

  let usuarios = $state<Usuario[]>([]);

  $effect(() => {
    repo(Usuario)
      .find()
      .then((u) => (usuarios = u));
  });

  async function deleteUser(id: string) {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      await repo(Usuario).delete(id);
      usuarios = await repo(Usuario).find();
    }
  }
</script>

<div class="card p-4 preset-filled-surface-100-900">
  <header class="flex justify-between items-center mb-4">
    <h1 class="h1">Lista de usuários</h1>
    <a
      href="/app/usuarios/criar_editar?id=novo"
      class="btn preset-filled-primary"
    >
      <Plus class="size-4" />
      Adicionar usuário
    </a>
  </header>
  <div>
    <div class="table-wrap">
      <table class="table caption-bottom">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Login</th>
            <th>Nível de permissão</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody class="[&>tr]:hover:preset-tonal-primary">
          {#each usuarios as usuario}
            <tr>
              <td class="font-medium">{usuario.nome}</td>
              <td>{usuario.login}</td>
              <td>
                <div class="flex flex-wrap gap-1">
                  {#each usuario.cargos as cargo}
                    <span class="badge preset-filled-surface-200-800"
                      >{cargo}</span
                    >
                  {/each}
                </div>
              </td>
              <td>
                <div class="flex gap-2">
                  <a
                    class="btn preset-filled-primary size-sm"
                    href={`/app/usuarios/criar_editar?id=${usuario.id}`}
                  >
                    <Pencil class="size-4" />
                    Editar
                  </a>
                  <button
                    class="btn preset-filled-error size-sm"
                    type="button"
                    onclick={() => deleteUser(usuario.id)}
                  >
                    <Trash class="size-4" />
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
