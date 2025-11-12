import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  // Verificar se o usuário está logado
  if (!locals.permissoesCompletas) {
    throw redirect(302, "/login");
  }

  // Verificar permissão para visualizar fornecedores
  if (!locals.permissoesCompletas.fornecedor?.visualizar?.temPermissao) {
    // Redirecionar para página de erro ou dashboard
    throw redirect(302, "/app?error=permissao_negada");
  }

  // Se tiver permissão, continuar normalmente (dados serão carregados no componente)
};
