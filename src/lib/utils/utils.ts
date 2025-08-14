import {
  permissoes,
  type PermissoesCompletas,
  type PermissoesUsuarioInput,
} from "$lib/types/permissoes";
import type { PermissaoUsuario } from "$shared/permissaoUsuario/permissaoUsuario.model";

export function criarObjetoPermissoes(
  permissoesUsuarios?: PermissaoUsuario[]
): PermissoesCompletas {
  // Clona o objeto base com todas as permissões como false
  const resultado = JSON.parse(JSON.stringify(permissoes));
  if (!permissoesUsuarios) {
    return resultado;
  }

  for (const permissao of permissoesUsuarios) {
    const tela = permissao.tela as keyof PermissoesCompletas;
    const regra = permissao.regra as keyof PermissoesCompletas[typeof tela];

    if (resultado[tela] && resultado[tela][regra]) {
      resultado[tela][regra].temPermissao = true;
    }
  }

  return resultado as PermissoesCompletas;
}
