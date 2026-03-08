import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { remult } from "remult";

export const load = (({ locals, url }) => {
  // O hook (hooks.server.ts) já tentou popular `locals.session`.
  // Se o usuário não estiver logado, `locals.session` será `null`.

  if (!locals.session && url.pathname !== "/login") {
    // Lança um redirecionamento para a página de login.
    // Incluímos `from` na URL para que possamos redirecionar de volta após o login.
    throw redirect(303, `/login?redirectTo=${url.pathname}`);
  } else if (url.pathname === "/") {
    throw redirect(303, `/app`);
  }
  return { user: remult.user };
}) satisfies LayoutServerLoad;
