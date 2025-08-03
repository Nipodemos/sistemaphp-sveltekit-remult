import jwt from "jsonwebtoken";
import { Usuario } from "../routes/sistema/usuarios/Usuario";
import { AUTH_SECRET } from "$env/static/private";

export function createSessionToken(usuarioQuerendoLogar: Usuario): string {
  return jwt.sign(usuarioQuerendoLogar, AUTH_SECRET, { expiresIn: "1h" });
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
