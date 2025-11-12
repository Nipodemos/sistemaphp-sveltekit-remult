import jwt from "jsonwebtoken";
import { Usuario } from "$shared/usuario/usuario.model";
import { AUTH_SECRET } from "$env/static/private";
import { repo } from "remult";
import {
  desserializarPermissoesDoDB,
  type PermissoesCompletas,
} from "$lib/types/permissoes";

export function createSessionToken(usuarioQuerendoLogar: Usuario): string {
  // Carregar permissões do DB como array
  const permissoesArray = usuarioQuerendoLogar.permissoes;

  // Desserializar para o formato completo usado pelo cliente
  const permissoesCompletas: PermissoesCompletas =
    desserializarPermissoesDoDB(permissoesArray);

  const payload: App.Locals = {
    usuario: repo(Usuario).toJson(usuarioQuerendoLogar),
    permissoesCompletas,
  };

  return jwt.sign(payload, AUTH_SECRET, { expiresIn: "24h" });
}

export function verifySessionToken(token: string): App.Locals | null {
  try {
    const payload = jwt.verify(token, AUTH_SECRET) as App.Locals;
    return payload;
  } catch (error) {
    return null;
  }
}
