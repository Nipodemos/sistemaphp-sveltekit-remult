export const permissoes = {
  vendas: {
    visualizar: "Visualizar tela de vendas",
    criar: "Criar novos registros de vendas",
    editar: "Editar vendas existentes",
    deletar: "Excluir registros de vendas",
    relatorioGerencial: "Imprimir relatório gerencial",
    relatorioComissao: "Imprimir relatório de comissões",
  },
  estoque: {
    visualizar: "Visualizar tela de estoque",
    criar: "Criar novos produtos",
    editar: "Editar produtos existentes",
    deletar: "Excluir produtos",
    relatorios: "Gerar relatórios de movimentação",
  },
  financeiro: {
    visualizar: "Visualizar tela do financeiro",
    criar: "Lançar novas contas",
    editar: "Editar lançamentos",
    deletar: "Excluir lançamentos",
    baixarParcelas: "Realizar a baixa de parcelas",
    refaturarParcelas: "Refaturar parcelas vencidas",
  },
} as const; // O "as const" transforma todo o objeto em tipos literais

// --- Tipos Mágicos derivados da nossa Fonte da Verdade ---

// 1. Gera um tipo com todas as telas disponíveis (ex: 'vendas' | 'estoque')
export type TelaPermissao = keyof typeof permissoes;

// 2. Gera um tipo com todas as regras de uma tela específica
// Ex: RegraPermissao<'vendas'> => 'visualizar' | 'criar' | 'editar' | ...
export type RegraPermissao<T extends TelaPermissao> =
  keyof (typeof permissoes)[T];

// 3. Estrutura de dados que o front-end usará para enviar as permissões
// Ex: { vendas: ['visualizar', 'criar'], financeiro: ['baixarParcelas'] }
export type PermissoesUsuarioInput = {
  // O Partial<> torna as telas opcionais, e o array de regras também
  [Screen in TelaPermissao]?: RegraPermissao<Screen>[];
};

export type UserPermissionsObject = {
  [T in TelaPermissao]: {
    [R in RegraPermissao<T>]: boolean;
  };
};

export function createPermissionsCheckObject(
  permissoesDoDb: PermissoesUsuarioInput
): UserPermissionsObject {
  // Inicializa o objeto com todas as permissões como 'false'
  const finalPermissions = {} as UserPermissionsObject;
  for (const tela in permissoes) {
    const telaKey = tela as TelaPermissao;
    finalPermissions[telaKey] = {} as any;
    for (const regra in permissoes[telaKey]) {
      const regraKey = regra as RegraPermissao<typeof telaKey>;
      (finalPermissions[telaKey] as any)[regraKey] = false;
    }
  }

  // Preenche com 'true' para as permissões que o usuário realmente tem
  for (const tela in permissoesDoDb) {
    const telaKey = tela as TelaPermissao;
    const regrasConcedidas = permissoesDoDb[telaKey] || [];
    for (const regra of regrasConcedidas) {
      if (
        finalPermissions[telaKey] &&
        finalPermissions[telaKey][
          regra as keyof (typeof finalPermissions)[typeof telaKey]
        ] !== undefined
      ) {
        (finalPermissions[telaKey] as any)[regra] = true;
      }
    }
  }

  return finalPermissions;
}
