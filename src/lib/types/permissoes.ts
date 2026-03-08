// Tipo base para metadados de permissão (permanece igual)
export interface MetadadoPermissao {
  chave: string;
  descricao: string; // Descrição técnica para tooltips ou documentação
}

export interface MetadadosTela {
  descricao: string;
  permissoes: MetadadoPermissao[];
}

import type { PermissaoUsuario } from "$shared/permissao_usuario/permissao_usuario.model";

export let permissoesExistentes = {
  categorias: {
    visualizar: false,
    adicionar: false,
    editar: false,
    excluir: false,
  },
  fornecedores: {
    visualizar: false,
    adicionar: false,
    editar: false,
    excluir: false,
    relatorio: false,
  },
  permissoesTelas: {
    editar: false,
  },
  produtos: {
    visualizar: false,
    adicionar: false,
    editar: false,
    excluir: false,
  },
  telas: {
    visualizar: false,
    editar: false,
  },
  usuarios: {
    visualizar: false,
    adicionar: false,
    editar: false,
    excluir: false,
  },
  vendas: {
    visualizar: false,
    adicionar: false,
    editar: false,
    excluir: false,
    relatorio: false,
    relatorioComissao: false,
    relatorioVendasMes: false,
  },
  compras: {
    visualizar: false,
    adicionar: false,
    editar: false,
    excluir: false,
    relatorio: false,
  },
  estoque: {
    visualizar: false,
    adicionar: false,
    editar: false,
    excluir: false,
    relatorio: false,
  },
};

export type PermissoesDoUsuario = typeof permissoesExistentes;
export type PermissaoTelaKey = keyof PermissoesDoUsuario;
export type PermissaoRegraKey = {
  [K in PermissaoTelaKey]: keyof PermissoesDoUsuario[K];
}[PermissaoTelaKey] &
  string;

/**
 * Desserializa permissões do banco de dados para objeto completo com descrições (oposto de serializarParaDB).
 * @param permissoesUsuarios - Array de permissões do usuário do DB (opcional)
 * @param isAdmin - Indica se o usuário é administrador. Se true, todas as permissões serão true
 * @returns Objeto de permissões completas com descrições e status
 */
export const desserializarPermissoesDoDB = (
  permissoesUsuarios: PermissaoUsuario[],
  isAdmin: boolean,
): PermissoesDoUsuario => {
  const resultado = { ...permissoesExistentes } as PermissoesDoUsuario;

  // Verifica se o usuário é admin
  console.log(isAdmin);

  if (isAdmin) {
    // Se for admin, retorna todas as permissões como true
    for (const tela in resultado) {
      for (const regra in resultado[tela as PermissaoTelaKey]) {
        resultado[tela as PermissaoTelaKey][regra as PermissaoRegraKey] = true;
      }
    }
    return resultado;
  }

  // Se não for admin, processa as permissões do banco de dados normalmente

  const chavesPermissoesExistentes: PermissaoTelaKey[] = Object.keys(
    permissoesExistentes,
  ) as PermissaoTelaKey[];
  for (const permissaoUsuario of permissoesUsuarios) {
    const tela = permissaoUsuario.tela as PermissaoTelaKey;
    const regra = permissaoUsuario.regra as PermissaoRegraKey;
    if (!chavesPermissoesExistentes.includes(tela)) {
      console.warn(
        `Permissão do banco de dados com tela '${permissaoUsuario.tela}' não existe na fonte da verdade. Ignorando.`,
      );
      continue;
    }
    if (!Object.keys(permissoesExistentes[tela]).includes(regra)) {
      console.warn(
        `Permissão do banco de dados com regra '${permissaoUsuario.regra}' para tela '${permissaoUsuario.tela}' não existe na fonte da verdade. Ignorando.`,
      );
      continue;
    }

    resultado[tela][regra] = permissaoUsuario.permitido;
  }

  return resultado;
};
