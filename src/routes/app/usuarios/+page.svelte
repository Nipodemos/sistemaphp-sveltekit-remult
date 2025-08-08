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
        <td>{usuario.nome}</td>
        <td>{usuario.nivelPermissao}</td>
        <td>
          <a href={`/app/usuarios/cadastrar_usuario?id=${usuario.id}`}>Editar</a
          >
          <a href={`/app/`}>Editar permissões</a>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
