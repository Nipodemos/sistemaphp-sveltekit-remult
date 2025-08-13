import { repo } from "remult";
import type { PageServerLoad, Actions } from "./$types";
import { Usuario } from "../usuario.model";
import { PermissaoUsuario } from "../../../../shared/PermissaoUsuario.model";
import { fail } from "@sveltejs/kit";
import {
  permissoes,
  type PermissoesUsuarioInput,
  type TelaPermissao,
} from "$lib/types/permissoes";

export const load: PageServerLoad = async ({ url }) => {
  const id = url.searchParams.get("id");
  let user = undefined;
  let userPermissions: PermissoesUsuarioInput = {};

  if (id) {
    try {
      user = await repo(Usuario).findFirst(
        { id },
        { include: { permissoes: true } }
      );
      if (user) {
        // Carregar permissões do usuário
        const permissoesUsuario = user.permissoes;
        console.log("user.permissoes :>> ", user.permissoes);

        // Organizar permissões por tela
        if (permissoesUsuario) {
          for (const permissao of permissoesUsuario) {
            if (!userPermissions[permissao.tela]) {
              userPermissions[permissao.tela] = [];
            }
            userPermissions[permissao.tela]!.push(permissao.regra as any);
          }
        }
      }
    } catch (error) {
      console.warn("Erro ao carregar usuário ou permissões:", error);
      // Se houver erro ao carregar, continua com dados vazios
      // A página ainda será renderizada, mas sem dados do usuário
    }
  }

  return { user, userPermissions, availablePermissions: permissoes };
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
          user.senha = senha;
        }
        user.cargos = cargos;
        let usuarioAtualizado = await repo(Usuario).save(user);
        console.log("usuarioAtualizado :>> ", usuarioAtualizado);
      } else {
        // Criar novo usuário
        if (!senha || senha.length < 8) {
          return fail(400, { error: "Senha deve ter pelo menos 8 caracteres" });
        }

        user = repo(Usuario).create({
          nome,
          login,
          senha,
          cargos,
        });
        await repo(Usuario).save(user);
      }

      // Salvar permissões
      if (user.id) {
        // Remover permissões existentes
        const existingPermissions = await repo(PermissaoUsuario).find({
          where: { usuarioId: user.id },
        });
        for (const permission of existingPermissions) {
          await repo(PermissaoUsuario).delete(permission);
        }

        // Adicionar novas permissões
        for (const [tela, regras] of Object.entries(permissoes)) {
          const telaKey = tela as TelaPermissao; // Tipagem correta

          for (const regra of Object.keys(regras)) {
            const hasPermission =
              formData.get(`permission_${tela}_${regra}`) === "on";
            if (hasPermission) {
              const permissao = repo(PermissaoUsuario).create({
                usuarioId: user.id,
                tela: telaKey, // Agora tipado corretamente
                regra,
              });
              let permissaoCriada = await repo(PermissaoUsuario).save(
                permissao
              );
              console.log("permissaoCriada :>> ", permissaoCriada);
            }
          }
        }
      }

      // Recarregar as permissões para retornar dados atualizados
      let userPermissions: PermissoesUsuarioInput = {};
      if (user.id) {
        const permissoesUsuario = await repo(PermissaoUsuario).find({
          where: { usuarioId: user.id },
        });

        // Organizar permissões por tela
        for (const permissao of permissoesUsuario) {
          if (!userPermissions[permissao.tela]) {
            userPermissions[permissao.tela] = [];
          }
          userPermissions[permissao.tela]!.push(permissao.regra as any);
        }
      }

      // Retornar todos os dados de volta para a tela
      return {
        success: true,
        message: id
          ? "Usuário atualizado com sucesso!"
          : "Usuário criado com sucesso!",
        user: user,
        userPermissions: userPermissions,
        availablePermissions: permissoes,
      };
    } catch (error) {
      if (error instanceof Response) throw error;
      console.error("Erro ao salvar usuário:", error);
      return fail(500, { error: "Erro interno do servidor" });
    }
  },
};
