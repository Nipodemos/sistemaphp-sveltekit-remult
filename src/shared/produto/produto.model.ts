import { Categoria } from "$shared/categoria/categoria.model";
import { Fornecedor } from "$shared/fornecedor/fornecedor.model";
import { Entity, Fields, Relations, remult } from "remult";

@Entity("produtos", {
  saving: async (produto: Produto, e) => {
    if (e.isNew) {
      // Gerar código sequencial único
      const repo = remult.repo(Produto);
      const maxSequencial = await repo
        .find({
          orderBy: { codigoSequencial: "desc" },
          limit: 1,
          include: { fornecedor: {} },
        })
        .then((results) => results[0]?.codigoSequencial || 0);
      produto.codigoSequencial = maxSequencial + 1;
    }

    // Gerar código de exibição
    if (produto.fornecedor && produto.codigoSequencial) {
      produto.codigo = `F${
        produto.fornecedor.codigo
      }_P${produto.codigoSequencial.toString().padStart(5, "0")}`;
    }
  },
})
export class Produto {
  @Fields.id()
  id = "";

  @Fields.string()
  codigo!: string;

  @Fields.number()
  codigoSequencial = 0;

  @Fields.string()
  descricao = "";

  @Fields.number()
  precoCusto = 0;

  @Fields.number()
  precoVenda = 0;

  // Apenas UMA referência para a categoria final (nível mais baixo)
  @Relations.toOne(() => Categoria, { field: "categoriaId" })
  categoria!: Categoria;

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;

  @Relations.toOne(() => Fornecedor, {})
  fornecedor!: Fornecedor;
}
