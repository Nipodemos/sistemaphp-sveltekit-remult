// Estrutura simplificada: apenas listas de regras por tela
export const permissoes = {
  vendas: [
    "visualizar",
    "criar",
    "editar",
    "deletar",
    "relatorioGerencial",
    "relatorioComissao",
  ],
  estoque: ["visualizar", "criar", "editar", "deletar", "relatorios"],
  financeiro: [
    "visualizar",
    "criar",
    "editar",
    "deletar",
    "baixarParcelas",
    "refaturarParcelas",
  ],
} as const;

// Descrições das telas
export const descricoesTelas: Record<TelaPermissao, string> = {
  vendas: "Gerenciamento de vendas e pedidos",
  estoque: "Controle de produtos e inventário",
  financeiro: "Contas a pagar/receber e lançamentos",
};

// Descrições separadas para manter as informações
export const descricoesPermissoes: {
  [K in TelaPermissao]: { [P in RegraPermissao<K>]: string };
} = {
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
};

// Tipos derivados automaticamente
export type TelaPermissao = keyof typeof permissoes;
export type RegraPermissao<T extends TelaPermissao> =
  (typeof permissoes)[T][number];

// Para permissões completas com temPermissao
export type PermissoesCompletas = {
  readonly [K in TelaPermissao]: {
    readonly [P in RegraPermissao<K>]: {
      readonly descricao: string;
      temPermissao: boolean;
    };
  };
};

// Para input (apenas regras ativas)
export type PermissoesUsuarioInput = {
  [Screen in TelaPermissao]?: RegraPermissao<Screen>[];
};

// Função para iterar com tipagem forte
function forEachPermissao(
  callback: <T extends TelaPermissao>(
    tela: T,
    regras: readonly RegraPermissao<T>[]
  ) => void
) {
  (Object.keys(permissoes) as Array<TelaPermissao>).forEach((tela) => {
    callback(tela, permissoes[tela]);
  });
}

// Função para criar objeto completo de permissões a partir de dados do banco
export function criarObjetoPermissoes(
  permissoesAtivas: PermissoesUsuarioInput
): PermissoesCompletas {
  const resultado = {} as PermissoesCompletas;

  forEachPermissao((tela, regras) => {
    (resultado as any)[tela] = {};
    regras.forEach((regra) => {
      (resultado as any)[tela][regra] = {
        descricao: descricoesPermissoes[tela][regra],
        temPermissao: permissoesAtivas[tela]?.includes(regra) ?? false,
      };
    });
  });

  return resultado;
}
