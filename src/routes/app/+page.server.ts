import { redirect, type Actions } from "@sveltejs/kit";

export async function load({ locals }) {
  if (!locals.session) {
    throw redirect(303, "/login");
  }

  return {
    usuario: locals.session.user,
    permissoes: locals.session.user.permissoesCompletas,
  };
}

export const actions = {
  logout: async ({ locals, cookies }) => {
    // Limpa o usuário da sessão
    locals.session = null;
    // Remove o cookie de autenticação, se existir
    cookies.delete("auth", { path: "/" });
    // Redireciona para a página de login
    throw redirect(303, "/login");
  },
} satisfies Actions;
