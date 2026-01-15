import { redirect, type Actions } from "@sveltejs/kit";

export async function load({ locals }) {
  if (!locals.usuario) {
    throw redirect(303, "/login");
  }

  // Criar objeto completo
  const permissoesCompletas = locals.permissoesCompletas;

  return {
    usuario: locals.usuario,
    permissoes: permissoesCompletas,
  };
}

export const actions = {
  logout: async ({ locals, cookies }) => {
    // Limpa o usuário da sessão
    locals.usuario = null;
    // Remove o cookie de autenticação, se existir
    cookies.delete("auth", { path: "/" });
    // Redireciona para a página de login
    throw redirect(303, "/login");
  },
} satisfies Actions;
