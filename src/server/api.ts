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
    new BetterSqlite3DataProvider(new Database("./mydb.sqlite")),
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
        permissao: "categorias.visualizar",
      },
      {
        nome: "Fornecedores",
        categoria: "Produtos",
        caminhoUrl: "/app/fornecedores",
        permissao: "fornecedor.visualizar",
      },
      {
        nome: "Permissões de Telas",
        categoria: "Sistema",
        caminhoUrl: "/app/permissoes_telas",
        permissao: "permissoes.visualizar",
      },
      {
        nome: "Produtos",
        categoria: "Produtos",
        caminhoUrl: "/app/produtos",
        permissao: "produtos.visualizar", // Assumindo que produtos faz parte de estoque
      },
      {
        nome: "Telas",
        categoria: "Sistema",
        caminhoUrl: "/app/telas",
        permissao: "telas.visualizar",
      },
      {
        nome: "Usuários",
        categoria: "Sistema",
        caminhoUrl: "/app/usuarios",
        permissao: "usuarios.visualizar", // TODO: Criar permissão especifica para usuários se não houver
      },
    ];

    for (const tela of telasParaInserir) {
      const existente = await repoTela.findFirst({
        caminhoUrl: tela.caminhoUrl,
      });
      if (!existente) {
        await repoTela.insert(tela);
      } else {
        // Se já existe, atualiza APENAS a permissão, mantendo nome e categoria originais
        if (existente.permissao !== tela.permissao) {
          existente.permissao = tela.permissao;
          await repoTela.save(existente);
        }
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
