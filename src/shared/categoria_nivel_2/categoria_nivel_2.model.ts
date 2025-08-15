import { CategoriaNivel1 } from "$shared/categoria_nivel_1/categoria_nivel_1.model";
import { CategoriaNivel3 } from "$shared/categoria_nivel_3/categoria_nivel_3.model";
import { Entity, Fields, Relations } from "remult";

@Entity("categorias_nivel_2", {})
export class CategoriaNivel2 {
  @Fields.id()
  id = "";

  @Fields.string()
  descricao: string = "";

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;

  @Relations.toOne(() => CategoriaNivel1, { field: "categoriaNivel1Id" })
  departamento?: CategoriaNivel1;

  @Relations.toMany(() => CategoriaNivel3, {})
  subcategorias: CategoriaNivel3[] = [];
}
