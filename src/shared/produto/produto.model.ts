import { Categoria } from "$shared/categoria/categoria.model";
import { Fornecedor } from "$shared/fornecedor/fornecedor.model";
import { Entity, Fields, Relations, remult, Validators } from "remult";
import { tipoVariacao } from "$lib/types/variacao.types";
import type { TypeTipoVariacao } from "$lib/types/variacao.types";

@Entity("produtos", {
  saving: async (produto: Produto, e) => {
    const repo = remult.repo(Produto);
    if (e.isNew) {
      // Gerar código sequencial único
      const maxSequencial = await repo
        .find({
          orderBy: { codigo: "desc" },
          limit: 1,
        })
        .then((results) => (results[0] ? parseInt(results[0].codigo) : 0));
      const novoNumero = maxSequencial + 1;
      produto.codigo = novoNumero.toString();
    } else {
      const produtoAntigo = await repo.findId(produto.id);

      // Checagem para não permitir alteração do fornecedor
      if (produto.fornecedor.id !== produtoAntigo?.fornecedor.id) {
        throw new Error("Não é permitido alterar o fornecedor do produto");
      }
    }
  },
})
export class Produto {
  @Fields.id()
  id = "";

  @Fields.string<number>({
    validate: [Validators.required, Validators.unique()],
    valueConverter: {
      toDb: (value: string) => value.replace(/^PROD/, ""), // Remove prefixo PROD se existir
      fromDb: (value: string) => `PROD${value}`, // Adiciona prefixo ao carregar
    },
  })
  codigo!: string;

  @Fields.string({
    validate: [Validators.required],
  })
  descricao = "";

  @Fields.number({
    dbName: "preco_custo",
    validate: [
      Validators.required,
      (entity: Produto) => {
        if (entity.precoCusto <= 0) {
          throw new Error("Preço de custo deve ser maior que zero");
        }
      },
    ],
  })
  precoCusto = 0;

  @Fields.number({
    dbName: "preco_venda",
    validate: [
      Validators.required,
      (entity: Produto) => {
        if (entity.precoVenda <= 0) {
          throw new Error("Preço de venda deve ser maior que zero");
        }
      },
    ],
  })
  precoVenda = 0;

  @Fields.enum(() => ["UN", "KG", "LT", "M"] as const, {
    dbName: "unidade_medida",
  })
  unidadeMedida: "UN" | "KG" | "LT" | "M" = "UN";

  @Fields.literal(() => tipoVariacao)
  variacao1!: TypeTipoVariacao;

  @Fields.literal(() => tipoVariacao)
  variacao2!: TypeTipoVariacao;
  @Fields.literal(() => tipoVariacao)
  variacao3!: TypeTipoVariacao;

  @Relations.toOne(() => Categoria)
  categoria!: Categoria;

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;

  @Relations.toOne(() => Fornecedor, {
    validate: [Validators.required, Validators.relationExists],
  })
  fornecedor!: Fornecedor;
}
