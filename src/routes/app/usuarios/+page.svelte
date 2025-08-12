<script lang="ts">
  import { repo } from "remult";
  import { Usuario } from "./usuario.model";

  let usuarios = $state<Usuario[]>([]);

  $effect(() => {
    repo(Usuario)
      .find()
      .then((u) => (usuarios = u));
  });
</script>

<h1>Lista de usuários</h1>
<button><a href={`/app/usuarios/criar_editar`}>Criar usuário</a></button>

<table>
  <thead>
    <tr>
      <th>Nome</th>
      <th>Nivel permissão</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    {#each usuarios as usuario}
      <tr>
        <td>
          {usuario.nome} <br />
          {usuario.login}
        </td>
        <td>
          {#each usuario.cargos as cargo}
            <span>{cargo}</span>{" "}
          {/each}
        </td>
        <td>
          <a href={`/app/usuarios/criar_editar?id=${usuario.id}`}>Editar</a>
          <a href={`/app/`}>Editar permissões</a>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
