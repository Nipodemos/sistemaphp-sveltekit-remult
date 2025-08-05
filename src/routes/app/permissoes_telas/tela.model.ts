import { route } from "$lib/ROUTES";
import { Entity, Fields } from "remult";

@Entity("telas")
export class Tela {
  @Fields.id()
  id = "";

  @Fields.string({})
  categoria = "";

  @Fields.string()
  descricao = "";

  @Fields.string()
  rota = "";

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
