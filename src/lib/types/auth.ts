import type { PermissoesDoUsuario } from "$lib/types/permissoes";

export interface SessionUser {
  id: string;
  nome: string;
  login: string;
  cargos: string[];
  permissoesCompletas: PermissoesDoUsuario;
}

export interface ServerSession {
  user: SessionUser;
}
