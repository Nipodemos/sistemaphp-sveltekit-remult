import { remultApi } from "remult/remult-sveltekit";
import { Usuario } from "../routes/app/usuarios/usuario.model";
import { Funcao } from "$lib/enums/Funcao";
import bcrypt from "bcrypt";

export const api = remultApi({
  admin: true,
  entities: [Usuario],
  initApi: async (remult) => {
    const repoUsuario = remult.repo(Usuario);

    const usuarios = await repoUsuario.find({ limit: 1 });
    if (usuarios.length === 0) {
      // Cria um usuário padrão se não existir nenhum
      const usuario = new Usuario();
      usuario.nome = "Administrador";
      usuario.login = "admin";
      usuario.senha = await bcrypt.hash("admin", 10); // Senha criptografada
      usuario.nivelPermissao = Funcao.Master;
      await repoUsuario.insert(usuario);
    }
  },

  getUser: async (event) => {
    if (!event.locals.usuario) {
      return undefined;
    } else {
      return {
        ...event.locals.usuario,
        name: event.locals.usuario.nome,
        roles: [Funcao[event.locals.usuario.nivelPermissao]],
      };
    }
  },
});
