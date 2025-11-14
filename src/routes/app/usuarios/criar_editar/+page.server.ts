import { repo } from "remult";
import { PermissionsController } from "$shared/permissao_usuario/permissao_usuario.controller";
import type { PageServerLoad, Actions } from "./$types";
import { Usuario } from "$shared/usuario/usuario.model";
import { PermissaoUsuario } from "$shared/permissao_usuario/permissao_usuario.model";
import { fail } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import {
  METADADOS_TELAS,
  type PermissoesCompletas,
  desserializarPermissoesDoDB,
} from "$lib/types/permissoes";

export const load: PageServerLoad = async ({ url,locals }) => {
  const id = url.searchParams.get("id");
  const repoUsuario = repo(Usuario);
  let user = repoUsuario.create();
  let permissoesCompletasUsuario: PermissoesCompletas =
    locals.permissoesCompletas ?? desserializarPermissoesDoDB([]);
  if (id) {
    try {
      let usuarioEncontrado = await repoUsuario.findFirst(
        { id },
        { include: { permissoes: true } }
      );
      if (!usuarioEncontrado) {
        return fail(404, { error: "Usuário não encontrado" });
      }
      user = usuarioEncontrado;

      permissoesCompletasUsuario = desserializarPermissoesDoDB(
        usuarioEncontrado.permissoes ?? []
      );
    } catch (error) {
      console.warn("Erro ao carregar usuário ou permissões:", error);
      // Se houver erro ao carregar, continua com dados vazios
      // A página ainda será renderizada, mas sem dados do usuário
    }
  }

  return { user, permissoesCompletasUsuario };
};

export const actions: Actions = {
  save: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const nome = formData.get("nome") as string;
    const login = formData.get("login") as string;
    const senha = formData.get("senha") as string;
    const cargos = formData.getAll("cargos") as string[];

    // Validações básicas
    if (!nome || nome.length < 3) {
      return fail(400, { error: "Nome deve ter pelo menos 3 caracteres" });
    }

    if (!login || login.length < 3) {
      return fail(400, { error: "Login deve ter pelo menos 3 caracteres" });
    }

    try {
      let user = repo(Usuario).create();

      console.log("id :>> ", id);
      if (id) {
        // Editar usuário existente
        const foundUser = await repo(Usuario).findFirst({ id });
        console.log("foundUser :>> ", foundUser);
        if (!foundUser) {
          return fail(404, { error: "Usuário não encontrado" });
        }
        user = foundUser;
        user.nome = nome;
        user.login = login;
        if (senha && senha.length >= 8) {
          user.senha = await bcrypt.hash("admin", 10); // Senha criptografada;
        }
        user.cargos = cargos;
        let usuarioAtualizado = await repo(Usuario).save(user);
        console.log("usuarioAtualizado :>> ", usuarioAtualizado);
      } else {
        // Criar novo usuário
        if (!senha || senha.length < 8) {
          return fail(400, { error: "Senha deve ter pelo menos 8 caracteres" });
        }

        user.senha = await bcrypt.hash("admin", 10); // Senha criptografada;

        user = repo(Usuario).create({
          nome,
          login,
          senha,
          cargos,
        });
        await repo(Usuario).save(user);
      }

      // Salvar permissões: construir objeto com as novas permissões e delegar
      // para o controller que já contém a lógica de salvar (exclui+insere)
      if (user.id) {
        // Construir PermissoesUsuarioInput a partir do form
        const permissoesNovas: Record<string, string[]> = {};
        for (const [tela, regras] of Object.entries(METADADOS_TELAS)) {
          const selecionadas: string[] = [];
          for (const regra of Object.keys(regras)) {
            if (formData.get(`permission_${tela}_${regra}`) === "on") {
              selecionadas.push(regra);
            }
          }
          if (selecionadas.length) permissoesNovas[tela] = selecionadas;
        }

        // Chama o método do controller para excluir e inserir permissões
        await PermissionsController.salvarPermissoesDoUsuario(
          user.id,
          permissoesNovas as any
        );
      }

      // Recarregar as permissões do DB e gerar o objeto completo com util
      let userPermissions: PermissoesCompletas = JSON.parse(
        JSON.stringify(METADADOS_TELAS)
      );
      let permissoesCompletasUsuario = desserializarPermissoesDoDB([]);
      
      if (user.id) {
        const permissoesUsuario = await repo(PermissaoUsuario).find({
          where: { usuarioId: user.id },
        });
        // usar a função util para criar o objeto final de permissões
        // Também popular userPermissions no shape anterior para compatibilidade
        for (const permissao of permissoesUsuario) {
          const tela = permissao.tela as keyof typeof userPermissions;
          const regra = permissao.regra;
          if ((userPermissions as any)[tela]?.[regra]) {
            (userPermissions as any)[tela][regra].temPermissao = true;
          }
        }
      }

      // Retornar todos os dados de volta para a tela (inclui permissoesCompletasUsuario)
      return {
        success: true,
        message: id
          ? "Usuário atualizado com sucesso!"
          : "Usuário criado com sucesso!",
        user: user,
        userPermissions: userPermissions,
        permissoesCompletasUsuario: permissoesCompletasUsuario,
      };
    } catch (error) {
      if (error instanceof Response) throw error;
      console.error("Erro ao salvar usuário:", error);
      return fail(500, { error: "Erro interno do servidor" });
    }
  },
};
