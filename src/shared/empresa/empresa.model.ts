import { Entity, Fields, Validators, remult } from "remult";
import {
  validarCNPJ,
  validarTelefone,
  formatarCNPJ,
  validarEstado,
} from "$lib/utils/utils";

@Entity("empresas", {
  saving: async (empresa: Empresa, e) => {
    if (e.isNew) {
      // Gerar código sequencial único
      const repo = remult.repo(Empresa);
      const maxSequencial = await repo
        .find({
          orderBy: { codigo: "desc" },
          limit: 1,
        })
        .then((results) => (results[0] ? parseInt(results[0].codigo) : 0));
      const novoNumero = maxSequencial + 1;
      empresa.codigo = novoNumero.toString();

      // Verificar se CNPJ já existe
      const existing = await repo.findFirst({ cnpj: empresa.cnpj });
      if (existing) {
        throw new Error("CNPJ já cadastrado");
      }
    }

    // Aplicar máscara ao CNPJ se não estiver formatado
    if (
      empresa.cnpj &&
      !empresa.cnpj.includes(".") &&
      !empresa.cnpj.includes("/")
    ) {
      empresa.cnpj = formatarCNPJ(empresa.cnpj);
    }
  },
})
export class Empresa {
  @Fields.id()
  id = "";

  @Fields.string({
    validate: [Validators.required, Validators.unique],
    valueConverter: {
      toDb: (value: string) => value.replace("EMPR", ""), // Salva apenas o número como string no banco
      fromDb: (value: string) => `EMPR${value}`, // Adiciona prefixo ao carregar
    },
  })
  codigo!: string;

  @Fields.string({
    validate: [Validators.required, Validators.unique],
    caption: "Nome da Empresa",
  })
  nome = "";

  @Fields.string({
    validate: [
      Validators.required(),
      Validators.unique(),
      (entity: Empresa) => {
        if (!validarCNPJ(entity.cnpj)) {
          throw new Error("CNPJ inválido");
        }
      },
    ],
    caption: "CNPJ",
  })
  cnpj = "";

  @Fields.string({
    validate: [Validators.required],
    caption: "Rua",
  })
  rua = "";

  @Fields.string({
    validate: [Validators.required],
    caption: "Número",
  })
  numero = "";

  @Fields.string({
    caption: "Complemento",
  })
  complemento = "";

  @Fields.string({
    validate: [Validators.required],
    caption: "Bairro",
  })
  bairro = "";

  @Fields.string({
    validate: [Validators.required],
    caption: "Cidade",
  })
  cidade = "";

  @Fields.string({
    validate: [
      Validators.required,
      (entity: Empresa) => {
        if (!validarEstado(entity.estado)) {
          throw new Error(
            "Estado inválido. Use a sigla de um estado brasileiro válido (ex: SP, RJ, MG)"
          );
        }
      },
    ],
    caption: "Estado (UF)",
  })
  estado = "";

  @Fields.string({
    validate: [Validators.required],
    caption: "CEP",
  })
  cep = "";

  @Fields.string({
    caption: "Código do Município",
  })
  codigoMunicipio = "";

  @Fields.string({
    validate: [
      Validators.required,
      (entity: Empresa) => {
        if (!validarTelefone(entity.telefone)) {
          throw new Error("Telefone inválido");
        }
      },
    ],
    caption: "Telefone",
  })
  telefone = "";

  @Fields.string({
    validate: [
      Validators.required,
      (entity: Empresa) => {
        if (!entity.email.includes("@")) {
          throw new Error("Email inválido");
        }
      },
    ],
    caption: "Email",
  })
  email = "";

  @Fields.boolean({
    dbName: "eh_deposito",
    defaultValue: () => false,
    caption: "É Depósito",
  })
  ehDeposito = false;

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
