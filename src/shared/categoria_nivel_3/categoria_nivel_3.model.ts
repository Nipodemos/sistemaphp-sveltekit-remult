import { CategoriaNivel2 } from "$shared/categoria_nivel_2/categoria_nivel_2.model";
import { Entity, Fields, Relations } from "remult";

@Entity("categorias_nivel_3", {})
export class CategoriaNivel3 {
  @Fields.id()
  id = "";

  @Fields.string()
  descricao: string = "";

  @Relations.toOne(() => CategoriaNivel2, { field: "categoriaNivel2Id" })
  categoria?: CategoriaNivel2;

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
