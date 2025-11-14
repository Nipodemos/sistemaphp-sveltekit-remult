import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {
  // Verificar se o usuário está logado
  if (!locals.permissoesCompletas) {
    throw redirect(302, "/login");
  }

  // Verificar se é criação ou edição baseado no parâmetro id
  const fornecedorId = url.searchParams.get("id");
  const modoEdicao = !!fornecedorId;

  if (modoEdicao) {
    // Verificar permissão para editar fornecedores
    if (!locals.permissoesCompletas?.fornecedor?.editar?.temPermissao) {
      throw redirect(302, "/app?error=permissao_negada&tela=fornecedores&acao=editar");
    }
  } else {
    // Verificar permissão para criar fornecedores
    if (!locals.permissoesCompletas?.fornecedor?.criar?.temPermissao) {
      throw redirect(302, "/app?error=permissao_negada&tela=fornecedores&acao=criar");
    }
  }

  // Se tiver permissão, continuar normalmente
}) satisfies PageServerLoad;

