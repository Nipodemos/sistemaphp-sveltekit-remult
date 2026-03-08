import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  // Verificar se o usuário está logado
  if (!locals.session) {
    throw redirect(302, "/login");
  }

  // Verificar permissão para visualizar fornecedores
  if (
    !locals.session.user.permissoesCompletas?.fornecedores?.visualizar
      ?.temPermissao
  ) {
    // Redirecionar para página de erro ou dashboard
    throw redirect(302, "/app?error=permissao_negada&tela=fornecedores");
  }

  // Se tiver permissão, continuar normalmente (dados serão carregados no componente)
};
