import { Allow, Entity, Fields, remult, Validators } from "remult";

export type TipoDocumento = "CPF" | "CNPJ";

@Entity<Fornecedor>("fornecedores", {
  allowApiCrud: Allow.authenticated,
  saving: async (fornecedor, e) => {
    if (e.isNew) {
      fornecedor.codigo = await Fornecedor.gerarCodigoUnico(
        fornecedor.nomeFantasia,
        fornecedor.documento
      );
    } else {
      const original = await remult.repo(Fornecedor).findId(fornecedor.id);
      if (
        original &&
        (original.nomeFantasia !== fornecedor.nomeFantasia ||
          original.documento !== fornecedor.documento)
      ) {
        fornecedor.codigo = await Fornecedor.gerarCodigoUnico(
          fornecedor.nomeFantasia,
          fornecedor.documento
        );
      }
    }
  },
})
export class Fornecedor {
  @Fields.id()
  id = "";

  @Fields.string()
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
          if (!Fornecedor.validarCPF(fornecedor.documento)) {
            throw new Error("CPF inválido");
          }
        } else if (fornecedor.tipoDocumento === "CNPJ") {
          const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
          if (!cnpjRegex.test(fornecedor.documento)) {
            throw new Error("CNPJ inválido");
          }
        }
      },
    ],
  })
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

  @Fields.string<Fornecedor>({
    validate: (fornecedor) => {
      if (fornecedor.email && !Fornecedor.validarEmail(fornecedor.email)) {
        throw new Error("Email inválido");
      }
    },
  })
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

  static async gerarCodigoUnico(
    nomeFantasia: string,
    documento: string
  ): Promise<string> {
    const documentoLimpo = documento.replace(/\D/g, "");
    const palavras = nomeFantasia
      .trim()
      .split(/\s+/)
      .filter((p) => p.length > 0);

    let codigoBase: string;

    if (palavras.length === 1) {
      const letras = palavras[0].substring(0, 3).toUpperCase();
      const digitos = documentoLimpo.substring(0, 3);
      codigoBase = letras + digitos;
    } else if (palavras.length === 2) {
      const letras = palavras
        .slice(0, 2)
        .map((p) => p.charAt(0).toUpperCase())
        .join("");
      const digitos = documentoLimpo.substring(0, 4);
      codigoBase = letras + digitos;
    } else {
      const letras = palavras
        .slice(0, 3)
        .map((p) => p.charAt(0).toUpperCase())
        .join("");
      const digitos = documentoLimpo.substring(0, 3);
      codigoBase = letras + digitos;
    }

    const repo = remult.repo(Fornecedor);
    let codigoFinal = codigoBase;
    let sufixo = 0;

    while (await repo.count({ codigo: codigoFinal })) {
      sufixo++;
      codigoFinal = codigoBase + sufixo;
    }

    return codigoFinal;
  }

  private static validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      return false;
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;

    return (
      parseInt(cpfLimpo.charAt(9)) === digito1 &&
      parseInt(cpfLimpo.charAt(10)) === digito2
    );
  }

  private static validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
