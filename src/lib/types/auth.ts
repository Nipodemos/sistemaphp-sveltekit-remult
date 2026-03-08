import type { PermissoesCompletas } from "$lib/types/permissoes";

export interface SessionUser {
  id: string;
  nome: string;
  login: string;
  cargos: string[];
  permissoesCompletas: PermissoesCompletas;
}

export interface ServerSession {
  user: SessionUser;
}
