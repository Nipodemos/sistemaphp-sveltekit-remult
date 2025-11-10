import { Allow, Entity, Fields, Relations, remult, Validators } from "remult";
import { validarCPF, validarCNPJ, validarTelefone } from "$lib/utils/utils";
import { Produto } from "$shared/produto/produto.model";

export type TipoDocumento = "CPF" | "CNPJ";

@Entity<Fornecedor>("fornecedores", {
  allowApiCrud: Allow.authenticated,
  saving: async (fornecedor, e) => {
    if (!e.isNew) {
      const original = await remult.repo(Fornecedor).findId(fornecedor.id);
      if (original && original.sequencial !== fornecedor.sequencial) {
        throw new Error("Código não pode ser alterado após a criação");
      }
    }
  },
})
export class Fornecedor {
  @Fields.id()
  id = "";

  @Fields.autoIncrement()
  public sequencial!: number;

  @Fields.string<Fornecedor>({
    sqlExpression: () => `'FORN' || lpad(CAST(sequencial AS TEXT), 3, '0')`,
  })
  codigo!: string;

  @Fields.string<Fornecedor>({
    validate: (fornecedor) => {
      if (!fornecedor.razaoSocial?.trim())
        throw new Error("Razão social é obrigatória");
    },
  })
  razaoSocial = "";

  @Fields.string<Fornecedor>({
    validate: (fornecedor) => {
      if (!fornecedor.nomeFantasia?.trim())
        throw new Error("Nome fantasia é obrigatório");
    },
  })
  nomeFantasia = "";

  @Fields.string()
  tipoDocumento: TipoDocumento = "CNPJ";

  @Fields.string<Fornecedor>({
    validate: [
      Validators.required,
      Validators.unique,
      (fornecedor) => {
        if (fornecedor.tipoDocumento === "CPF") {
          if (!validarCPF(fornecedor.documento)) {
            throw new Error("CPF inválido");
          }
        } else if (fornecedor.tipoDocumento === "CNPJ") {
          if (!validarCNPJ(fornecedor.documento)) {
            throw new Error("CNPJ inválido");
          }
        }
      },
    ],
  })
  documento = "";

  // Endereço
  @Fields.string({
    validate: Validators.required,
  })
  rua = "";

  @Fields.string({
    validate: Validators.required,
  })
  numero = "";

  @Fields.string()
  complemento = "";

  @Fields.string({
    validate: Validators.required,
  })
  bairro = "";

  @Fields.string({
    validate: Validators.required,
  })
  cidade = "";

  @Fields.string({
    validate: Validators.required,
  })
  estado = "";

  @Fields.string({
    validate: Validators.required,
  })
  cep = "";

  // Contato
  @Fields.string<Fornecedor>({
    validate: [
      Validators.required,
      (fornecedor) => {
        if (!validarTelefone(fornecedor.telefonePrincipal)) {
          throw new Error(
            "Telefone deve ter 10 ou 11 dígitos (DDD + 8 ou 9 dígitos)"
          );
        }
      },
    ],
  })
  telefonePrincipal = "";

  @Fields.string<Fornecedor>({
    validate: (fornecedor) => {
      if (
        fornecedor.telefoneSecundario &&
        !validarTelefone(fornecedor.telefoneSecundario)
      ) {
        throw new Error(
          "Telefone secundário deve ter 10 ou 11 dígitos (DDD + 8 ou 9 dígitos)"
        );
      }
    },
  })
  telefoneSecundario = "";

  @Fields.string<Fornecedor>({
    validate: (fornecedor) => {
      if (fornecedor.email && !Fornecedor.validarEmail(fornecedor.email)) {
        throw new Error("Email inválido");
      }
    },
  })
  email = "";

  // Representante
  @Fields.string({
    validate: Validators.required,
  })
  representanteNome = "";

  @Fields.string<Fornecedor>({
    validate: (fornecedor) => {
      if (
        fornecedor.representanteTelefone &&
        !validarTelefone(fornecedor.representanteTelefone)
      ) {
        throw new Error(
          "Telefone do representante deve ter 10 ou 11 dígitos (DDD + 8 ou 9 dígitos)"
        );
      }
    },
  })
  representanteTelefone = "";

  @Fields.string<Fornecedor>({
    validate: (fornecedor) => {
      if (
        fornecedor.representanteEmail &&
        !Fornecedor.validarEmail(fornecedor.representanteEmail)
      ) {
        throw new Error("Email do representante inválido");
      }
    },
  })
  representanteEmail = "";

  @Relations.toMany(() => Produto)
  produtos: Produto[] = [];

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;

  private static validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
