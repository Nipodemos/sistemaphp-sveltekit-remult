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

export interface PesquisaProduto {
  codigoProduto: number | null;
  codigoFornecedor: string | null;
}

export function processarPesquisaProduto(pesquisa: string): PesquisaProduto {
  const resultado: PesquisaProduto = {
    codigoProduto: null,
    codigoFornecedor: null,
  };

  if (!pesquisa.trim()) {
    return resultado;
  }

  // Dividir por underline se houver
  const partes = pesquisa.split('_');

  for (const parte of partes) {
    const trimmed = parte.trim();
    if (!trimmed) continue;

    // Se for só números
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed.replace(/^0+/, '')) || null;
      if (num !== null) {
        resultado.codigoProduto = num;
      }
    }
    // Se começar com P seguido de números
    else if (/^P\d+$/.test(trimmed)) {
      const numStr = trimmed.substring(1);
      const num = parseInt(numStr.replace(/^0+/, '')) || null;
      if (num !== null) {
        resultado.codigoProduto = num;
      }
    }
    // Se começar com F
    else if (trimmed.startsWith('F') && trimmed.length > 1) {
      resultado.codigoFornecedor = trimmed.substring(1);
    }
    // Caso contrário, ignorar ou considerar mal escrito
  }

  return resultado;
}
