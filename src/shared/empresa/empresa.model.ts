import { Entity, Fields, Validators, remult } from "remult";
import { validarCNPJ, validarTelefone } from "$lib/utils/utils";

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
  },
})
export class Empresa {
  @Fields.id()
  id = "";

  @Fields.string({
    valueConverter: {
      toDb: (value: string) => value.replace("EMPR", ""), // Salva apenas o número como string no banco
      fromDb: (value: string) => `EMPR${value}`, // Adiciona prefixo ao carregar
    },
  })
  codigo!: string;

  @Fields.string({
    validate: Validators.required,
    caption: "Nome da Empresa",
  })
  nome = "";

  @Fields.string({
    validate: [
      Validators.required,
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
    caption: "Endereço",
  })
  endereco = "";

  @Fields.string({
    validate: (entity: Empresa) => {
      if (entity.telefone && !validarTelefone(entity.telefone)) {
        throw new Error("Telefone inválido");
      }
    },
    caption: "Telefone",
  })
  telefone = "";

  @Fields.string({
    validate: (entity: Empresa) => {
      if (entity.email && !entity.email.includes("@")) {
        throw new Error("Email inválido");
      }
    },
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
