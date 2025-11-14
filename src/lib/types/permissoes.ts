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

// Configuração central: adicione telas aqui e pronto!
// Para iterar em telas: Object.keys(METADADOS_TELAS)
// Para iterar em permissões de uma tela: METADADOS_TELAS[tela].permissoes
export const METADADOS_TELAS = {
  vendas: {
    nome: "Gerenciamento de Vendas",
    permissoes: [
      {
        chave: "visualizar",
        descricao: "Consultar vendas",
      },
      {
        chave: "criar",
        descricao: "Inserir nova venda",
      },
      {
        chave: "editar",
        descricao: "Editar venda existente",
      },

      {
        chave: "relatorio",
        descricao: "Gerar relatório geral de vendas",
      },
      {
        chave: "relatorioComissao",
        descricao: "Imprimir relatório de comissões",
      },
      {
        chave: "relatorioVendasMes",
        descricao: "Imprimir relatório de vendas por mês",
      },
    ],
  },
  compras: {
    nome: "Gerenciamento de Compras",
    permissoes: [
      {
        chave: "visualizar",
        descricao: "Consultar compras",
      },
      {
        chave: "criar",
        descricao: "Inserir nova compra",
      },
      {
        chave: "editar",
        descricao: "Editar compra existente",
      },
      {
        chave: "excluir",
        descricao: "Excluir compra",
      },
      {
        chave: "relatorio",
        descricao: "Gerar relatório geral de compras",
      },
      // Sem customizações por enquanto
    ],
  },
  estoque: {
    nome: "Gerenciamento de Estoque",
    permissoes: [
      {
        chave: "visualizar",
        descricao: "Consultar estoque",
      },
      {
        chave: "criar",
        descricao: "Inserir item no estoque",
      },
      {
        chave: "editar",
        descricao: "Editar item do estoque",
      },
      {
        chave: "excluir",
        descricao: "Excluir item do estoque",
      },
      {
        chave: "relatorio",
        descricao: "Gerar relatório de estoque",
      },
    ],
  },
  financeiro: {
    nome: "Gerenciamento Financeiro",
    permissoes: [
      {
        chave: "visualizar",
        descricao: "Consultar lançamentos financeiros",
      },
      {
        chave: "criar",
        descricao: "Inserir novo lançamento",
      },
      {
        chave: "editar",
        descricao: "Editar lançamento existente",
      },
      {
        chave: "excluir",
        descricao: "Excluir lançamento",
      },
      {
        chave: "relatorio",
        descricao: "Gerar relatório financeiro geral",
      },
      {
        chave: "refaturamentoParcelas",
        descricao: "Permitir refaturamento de parcelas",
      },
    ],
  },
  // Exemplo de nova tela: só adicione aqui!
  assistencia: {
    nome: "Gerenciamento de Assistência Técnica",
    permissoes: [
      {
        chave: "visualizar",
        descricao: "Consultar chamados de assistência",
      },
      {
        chave: "criar",
        descricao: "Abrir novo chamado",
      },
      {
        chave: "editar",
        descricao: "Editar chamado existente",
      },
      {
        chave: "excluir",
        descricao: "Encerrar chamado",
      },
      {
        chave: "relatorio",
        descricao: "Gerar relatório de assistências",
      },
      {
        chave: "agendarVisita",
        descricao: "Permitir agendamento de visitas técnicas",
      }, // Custom
    ],
  },
  fornecedor: {
    nome: "Gerenciamento de Fornecedores",
    permissoes: [
      {
        chave: "visualizar",
        descricao: "Consultar fornecedores",
      },
      {
        chave: "criar",
        descricao: "Inserir novo fornecedor",
      },
      {
        chave: "editar",
        descricao: "Editar fornecedor existente",
      },
      {
        chave: "excluir",
        descricao: "Excluir fornecedor",
      },
      {
        chave: "relatorio",
        descricao: "Gerar relatório de fornecedores",
      },
    ],
  },
} as const; // 'as const' para inferência literal forte

// Tipos derivados automaticamente (sem duplicação!)
// Tela é inferida das chaves do METADADOS_TELAS
export type Tela = keyof typeof METADADOS_TELAS;

// Permissões por tela: mapeia as chaves exatas dos metadados para boolean
export type PermissoesPorTela<T extends Tela> = {
  [K in (typeof METADADOS_TELAS)[T]["permissoes"][number]["chave"]]: boolean;
};

