import jwt from "jsonwebtoken";
import { Usuario } from "$shared/usuario/usuario.model";
import { AUTH_SECRET } from "$env/static/private";
import { repo } from "remult";

export function createSessionToken(usuarioQuerendoLogar: Usuario): string {
  const dados = repo(Usuario).toJson(usuarioQuerendoLogar);
  return jwt.sign(dados, AUTH_SECRET, { expiresIn: "24h" });
}

export function verifySessionToken(token: string): Usuario | null {
  try {
    const payload = jwt.verify(token, AUTH_SECRET);
    if (typeof payload !== "object" || !payload) {
      return null;
    }

    return payload as Usuario;
  } catch (error) {
    return null;
  }
}
