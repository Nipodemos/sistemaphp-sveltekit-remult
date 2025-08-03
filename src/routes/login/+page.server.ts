import { fail, redirect } from "@sveltejs/kit";
import { createSessionToken } from "../../server/auth";
import bcrypt from "bcrypt";
import type { Actions } from "./$types";
import { repo } from "remult";
import { Usuario } from "../sistema/usuarios/Usuario";

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const login = data.get("login") as string;
    const senha = data.get("senha") as string;

    if (!login || !senha) {
      return fail(400, { login, error: "Login e senha são obrigatórios." });
    }

    const user = await repo(Usuario).findFirst({
      login,
    });
    if (!user) {
      return fail(401, { login, error: "Usuário não encontrado." });
    }
    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return fail(401, { login, error: "Senha inválida." });
    }

    // Cria o token da sessão
    const token = createSessionToken(user);

    // Define o cookie
    cookies.set("session_token", token, {
      path: "/",
      httpOnly: true, // O cookie não é acessível via JS no cliente
      secure: process.env.NODE_ENV === "production", // Use secure em produção
      maxAge: 60 * 60, // 1 hora
    });

    // Redireciona para a página de perfil
    throw redirect(303, "/profile");
  },
};
