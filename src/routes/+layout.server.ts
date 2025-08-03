import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {
  // O hook (hooks.server.ts) já tentou popular `locals.usuario`.
  // Se o usuário não estiver logado, `locals.usuario` será `null`.
  console.log("locals.usuario :>> ", locals.usuario?.nome);
  if (!locals.usuario) {
    // Lança um redirecionamento para a página de login.
    // Incluímos `from` na URL para que possamos redirecionar de volta após o login.
    throw redirect(303, `/login?redirectTo=${url.pathname}`);
  } else if (url.pathname === "/") {
    throw redirect(303, `/app`);
  }
  return { usuario: locals.usuario };
}) satisfies LayoutServerLoad;
