<script lang="ts">
  import type { PageProps } from "./$types";
  import { enhance } from "$app/forms";

  let { data, form }: PageProps = $props();
  let formulario = $state({
    login: "",
    senha: "",
  });
</script>

<h1>Login</h1>

<form method="POST" use:enhance>
  <label>
    Nome de usuário
    <input name="login" type="text" value={formulario.login} />
  </label>
  <label>
    Senha
    <input name="senha" type="password" value={formulario.senha} />
  </label>
  <button type="submit">Entrar</button>

  {#if form?.error}
    <p style="color: red;">{form.error}</p>
  {/if}
</form>
