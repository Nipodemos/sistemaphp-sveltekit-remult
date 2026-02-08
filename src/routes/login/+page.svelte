<script lang="ts">
  import type { PageProps } from "./$types";
  import { enhance } from "$app/forms";
  import { User, Lock, LogIn, ShieldAlert } from "@lucide/svelte";

  let { data, form }: PageProps = $props();
  let formulario = $state({
    login: "",
    senha: "",
  });
  let submetendo = $state(false);
</script>

<div
  class="flex min-h-dvh items-center justify-center bg-surface-50-950 p-4 relative overflow-hidden"
>
  <!-- Decorative background elements -->
  <div
    class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-500/10 blur-[100px] pointer-events-none"
  ></div>
  <div
    class="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary-500/10 blur-[100px] pointer-events-none"
  ></div>

  <div
    class="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700"
  >
    <!-- Branding -->
    <div class="mb-10 text-center">
      <div
        class="inline-flex items-center justify-center w-20 h-20 bg-primary-500/10 rounded-2xl text-primary-500 mb-6 shadow-2xl ring-1 ring-primary-500/20 backdrop-blur-sm"
      >
        <LogIn size={40} />
      </div>
      <h1
        class="h1 font-black tracking-tight text-surface-900-100 uppercase italic"
      >
        ERP System
      </h1>
      <p class="text-surface-600-400 mt-2 font-medium">
        Portal de Acesso Inteligente
      </p>
    </div>

    <!-- Login Card -->
    <section
      class="card preset-outlined-surface-200-800 bg-surface-100-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden border-surface-200-800/50"
    >
      <div class="p-8 sm:p-10">
        <form
          method="POST"
          use:enhance={() => {
            submetendo = true;
            return async ({ update }) => {
              await update();
              submetendo = false;
            };
          }}
          class="space-y-6"
        >
          <!-- Username -->
          <label class="label">
            <span
              class="label-text font-bold text-xs uppercase tracking-widest text-surface-600-400 ml-1"
              >Usuário</span
            >
            <div
              class="input-group grid-cols-[auto_1fr] divide-x divide-surface-200-800 overflow-hidden rounded-container focus-within:ring-2 focus-within:ring-primary-500/50 transition-all duration-300"
            >
              <div class="ig-cell preset-tonal text-primary-500">
                <User size={18} />
              </div>
              <input
                name="login"
                type="text"
                placeholder="Nome de usuário"
                class="ig-input px-4 py-3"
                bind:value={formulario.login}
                disabled={submetendo}
                required
                autocomplete="username"
              />
            </div>
          </label>

          <!-- Password -->
          <label class="label">
            <span
              class="label-text font-bold text-xs uppercase tracking-widest text-surface-600-400 ml-1"
              >Senha</span
            >
            <div
              class="input-group grid-cols-[auto_1fr] divide-x divide-surface-200-800 overflow-hidden rounded-container focus-within:ring-2 focus-within:ring-primary-500/50 transition-all duration-300"
            >
              <div class="ig-cell preset-tonal text-primary-500">
                <Lock size={18} />
              </div>
              <input
                name="senha"
                type="password"
                placeholder="••••••••"
                class="ig-input px-4 py-3"
                bind:value={formulario.senha}
                disabled={submetendo}
                required
                autocomplete="current-password"
              />
            </div>
          </label>

          <!-- Error Alert -->
          {#if form?.error}
            <div
              class="alert preset-filled-error flex items-center gap-3 p-4 rounded-container animate-in fade-in slide-in-from-top-2"
            >
              <ShieldAlert size={20} />
              <p class="text-sm font-bold">{form.error}</p>
            </div>
          {/if}

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn preset-filled-primary-500 w-full py-4 text-base font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            disabled={submetendo}
          >
            {#if submetendo}
              <div
                class="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></div>
            {:else}
              <span class="flex items-center justify-center gap-2">
                Entrar no Sistema
                <LogIn size={20} />
              </span>
            {/if}
          </button>
        </form>
      </div>

      <!-- Footer -->
      <footer
        class="bg-surface-200-800/10 p-6 text-center border-t border-surface-200-800/30"
      >
        <p class="text-surface-500 text-xs font-semibold">
          © 2026 Nipodemos • Tecnologia Integrada
        </p>
      </footer>
    </section>

    <!-- Support Link -->
    <div class="mt-8 text-center text-surface-500 text-sm">
      <p>
        Esqueceu sua senha? <button
          class="text-primary-500 font-bold hover:underline transition-all"
          >Contate o administrador</button
        >
      </p>
    </div>
  </div>
</div>
