import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { repo } from "remult";
import { Fornecedor } from "$shared/fornecedor/fornecedor.model";

export const load = (async ({ locals, params }) => {
  // Verificar se o usuário está logado
  if (!locals.permissoesCompletas) {
    throw redirect(302, "/login");
  }

  const id = params.id;

  // Se id for "novo", é criação
  if (id === "novo") {
    // Verificar permissão para criar fornecedores
    if (!locals.permissoesCompletas?.fornecedor?.criar?.temPermissao) {
      throw redirect(302, "/app?error=permissao_negada&tela=fornecedores&acao=criar");
    }
    return { fornecedor: null };
  }

  // Caso contrário, é edição
  // Verificar permissão para editar fornecedores
  if (!locals.permissoesCompletas?.fornecedor?.editar?.temPermissao) {
    throw redirect(302, "/app?error=permissao_negada&tela=fornecedores&acao=editar");
  }

  // Carregar o fornecedor
  const repoFornecedor = repo(Fornecedor);
  try {
    const fornecedor = await repoFornecedor.findId(id);
    if (!fornecedor) {
      throw redirect(302, "/app/fornecedores?error=fornecedor_nao_encontrado");
    }
    return { fornecedor };
  } catch (error) {
    console.error("Erro ao carregar fornecedor:", error);
    throw redirect(302, "/app/fornecedores?error=erro_ao_carregar");
  }
}) satisfies PageServerLoad;
