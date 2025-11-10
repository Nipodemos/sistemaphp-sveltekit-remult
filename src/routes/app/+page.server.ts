import { redirect, type Actions } from "@sveltejs/kit";
import { remult } from "remult";
import { PermissaoUsuario } from "$shared/permissao_usuario/permissao_usuario.model";
import { criarObjetoPermissoes } from "$lib/utils/utils";

export async function load({ locals }) {
  if (!locals.usuario) {
    throw redirect(303, "/login");
  }

  // Buscar permissões do usuário logado
  const permissoesUsuario = await remult.repo(PermissaoUsuario).find({
    where: { usuarioId: locals.usuario.id },
  });

  // Criar objeto completo
  const permissoesCompletas = criarObjetoPermissoes(permissoesUsuario);

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
