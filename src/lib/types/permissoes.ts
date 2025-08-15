export const permissoes = {
  vendas: {
    visualizar: {
      descricao: "Visualizar tela de vendas",
      temPermissao: false,
    },
    criar: {
      descricao: "Criar novos registros de vendas",
      temPermissao: false,
    },
    editar: {
      descricao: "Editar vendas existentes",
      temPermissao: false,
    },
    deletar: {
      descricao: "Excluir registros de vendas",
      temPermissao: false,
    },
    relatorioGerencial: {
      descricao: "Imprimir relatório gerencial",
      temPermissao: false,
    },
    relatorioComissao: {
      descricao: "Imprimir relatório de comissões",
      temPermissao: false,
    },
  },
  estoque: {
    visualizar: {
      descricao: "Visualizar tela de estoque",
      temPermissao: false,
    },
    criar: {
      descricao: "Criar novos produtos",
      temPermissao: false,
    },
    editar: {
      descricao: "Editar produtos existentes",
      temPermissao: false,
    },
    deletar: {
      descricao: "Excluir produtos",
      temPermissao: false,
    },
    relatorios: {
      descricao: "Gerar relatórios de movimentação",
      temPermissao: false,
    },
  },
  financeiro: {
    visualizar: {
      descricao: "Visualizar tela do financeiro",
      temPermissao: false,
    },
    criar: {
      descricao: "Lançar novas contas",
      temPermissao: false,
    },
    editar: {
      descricao: "Editar lançamentos",
      temPermissao: false,
    },
    deletar: {
      descricao: "Excluir lançamentos",
      temPermissao: false,
    },
    baixarParcelas: {
      descricao: "Realizar a baixa de parcelas",
      temPermissao: false,
    },
    refaturarParcelas: {
      descricao: "Refaturar parcelas vencidas",
      temPermissao: false,
    },
  },
} as const;

// Tipos muito mais simples
export type TelaPermissao = keyof typeof permissoes;
export type RegraPermissao<T extends TelaPermissao> =
  keyof (typeof permissoes)[T];

// Para quando você precisar enviar apenas as permissões ativas (banco de dados)
export type PermissoesUsuarioInput = {
  [Screen in TelaPermissao]?: RegraPermissao<Screen>[];
};

// Tipo final completo com todas as permissões (temPermissao: boolean)
// Tipo final completo com todas as permissões (temPermissao: boolean)
// Construído a partir do `permissoes` mas removendo `readonly`, para que
// `temPermissao` possa ser mutável sempre que essa tipagem for usada.
// Apenas `temPermissao` é mutável; as chaves e `descricao` permanecem readonly.
export type PermissoesCompletas = {
  readonly [K in keyof typeof permissoes]: {
    readonly [P in keyof (typeof permissoes)[K]]: {
      readonly descricao: string;
      temPermissao: boolean; // mutável
    };
  };
};

// Função para criar objeto de permissões com base nas permissões ativas do usuário
