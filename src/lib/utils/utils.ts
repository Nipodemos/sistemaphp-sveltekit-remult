import {
  permissoes,
  type PermissoesCompletas,
  type PermissoesUsuarioInput,
} from "$lib/types/permissoes";
import { Categoria } from "$shared/categoria/categoria.model";
import type { PermissaoUsuario } from "$shared/permissao_usuario/permissao_usuario.model";
import { remult } from "remult";

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

export async function atualizarCaminho(categoriaId: string): Promise<void> {
  const repo = remult.repo(Categoria);
  const categoria = await repo.findId(categoriaId);
  if (!categoria) return;

  const caminhos: string[] = [];
  const ids: string[] = [];

  // Construir caminho completo
  let atual: Categoria | undefined = categoria;
  while (atual) {
    caminhos.unshift(atual.nome);
    ids.unshift(atual.id);

    // Buscar o pai se existir
    if (atual.categoriaPai?.id) {
      const pai = await repo.findId(atual.categoriaPai.id);
      atual = pai || undefined;
    } else {
      atual = undefined;
    }
  }

  categoria.caminho = caminhos.join(" / ");
  categoria.caminhoIds = ids.join(",");

  await repo.save(categoria);
}
