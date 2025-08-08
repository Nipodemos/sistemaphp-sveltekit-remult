import { Entity, Fields } from "remult";

@Entity("telas", {})
export class Tela {
  @Fields.id()
  id = "";

  @Fields.string()
  categoria = "";

  @Fields.string()
  descricao = "";

  @Fields.string()
  url = "";

  @Fields.integer()
  ordem = 0;

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
