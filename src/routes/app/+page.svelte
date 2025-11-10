<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: ({ usuario, permissoes } = data);
</script>

<h1>Dashboard - Bem-vindo, {usuario.nome}!</h1>

<h2>Todas as permissões do usuário:</h2>
<ul>
  {#each Object.entries(permissoes) as [tela, regras]}
    <li>
      <strong>{tela}:</strong>
      <ul>
        {#each Object.entries(regras) as [regra, detalhes]}
          <li>
            {regra} - {detalhes.descricao} ({detalhes.temPermissao
              ? "Sim"
              : "Não"})
          </li>
        {/each}
      </ul>
    </li>
  {/each}
</ul>

<h2>Verificação específica: Financeiro - Baixar Parcelas</h2>
<p>
  Permissão: {permissoes.financeiro.baixarParcelas.descricao}
  <br />
  Tem permissão: {permissoes.financeiro.baixarParcelas.temPermissao
    ? "Sim"
    : "Não"}
</p>

<form method="POST" action="?/logout" use:enhance>
  <button type="submit">Logout</button>
</form>
