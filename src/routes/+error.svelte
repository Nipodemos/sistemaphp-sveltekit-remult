<script lang="ts">
  import { page } from "$app/state";

  // Verifica se é um erro de permissão
  let isPermissionError = $derived(
    page.error?.message?.includes("permissão") || page.status === 403
  );
</script>

<svelte:head>
  <title>Erro - Sistema</title>
</svelte:head>

<div class="error-container">
  <div class="error-content">
    {#if isPermissionError}
      <h1>🔒 Acesso Negado</h1>
      <p>Você não tem permissão para acessar este recurso.</p>
      <p>Entre em contato com o administrador se precisar de acesso.</p>
    {:else if page.status === 404}
      <h1>📄 Página Não Encontrada</h1>
      <p>A página que você está procurando não existe.</p>
    {:else}
      <h1>⚠️ Algo deu errado</h1>
      <p>Ocorreu um erro inesperado. Tente novamente em alguns instantes.</p>
      {#if page.error?.message}
        <details class="error-details">
          <summary>Detalhes do erro</summary>
          <p>{page.error.message}</p>
        </details>
      {/if}
    {/if}

    <div class="actions">
      <a href="/app" class="btn-primary">Voltar ao Início</a>
      <button onclick={() => history.back()} class="btn-secondary"
        >Voltar</button
      >
    </div>
  </div>
</div>

<style>
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    background-color: #f8f9fa;
  }

  .error-content {
    max-width: 500px;
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #dc3545;
  }

  p {
    margin-bottom: 1rem;
    color: #6c757d;
    line-height: 1.5;
  }

  .error-details {
    margin: 1rem 0;
    text-align: left;
  }

  .error-details summary {
    cursor: pointer;
    color: #007bff;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    border: none;
    cursor: pointer;
  }

  .btn-primary {
    background-color: #007bff;
    color: white;
  }

  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }

  .btn-primary:hover {
    background-color: #0056b3;
  }

  .btn-secondary:hover {
    background-color: #545b62;
  }
</style>
