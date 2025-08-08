import { Entity, Fields, Relations } from "remult";
import { Usuario } from "../usuarios/usuario.model";
import { Tela } from "./tela.model";

@Entity("permissoes_telas")
export class PermissaoTela {
  @Fields.id()
  id = "";

  @Relations.toOne(() => Usuario)
  usuario!: Usuario;

  @Relations.toOne(() => Tela)
  tela!: Tela;

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
