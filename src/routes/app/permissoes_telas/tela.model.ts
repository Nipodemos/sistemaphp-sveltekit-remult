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

  @Fields.object<Tela, string[]>({
    valueConverter: {
      toDb: (x) => (x ? x.join(",") : undefined),
      fromDb: (x) => (x ? x.split(",") : undefined),
    },
  })
  permissoesPossiveis: string[] = [];

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
