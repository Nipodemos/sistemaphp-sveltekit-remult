import jwt from "jsonwebtoken";
import { Usuario } from "$shared/usuario/usuario.model";
import { AUTH_SECRET } from "$env/static/private";
import { repo } from "remult";
import {
  desserializarPermissoesDoDB,
  type PermissoesCompletas,
} from "$lib/types/permissoes";
import { createSession } from "./session";

export function createSessionToken(usuarioQuerendoLogar: Usuario): string {
  // Carregar permissões do DB como array
  const permissoesArray = usuarioQuerendoLogar.permissoes ?? [];

  // Desserializar para o formato completo usado pelo cliente
  // Passa os cargos do usuário para verificar se é admin
  const permissoesCompletas: PermissoesCompletas =
    desserializarPermissoesDoDB(permissoesArray, usuarioQuerendoLogar.cargos);

  const payload: App.Locals = {
    usuario: repo(Usuario).toJson(usuarioQuerendoLogar),
    permissoesCompletas,
  };

  // Cria a sessão no servidor e obtém o ID
  const sessionId = createSession(payload);

  // Retorna o JWT contendo apenas o ID da sessão
  return jwt.sign({ sessionId }, AUTH_SECRET, { expiresIn: "24h" });
}

export function verifySessionToken(token: string): { sessionId: string } | null {
  try {
    const payload = jwt.verify(token, AUTH_SECRET) as { sessionId: string };
    return payload;
  } catch (error) {
    return null;
  }
}
