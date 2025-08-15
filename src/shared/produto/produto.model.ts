import { Categoria } from "$shared/categoria/categoria.model";
import { Fornecedor } from "$shared/fornecedor/fornecedor.model";
import { Entity, Fields, Relations } from "remult";

@Entity("produtos", {})
export class Produto {
  @Fields.id()
  id = "";

  @Fields.string()
  codigo!: string;

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
