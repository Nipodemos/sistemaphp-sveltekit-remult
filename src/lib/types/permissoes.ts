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
export type PermissoesCompletas = typeof permissoes;

// Função para criar objeto de permissões com base nas permissões ativas do usuário
export function criarObjetoPermissoes(
  permissoesAtivas: PermissoesUsuarioInput
): PermissoesCompletas {
  // Clona o objeto base com todas as permissões como false
  const resultado = JSON.parse(JSON.stringify(permissoes));

  // Ativa as permissões que o usuário tem
  for (const tela in permissoesAtivas) {
    const regras = permissoesAtivas[tela as keyof PermissoesUsuarioInput];
    if (regras && resultado[tela]) {
      for (const regra of regras) {
        if (resultado[tela][regra]) {
          resultado[tela][regra].temPermissao = true;
        }
      }
    }
  }

  return resultado as PermissoesCompletas;
}
