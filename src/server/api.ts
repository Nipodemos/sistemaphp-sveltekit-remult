import { remultApi } from "remult/remult-sveltekit";
import { Usuario } from "../routes/app/usuarios/usuario.model";
import { entities } from "../shared/entities";
import bcrypt from "bcrypt";
import { PermissionsController } from "../shared/PermissaoController";
import {
  createPermissionsCheckObject,
  type UserPermissionsObject,
} from "$lib/types/permissoes";
import type { UserInfo } from "remult";

export interface UsuarioLogado extends UserInfo {
  id: string;
  nome: string;
  cargos: string[];
  login: string;
  permissions: UserPermissionsObject; // Nossa nova estrutura!
}

export const api = remultApi({
  admin: true,
  entities: entities,
  initApi: async (remult) => {
    const repoUsuario = remult.repo(Usuario);

    const usuarios = await repoUsuario.find({ limit: 1 });
    if (usuarios.length === 0) {
      // Cria um usuário padrão se não existir nenhum
      const usuario = new Usuario();
      usuario.nome = "Administrador";
      usuario.login = "admin";
      usuario.senha = await bcrypt.hash("admin", 10); // Senha criptografada
      usuario.cargos = [
        "administrador",
        "supervisor",
        "gerente",
        "vendedor",
        "caixa",
      ];
      await repoUsuario.insert(usuario);
    }
  },

  getUser: async (event): Promise<UsuarioLogado | undefined> => {
    // Se não houver usuário na sessão do SvelteKit, não há usuário Remult
    if (!event.locals.usuario) {
      return undefined;
    }

    // Busca as permissões no formato do banco de dados { vendas: ['criar'], ... }
    const permissoesDoDb = await PermissionsController.getPermissoesDoUsuario(
      event.locals.usuario.id
    );

    // Transforma para o formato que você quer: { vendas: { criar: true, ... } }
    const permissionsForClient = createPermissionsCheckObject(permissoesDoDb);

    // Retorna o objeto completo do usuário para a sessão do Remult
    return {
      id: event.locals.usuario.id,
      name: event.locals.usuario.nome,
      nome: event.locals.usuario.nome,
      roles: event.locals.usuario.cargos,
      cargos: event.locals.usuario.cargos,
      login: event.locals.usuario.login,

      permissions: permissionsForClient,
    };
  },
});
