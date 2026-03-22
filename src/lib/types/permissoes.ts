import type { PermissaoUsuario } from "$shared/permissao_usuario/permissao_usuario.model";

type DefinicaoTela = {
  nome: string;
  descricao: string;
  permissoes: Record<string, string>;
};

const DEFINICOES_TELAS = {
  categorias: {
    nome: "Categorias",
    descricao: "Permissoes relacionadas ao cadastro e manutencao de categorias.",
    permissoes: {
      visualizar: "Visualizar categorias cadastradas.",
      adicionar: "Adicionar novas categorias.",
      editar: "Editar categorias existentes.",
      excluir: "Excluir categorias.",
    },
  },
  fornecedores: {
    nome: "Fornecedores",
    descricao: "Permissoes relacionadas ao cadastro e manutencao de fornecedores.",
    permissoes: {
      visualizar: "Visualizar fornecedores cadastrados.",
      adicionar: "Adicionar novos fornecedores.",
      editar: "Editar fornecedores existentes.",
      excluir: "Excluir fornecedores.",
      relatorio: "Emitir relatorios de fornecedores.",
    },
  },
  permissoesTelas: {
    nome: "Permissoes de Telas",
    descricao: "Permissoes para administrar o acesso de usuarios por tela.",
    permissoes: {
      editar: "Editar permissoes por tela para os usuarios.",
    },
  },
  produtos: {
    nome: "Produtos",
    descricao: "Permissoes relacionadas ao cadastro e manutencao de produtos.",
    permissoes: {
      visualizar: "Visualizar produtos cadastrados.",
      adicionar: "Adicionar novos produtos.",
      editar: "Editar produtos existentes.",
      excluir: "Excluir produtos.",
    },
  },
  telas: {
    nome: "Telas",
    descricao: "Permissoes relacionadas ao cadastro e manutencao das telas do sistema.",
    permissoes: {
      visualizar: "Visualizar telas cadastradas.",
      editar: "Editar configuracoes das telas.",
    },
  },
  usuarios: {
    nome: "Usuarios",
    descricao: "Permissoes relacionadas ao cadastro e manutencao de usuarios.",
    permissoes: {
      visualizar: "Visualizar usuarios cadastrados.",
      adicionar: "Adicionar novos usuarios.",
      editar: "Editar usuarios existentes.",
      excluir: "Excluir usuarios.",
    },
  },
  vendas: {
    nome: "Vendas",
    descricao: "Permissoes relacionadas ao fluxo de vendas.",
    permissoes: {
      visualizar: "Visualizar vendas registradas.",
      adicionar: "Adicionar novas vendas.",
      editar: "Editar vendas existentes.",
      excluir: "Excluir vendas.",
      relatorio: "Emitir relatorios de vendas.",
      relatorioComissao: "Emitir relatorios de comissao.",
      relatorioVendasMes: "Emitir relatorios mensais de vendas.",
    },
  },
  compras: {
    nome: "Compras",
    descricao: "Permissoes relacionadas ao fluxo de compras.",
    permissoes: {
      visualizar: "Visualizar compras registradas.",
      adicionar: "Adicionar novas compras.",
      editar: "Editar compras existentes.",
      excluir: "Excluir compras.",
      relatorio: "Emitir relatorios de compras.",
    },
  },
  estoque: {
    nome: "Estoque",
    descricao: "Permissoes relacionadas ao controle de estoque.",
    permissoes: {
      visualizar: "Visualizar itens de estoque.",
      adicionar: "Registrar movimentacoes de estoque.",
      editar: "Editar movimentacoes de estoque.",
      excluir: "Excluir movimentacoes de estoque.",
      relatorio: "Emitir relatorios de estoque.",
    },
  },
} as const satisfies Record<string, DefinicaoTela>;

export type Tela = keyof typeof DEFINICOES_TELAS;
export type PermissaoTelaKey = Tela;
export type PermissaoRegraKey<T extends Tela = Tela> = T extends Tela
  ? Extract<keyof (typeof DEFINICOES_TELAS)[T]["permissoes"], string>
  : never;

export interface MetadadoPermissao<TChave extends string = string> {
  chave: TChave;
  descricao: string;
}

export interface MetadadosTela<TTela extends Tela = Tela> {
  nome: string;
  descricao: string;
  permissoes: Array<MetadadoPermissao<PermissaoRegraKey<TTela>>>;
}

export interface PermissaoCompleta {
  descricao: string;
  temPermissao: boolean;
}

export type PermissoesDoUsuario = {
  [TTela in Tela]: {
    [TRegra in PermissaoRegraKey<TTela>]: boolean;
  };
};

export type PermissoesCompletas = {
  [TTela in Tela]: {
    [TRegra in PermissaoRegraKey<TTela>]: PermissaoCompleta;
  };
};

