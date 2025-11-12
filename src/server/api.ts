import { remultApi } from "remult/remult-sveltekit";
import { Usuario } from "$shared/usuario/usuario.model";
import { entities } from "../shared/entities";
import bcrypt from "bcrypt";
import { PermissionsController } from "$shared/permissao_usuario/permissao_usuario.controller";
import {
  desserializarPermissoesDoDB,
  type PermissoesCompletas,
} from "$lib/types/permissoes";
import { SqlDatabase, type UserInfo } from "remult";
import Database from "better-sqlite3";
import { BetterSqlite3DataProvider } from "remult/remult-better-sqlite3";

export interface UsuarioLogado extends UserInfo {
  id: string;
  nome: string;
  cargos: string[];
  login: string;
  permissions: PermissoesCompletas;
}

export const api = remultApi({
  admin: true,
  entities: entities,
  controllers: [PermissionsController],
  dataProvider: new SqlDatabase(
    new BetterSqlite3DataProvider(new Database("./mydb.sqlite"))
  ),
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

  getUser: async (event): Promise<UserInfo | undefined> => {
    if (!event.locals.usuario) {
      // console.log("🔍 Nenhum usuário em locals");
      return undefined;
    }
    let usuario = event.locals.usuario;

    // Busca as permissões no formato do banco de dados { vendas: ['criar'], ... }
    const permissoesDoDb = usuario.permissoes;

    let permissionsForClient: PermissoesCompletas =
      desserializarPermissoesDoDB(permissoesDoDb);
    // console.log("🔍 Retornando usuário:", event.locals.usuario.nome);
    // Retorna o objeto completo do usuário para a sessão do Remult
    return {
      id: event.locals.usuario.id,
      name: event.locals.usuario.nome,
      roles: event.locals.usuario.cargos,
    };
  },
});
