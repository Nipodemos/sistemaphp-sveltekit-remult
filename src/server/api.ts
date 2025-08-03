import { remultApi } from "remult/remult-sveltekit";
import { Usuario } from "../routes/sistema/usuarios/Usuario";
import { Funcao } from "$lib/enums/Funcao";

export const api = remultApi({
  admin: true,
  entities: [Usuario],
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
