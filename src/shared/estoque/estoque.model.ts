import { Empresa } from "$shared/empresa/empresa.model";
import { Produto } from "$shared/produto/produto.model";
import { Entity, Fields, Relations } from "remult";

@Entity<Estoque>("estoques", {})
export class Estoque {
  @Fields.id()
  id = "";

  @Fields.string()
  produtoId = "";

  @Fields.string()
  empresaId = "";

  @Fields.number()
  saldoReal = 0;

  @Fields.number()
  saldoDisponivel = 0;

  @Fields.createdAt()
  criadoEm?: Date;
  @Fields.updatedAt()
  alteradoEm?: Date;

  @Relations.toOne(() => Empresa, { field: "empresaId" })
  empresa!: Empresa;

  @Relations.toOne(() => Produto, { field: "produtoId" })
  produto!: Produto;
}
