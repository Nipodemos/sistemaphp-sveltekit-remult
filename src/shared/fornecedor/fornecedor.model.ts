import { Allow, Entity, Fields, Relations, remult, Validators } from "remult";
import { validarCPF, validarCNPJ, validarTelefone, validarEmail, validarEstado, validarCEP } from "$lib/utils/utils";
import { Produto } from "$shared/produto/produto.model";

export type TipoDocumento = "CPF" | "CNPJ";

@Entity<Fornecedor>("fornecedores", {
  allowApiCrud: Allow.authenticated,
  saving: async (fornecedor, e) => {
    if (e.isNew) {
      // Gerar código sequencial único
      const repo = remult.repo(Fornecedor);
      const ultimoFornecedor = await repo.findOne({
        orderBy: { codigo: "desc" },
      });
      let novoNumero = 1;
      if (ultimoFornecedor) {
        novoNumero = Number(ultimoFornecedor.codigo.replace(/^FORN/, "")) + 1;
      }

      fornecedor.codigo = "FORN" + novoNumero;
    } else {
      const original = await remult.repo(Fornecedor).findId(fornecedor.id);
      if (original && original.codigo !== fornecedor.codigo) {
        throw new Error("Código não pode ser alterado após a criação");
      }
    }

    // Validar que pelo menos um dos campos de contato do representante está preenchido
    const telefonePreenchido = fornecedor.representanteTelefone && fornecedor.representanteTelefone.trim() !== "";
    const emailPreenchido = fornecedor.representanteEmail && fornecedor.representanteEmail.trim() !== "";
    
    if (!telefonePreenchido && !emailPreenchido) {
      throw new Error("É obrigatório preencher pelo menos um dos campos: telefone ou email do representante");
    }
  },
})
export class Fornecedor {
  @Fields.id()
  id = "";

  @Fields.string({
    validate: [Validators.required, Validators.unique],
    valueConverter: {
      toDb: (value: string) => value.replace(/^FORN/, ""), // Remove prefixo FORN se existir
      fromDb: (value: string) => `FORN${value.padStart(3, "0")}`, // Adiciona prefixo ao carregar
    },
  })
  codigo!: string;

  @Fields.string<Fornecedor>({
    validate: [Validators.required("Razão social é obrigatória")],
  })
  razaoSocial = "";

  @Fields.string<Fornecedor>({
    validate: [Validators.required("Nome fantasia é obrigatório")],
  })
  nomeFantasia = "";

  @Fields.string({
    validate: [Validators.required("Tipo de documento é obrigatório")],
  })
  tipoDocumento: TipoDocumento = "CNPJ";

  @Fields.string<Fornecedor>({
    validate: [
      Validators.required("Documento é obrigatório"),
      Validators.unique("Documento já cadastrado"),
      (fornecedor) => {
        if (!fornecedor.documento) return;
        
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
    validate: Validators.required("Rua é obrigatória"),
  })
  rua = "";

  @Fields.string({
    validate: Validators.required("Número é obrigatório"),
  })
  numero = "";

  @Fields.string()
  complemento = "";

  @Fields.string({
    validate: Validators.required("Bairro é obrigatório"),
  })
  bairro = "";

  @Fields.string({
    validate: Validators.required("Cidade é obrigatória"),
  })
  cidade = "";

  @Fields.string<Fornecedor>({
    validate: [
      Validators.required("Estado é obrigatório"),
      (fornecedor) => {
        if (fornecedor.estado && !validarEstado(fornecedor.estado)) {
          throw new Error("Estado (UF) inválido");
        }
      },
    ],
  })
  estado = "";

  @Fields.string<Fornecedor>({
    validate: [
      Validators.required("CEP é obrigatório"),
      (fornecedor) => {
        if (fornecedor.cep && !validarCEP(fornecedor.cep)) {
          throw new Error("CEP inválido. Deve conter 8 dígitos");
        }
      },
    ],
  })
  cep = "";

  // Contato
  @Fields.string<Fornecedor>({
    validate: [
      Validators.required("Telefone principal é obrigatório"),
      (fornecedor) => {
        if (fornecedor.telefonePrincipal && !validarTelefone(fornecedor.telefonePrincipal)) {
          throw new Error(
            "Telefone principal deve ter 10 ou 11 dígitos (DDD + 8 ou 9 dígitos)"
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
    validate: [Validators.email("Email inválido")],
  })
  email = "";

  @Fields.string()
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
        !validarEmail(fornecedor.representanteEmail)
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

}
