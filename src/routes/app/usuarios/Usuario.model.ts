import { Funcao } from "$lib/enums/Funcao";
import { Fields, Entity } from "remult";

@Entity("usuarios")
export class Usuario {
  @Fields.id()
  id = "";

  @Fields.string({ required: true, minLength: 3 })
  nome!: string;

  @Fields.string({ minLength: 3 })
  login = "";

  @Fields.string({ minLength: 8 })
  senha = "";


  @Relations.toMany(() => PermissaoUsuario, { field: "usuarioId" })
  permissoes?: PermissaoUsuario[]; // Carrega todas as permissões para este usuário

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
