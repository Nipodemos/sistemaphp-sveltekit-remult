import { remult } from "remult";
import { Usuario } from "$shared/usuario/usuario.model";
import { PermissaoUsuario } from "$shared/permissao_usuario/permissao_usuario.model";
import { criarObjetoPermissoes } from "$lib/utils/utils";
import { permissoes, type TelaPermissao } from "$lib/types/permissoes";
import { error, fail } from "@sveltejs/kit";

export async function load({ params }: any) {
  const tela = params.tela as TelaPermissao;

  // Validar se a tela existe
  if (!permissoes[tela]) {
    throw error(404, `Tela '${tela}' não encontrada`);
  }

  // Carregar todos os usuários
  const usuarios = await remult.repo(Usuario).find({
    orderBy: { nome: "asc" },
  });

  // Carregar todas as permissões da tela selecionada
  const permissoesTela = await remult.repo(PermissaoUsuario).find({
    where: { tela },
  });

  // Criar um mapa de permissões por usuário
  const permissoesPorUsuario = new Map<string, any[]>();

  for (const permissao of permissoesTela) {
    if (!permissoesPorUsuario.has(permissao.usuarioId)) {
      permissoesPorUsuario.set(permissao.usuarioId, []);
    }
    permissoesPorUsuario.get(permissao.usuarioId)!.push(permissao);
  }

  // Preparar dados para o frontend
  const usuariosComPermissoes = usuarios.map((usuario) => ({
    id: usuario.id,
    nome: usuario.nome,
    login: usuario.login,
    permissoes: criarObjetoPermissoes(
      permissoesPorUsuario.get(usuario.id) || []
    ),
  }));

  return {
    tela,
    nomeTela: tela.charAt(0).toUpperCase() + tela.slice(1),
    usuarios: usuariosComPermissoes,
    permissoesDisponiveis: permissoes[tela],
  };
}

export const actions = {
  salvar: async ({ request, params }: any) => {
    const tela = params.tela as TelaPermissao;

    // Validar se a tela existe
    if (!permissoes[tela]) {
      return fail(404, { error: `Tela '${tela}' não encontrada` });
    }

    try {
      const data = await request.formData();
      const permissoesRepo = remult.repo(PermissaoUsuario);

      // Primeiro, apagar todas as permissões existentes da tela
      await permissoesRepo.deleteMany({
        where: { tela },
      });

      // Processar os dados do formulário
      // O formulário envia dados como: usuario_[id]_[permissao]=on
      const permissoesParaInserir: Array<{
        usuarioId: string;
        tela: TelaPermissao;
        regra: string;
      }> = [];

      for (const [key, value] of data.entries()) {
        if (key.startsWith("usuario_") && value === "on") {
          // Formato: usuario_[usuarioId]_[permissao]
          const parts = key.split("_");
          if (parts.length === 3) {
            const usuarioId = parts[1];
            const permissao = parts[2];

            // Validar se a permissão existe para esta tela
            if ((permissoes[tela] as any)[permissao]) {
              permissoesParaInserir.push({
                usuarioId,
                tela,
                regra: permissao,
              });
            }
          }
        }
      }

      // Inserir as novas permissões
      for (const permissao of permissoesParaInserir) {
        await permissoesRepo.insert(permissao);
      }

      return {
        success: true,
        message: `Permissões da tela ${tela} atualizadas com sucesso para ${permissoesParaInserir.length} permissões`,
      };
    } catch (err) {
      console.error("Erro ao salvar permissões:", err);
      return fail(500, {
        error: "Erro interno do servidor ao salvar permissões",
      });
    }
  },
};
