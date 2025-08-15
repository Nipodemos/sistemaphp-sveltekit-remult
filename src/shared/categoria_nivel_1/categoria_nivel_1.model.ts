import { CategoriaNivel2 } from "$shared/categoria_nivel_2/categoria_nivel_2.model";
import { Entity, Fields, Relations } from "remult";

@Entity("categorias_nivel_1", {})
export class CategoriaNivel1 {
  @Fields.id()
  id = "";

  @Fields.string()
  descricao: string = "";

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;

  @Relations.toMany(() => CategoriaNivel2, {})
  categorias: CategoriaNivel2[] = [];
}
