import { Entity, Fields, Relations, BackendMethod, remult } from "remult";

@Entity("categorias", {})
export class Categoria {
  @Fields.id()
  id = "";

  @Fields.string()
  nome: string = "";

  // Referência para a categoria pai (null = categoria raiz)
  @Relations.toOne(() => Categoria, {
    field: "categoriaPaiId",
    allowNull: true,
  })
  categoriaPai?: Categoria;

  // Nível na hierarquia (1, 2 ou 3)
  @Fields.integer()
  nivel: number = 1;

  // Path completo da hierarquia (ex: "Casa/Móveis/Cama")
  @Fields.string()
  caminho: string = "";

  // Para facilitar consultas - IDs dos pais em ordem
  @Fields.string({ allowNull: true })
  caminhoIds?: string; // ex: "cat1_id,cat2_id,cat3_id"

  @Fields.boolean()
  ativo: boolean = true;

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;

  // Subcategorias filhas
  @Relations.toMany(() => Categoria, "categoriaPai")
  subcategorias: Categoria[] = [];
}
