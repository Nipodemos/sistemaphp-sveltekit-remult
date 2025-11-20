import { remultApi } from "remult/remult-sveltekit";
import { Usuario } from "$shared/usuario/usuario.model";
import { Tela } from "$shared/tela/tela.model";
import { entities } from "../shared/entities";
import bcrypt from "bcrypt";
import { PermissionsController } from "$shared/permissao_usuario/permissao_usuario.controller";
import { SqlDatabase, type UserInfo } from "remult";
import Database from "better-sqlite3";
import { BetterSqlite3DataProvider } from "remult/remult-better-sqlite3";

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

    // Preencher telas
    const repoTela = remult.repo(Tela);
    const telasParaInserir = [
      {
        nome: "Categorias",
        categoria: "Produtos",
        caminhoUrl: "/app/categorias",
      },
      {
        nome: "Fornecedores",
        categoria: "Produtos",
        caminhoUrl: "/app/fornecedores",
      },
      {
        nome: "Permissões de Telas",
        categoria: "Sistema",
        caminhoUrl: "/app/permissoes_telas",
      },
      { nome: "Produtos", categoria: "Produtos", caminhoUrl: "/app/produtos" },
      { nome: "Telas", categoria: "Sistema", caminhoUrl: "/app/telas" },
      { nome: "Usuários", categoria: "Sistema", caminhoUrl: "/app/usuarios" },
    ];

    for (const tela of telasParaInserir) {
      const existente = await repoTela.findFirst({
        caminhoUrl: tela.caminhoUrl,
      });
      if (!existente) {
        await repoTela.insert(tela);
      }
    }
  },

  getUser: async (event): Promise<UserInfo | undefined> => {
    if (!event.locals.usuario || !event.locals.permissoesCompletas) {
      // console.log("🔍 Nenhum usuário em locals");
      return undefined;
    }

    return {
      id: event.locals.usuario.id,
      name: event.locals.usuario.nome,
      roles: event.locals.usuario.cargos,
      permissoesCompletas: event.locals.permissoesCompletas,
    };
  },
});