type MetadadosTelasMap = {
  [TTela in Tela]: MetadadosTela<TTela>;
};

const criarMetadadosTelas = (): MetadadosTelasMap => {
  return Object.fromEntries(
    (Object.keys(DEFINICOES_TELAS) as Tela[]).map((tela) => {
      const definicao = DEFINICOES_TELAS[tela];

      return [
        tela,
        {
          nome: definicao.nome,
          descricao: definicao.descricao,
          permissoes: Object.entries(definicao.permissoes).map(
            ([chave, descricao]) => ({
              chave,
              descricao,
            }),
          ),
        },
      ];
    }),
  ) as MetadadosTelasMap;
};

const criarPermissoesExistentes = (): PermissoesDoUsuario => {
  return Object.fromEntries(
    (Object.keys(DEFINICOES_TELAS) as Tela[]).map((tela) => [
      tela,
      Object.fromEntries(
        Object.keys(DEFINICOES_TELAS[tela].permissoes).map((regra) => [
          regra,
          false,
        ]),
      ),
    ]),
  ) as PermissoesDoUsuario;
};

const criarPermissoesCompletas = (): PermissoesCompletas => {
  return Object.fromEntries(
    (Object.keys(DEFINICOES_TELAS) as Tela[]).map((tela) => [
      tela,
      Object.fromEntries(
        METADADOS_TELAS[tela].permissoes.map((permissao) => [
          permissao.chave,
          {
            descricao: permissao.descricao,
            temPermissao: false,
          },
        ]),
      ),
    ]),
  ) as PermissoesCompletas;
};

const ehCargoAdministrador = (cargos: readonly string[]): boolean => {
  const cargosNormalizados = cargos.map((cargo) => cargo.trim().toLowerCase());

  return cargosNormalizados.includes("administrador");
};

export const METADADOS_TELAS = criarMetadadosTelas();
export const permissoesExistentes = criarPermissoesExistentes();

export const novasPermissoes = (): PermissoesCompletas =>
  criarPermissoesCompletas();

export const desserializarPermissoesDoDB = (
  permissoesUsuarios: PermissaoUsuario[] = [],
  isAdminOrCargos: boolean | readonly string[] = false,
): PermissoesCompletas => {
  const resultado = criarPermissoesCompletas();
  const isAdmin = Array.isArray(isAdminOrCargos)
    ? ehCargoAdministrador(isAdminOrCargos)
    : isAdminOrCargos;

  if (isAdmin) {
    for (const tela of Object.keys(resultado) as Tela[]) {
      const regrasDaTela = resultado[tela] as Record<string, PermissaoCompleta>;

      for (const regra of Object.keys(regrasDaTela)) {
        regrasDaTela[regra].temPermissao = true;
      }
    }

    return resultado;
  }

  for (const permissaoUsuario of permissoesUsuarios) {
    const tela = permissaoUsuario.tela as Tela;

    if (!(tela in resultado)) {
      console.warn(
        `Permissao do banco com tela '${permissaoUsuario.tela}' nao existe na fonte da verdade. Ignorando.`,
      );
      continue;
    }

    const regrasDaTela = resultado[tela] as Record<string, PermissaoCompleta>;

    if (!(permissaoUsuario.regra in regrasDaTela)) {
      console.warn(
        `Permissao do banco com regra '${permissaoUsuario.regra}' para tela '${permissaoUsuario.tela}' nao existe na fonte da verdade. Ignorando.`,
      );
      continue;
    }

    regrasDaTela[permissaoUsuario.regra].temPermissao =
      permissaoUsuario.permitido;
  }

  return resultado;
};

export const serializarPermissoesParaSalvar = (
  permissoes: PermissoesCompletas,
): PermissoesDoUsuario => {
  const resultado: Record<string, Record<string, boolean>> = {};

  for (const tela of Object.keys(permissoes) as Tela[]) {
    const regrasDaTela = permissoes[tela] as Record<string, PermissaoCompleta>;
    const regrasSerializadas: Record<string, boolean> = {};

    for (const [regra, permissao] of Object.entries(regrasDaTela)) {
      regrasSerializadas[regra] = permissao.temPermissao;
    }

    resultado[tela] = regrasSerializadas;
  }

  return resultado as PermissoesDoUsuario;
};

export const verificarPermissao = (
  permissoes: PermissoesCompletas | null | undefined,
  tela: string,
  regra: string,
): boolean => {
  if (!permissoes) {
    return false;
  }

  const regrasDaTela = permissoes[tela as Tela];

  if (!regrasDaTela) {
    return false;
  }

  return regrasDaTela[regra as keyof typeof regrasDaTela]?.temPermissao ?? false;
};
