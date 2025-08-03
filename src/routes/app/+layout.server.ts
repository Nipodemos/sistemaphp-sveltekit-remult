import { redirect, type Actions } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {
  // O hook (hooks.server.ts) já tentou popular `locals.usuario`.
  // Se o usuário não estiver logado, `locals.usuario` será `null`.
  if (!locals.usuario) {
    // Lança um redirecionamento para a página de login.
    // Incluímos `from` na URL para que possamos redirecionar de volta após o login.
    throw redirect(303, `/login?redirectTo=${url.pathname}`);
  }

  // Se o usuário estiver logado, a função load completa normalmente.
  // As páginas filhas podem agora assumir que `locals.usuario` existe.
  // Você pode até mesmo retornar os dados do usuário para disponibilizá-los
  // para todos os componentes de layout e página dentro de `/sistema`.
  return {
    usuario: locals.usuario,
  };
}) satisfies LayoutServerLoad;
