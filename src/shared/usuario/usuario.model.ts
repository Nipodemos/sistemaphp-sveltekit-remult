import { Funcao } from "$lib/enums/Funcao";
import { Fields, Entity, Relations } from "remult";
import { PermissaoUsuario } from "$shared/permissaoUsuario/permissaoUsuario.model";

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

  @Fields.object<Usuario, string[]>({
    valueConverter: {
      toDb: (x) => (x ? x.join(",") : undefined),
      fromDb: (x) => (x ? x.split(",") : undefined),
    },
  })
  cargos: string[] = [];

  @Relations.toMany(() => PermissaoUsuario, { field: "usuarioId" })
  permissoes?: PermissaoUsuario[]; // Carrega todas as permissões para este usuário

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