// Permissões do usuário: Record de telas para suas permissões específicas
export type PermissoesDoUsuario = {
  [T in Tela]: PermissoesPorTela<T>;
};

// Tipo para permissões completas com descrições (para UI)
export type PermissoesCompletas = {
  [T in Tela]: {
    [K in (typeof METADADOS_TELAS)[T]["permissoes"][number]["chave"]]: {
      descricao: string;
      temPermissao: boolean;
    };
  };
};

// Funções utilitárias para trabalhar com permissões

/**
 * Verifica se um usuário tem uma permissão específica.
 * @param permissoes - Objeto de permissões do usuário
 * @param tela - Nome da tela (ex.: 'vendas')
 * @param chave - Chave da permissão (ex.: 'criar')
 * @returns true se o usuário tem a permissão, false caso contrário
 */
export const hasPermission = <T extends Tela>(
  permissoes: PermissoesDoUsuario,
  tela: T,
  chave: keyof PermissoesPorTela<T>
): boolean => {
  return permissoes[tela]?.[chave] ?? false;
};

/**
 * Retorna a descrição de uma permissão para montar mensagens de erro.
 * @param tela - Nome da tela
 * @param chave - Chave da permissão
 * @returns Descrição da permissão ou string vazia se não encontrada
 */
export const getPermissionDescription = (tela: Tela, chave: string): string => {
  const permissao = METADADOS_TELAS[tela]?.permissoes.find(
    (p) => p.chave === chave
  );
  return permissao ? permissao.descricao : "";
};

/**
 * Retorna uma lista plana de todas as permissões com tela associada para facilitar iteração.
 * Útil para telas de gerenciamento de permissões.

 */
export const getAllPermissoes = () => {
  return Object.entries(METADADOS_TELAS).flatMap(([tela, { permissoes }]) =>
    permissoes.map((p) => ({ tela: tela as Tela, ...p }))
  );
};

// Função helper para acessar valor de permissão com tipagem forte
export function obterValorPermissao<T extends Tela>(
  permissoes: PermissoesDoUsuario,
  tela: T,
  chave: (typeof METADADOS_TELAS)[T]["permissoes"][number]["chave"]
): boolean {
  return permissoes[tela][chave];
}
// Serializa permissões para formato de array (para DB)
export const serializarParaDB = (
  permissoes: PermissoesDoUsuario
): Array<{ tela: Tela; chave: string; permitido: boolean }> => {
  const resultado: Array<{ tela: Tela; chave: string; permitido: boolean }> =
    [];
  (Object.keys(METADADOS_TELAS) as Tela[]).forEach((tela) => {
    METADADOS_TELAS[tela].permissoes.forEach(({ chave }) => {
      resultado.push({
        tela,
        chave,
        permitido: hasPermission(
          permissoes,
          tela,
          chave as keyof PermissoesPorTela<typeof tela>
        ),
      });
    });
  });
  return resultado;
};

/**
 * Desserializa permissões do banco de dados para objeto completo com descrições (oposto de serializarParaDB).
 * @param permissoesUsuarios - Array de permissões do usuário do DB (opcional)
 * @returns Objeto de permissões completas com descrições e status
 */
export const desserializarPermissoesDoDB = (
  permissoesUsuarios: PermissaoUsuario[]
): PermissoesCompletas => {
  const resultado = {} as PermissoesCompletas;

  // Inicializar todas as permissões como false
  (Object.keys(METADADOS_TELAS) as Tela[]).forEach((tela) => {
    (resultado as any)[tela] = {};
    METADADOS_TELAS[tela].permissoes.forEach(({ chave, descricao }) => {
      (resultado as any)[tela][chave] = {
        descricao,
        temPermissao: false,
      };
    });
  });

  if (!permissoesUsuarios) {
    return resultado;
  }

  // Marcar as permissões ativas como true
  permissoesUsuarios.forEach((permissao) => {
    const tela = permissao.tela;
    const regra = permissao.regra;
    if (
      resultado[tela] &&
      resultado[tela][regra as keyof (typeof resultado)[typeof tela]]
    ) {
      resultado[tela][
        regra as keyof (typeof resultado)[typeof tela]
      ].temPermissao = permissao.permitido;
    }
  });

  return resultado;
};
