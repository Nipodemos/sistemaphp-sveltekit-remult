import { Entity, Fields, Validators } from "remult";

@Entity<Tela>("tela", {})
export class Tela {
  @Fields.id()
  id!: string;

  @Fields.string({
    validate: [Validators.required, Validators.minLength(3)],
  })
  nome!: string;

  @Fields.string({
    validate: [Validators.required, Validators.minLength(3)],
  })
  categoria!: string;

  @Fields.string({
    validate: [
      Validators.required,
      Validators.minLength(3),
      Validators.unique(),
    ],
  })
  caminhoUrl!: string;

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
