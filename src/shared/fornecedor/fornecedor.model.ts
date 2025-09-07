import { Entity, Fields } from "remult";

export type TipoDocumento = "CPF" | "CNPJ";

@Entity("fornecedores", {})
export class Fornecedor {
  @Fields.id()
  id = "";

  @Fields.string({
    validate: () => {},
  })
  codigo!: string;

  @Fields.string()
  razaoSocial = "";

  @Fields.string()
  nomeFantasia = "";

  @Fields.string()
  tipoDocumento: TipoDocumento = "CNPJ";

  @Fields.string()
  documento = "";

  // Endereço
  @Fields.string()
  rua = "";

  @Fields.string()
  numero = "";

  @Fields.string()
  complemento = "";

  @Fields.string()
  bairro = "";

  @Fields.string()
  cidade = "";

  @Fields.string()
  estado = "";

  @Fields.string()
  cep = "";

  // Contato
  @Fields.string()
  telefonePrincipal = "";

  @Fields.string()
  telefoneSecundario = "";

  @Fields.string()
  email = "";

  // Representante
  @Fields.string()
  representanteNome = "";

  @Fields.string()
  representanteCargo = "";

  @Fields.string()
  representanteTelefone = "";

  @Fields.string()
  representanteEmail = "";

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
