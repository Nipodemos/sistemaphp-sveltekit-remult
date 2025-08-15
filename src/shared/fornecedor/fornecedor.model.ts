import { Entity, Fields } from "remult";

@Entity("fornecedores", {})
export class Fornecedor {
  @Fields.id()
  id = "";

  @Fields.string()
  codigo!: string;

  @Fields.string()
  razaoSocial = "";

  @Fields.string()
  cnpj = "";

  @Fields.string()
  nomeFantasia = "";

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
