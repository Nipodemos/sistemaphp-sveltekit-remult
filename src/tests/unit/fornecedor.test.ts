import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import { remult, type Repository } from "remult";
import { Fornecedor } from "$shared/fornecedor/fornecedor.model";

describe("Fornecedor Model", () => {
  let repo: Repository<Fornecedor>;

  // CPFs válidos (sem formatação)
  const cpfsValidos = [
    "12345678909",
    "98765432100",
    "11144477735",
    "12312312387",
    "45678912345",
  ];

  // CNPJs válidos (sem formatação)
  const cnpjsValidos = [
    "11222333000181",
    "12345678000195",
    "98765432000111",
    "11111111000118",
    "22333444000181",
  ];

  // Helper para criar fornecedor válido base
  const criarFornecedorBase = (overrides = {}) => ({
    razaoSocial: "Empresa Teste LTDA",
    nomeFantasia: "Empresa Teste",
    documento: cnpjsValidos[0],
    tipoDocumento: "CNPJ" as const,
    rua: "Rua das Flores",
    numero: "123",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567",
    telefonePrincipal: "11987654321",
    representanteTelefone: "11976543210",
    ...overrides,
  });

  beforeAll(() => {
    repo = remult.repo(Fornecedor);
  });

  beforeEach(async () => {
    // Limpar fornecedores de testes anteriores se necessário
    try {
      const fornecedores = await repo.find({ where: { razaoSocial: { $contains: "Teste" } } });
      for (const f of fornecedores) {
        await repo.delete(f);
      }
    } catch (error) {
      // Ignorar erros de limpeza
    }
  });

  afterEach(async () => {
    // Limpar após cada teste
    try {
      const fornecedores = await repo.find({ where: { razaoSocial: { $contains: "Teste" } } });
      for (const f of fornecedores) {
        await repo.delete(f);
      }
    } catch (error) {
      // Ignorar erros de limpeza
    }
  });

  describe("Validações de campos obrigatórios", () => {
    it("deve rejeitar razão social vazia", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ razaoSocial: "" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Razão social é obrigatória"
      );
    });

    it("deve rejeitar nome fantasia vazio", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ nomeFantasia: "" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Nome fantasia é obrigatório"
      );
    });

    it("deve rejeitar tipo de documento vazio", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ tipoDocumento: "" as any })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Tipo de documento é obrigatório"
      );
    });

    it("deve rejeitar documento vazio", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ documento: "" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Documento é obrigatório"
      );
    });

    it("deve rejeitar rua vazia", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ rua: "" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Rua é obrigatória"
      );
    });

    it("deve rejeitar número vazio", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ numero: "" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Número é obrigatório"
      );
    });

    it("deve rejeitar bairro vazio", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ bairro: "" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Bairro é obrigatório"
      );
    });

    it("deve rejeitar cidade vazia", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ cidade: "" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Cidade é obrigatória"
      );
    });

    it("deve rejeitar estado vazio", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ estado: "" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Estado é obrigatório"
      );
    });

    it("deve rejeitar CEP vazio", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ cep: "" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "CEP é obrigatório"
      );
    });

    it("deve rejeitar telefone principal vazio", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ telefonePrincipal: "" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Telefone principal é obrigatório"
      );
    });

    it("deve rejeitar quando representanteTelefone e representanteEmail estão vazios", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          representanteTelefone: "",
          representanteEmail: "",
        })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "É obrigatório preencher pelo menos um dos campos: telefone ou email do representante"
      );
    });

    it("deve aceitar quando apenas representanteTelefone está preenchido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          representanteTelefone: "11976543210",
          representanteEmail: "",
        })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve aceitar quando apenas representanteEmail está preenchido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          representanteTelefone: "",
          representanteEmail: "representante@teste.com",
        })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve aceitar quando ambos representanteTelefone e representanteEmail estão preenchidos", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          representanteTelefone: "11976543210",
          representanteEmail: "representante@teste.com",
        })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });
  });

  describe("Validações de CPF", () => {
    it.each(cpfsValidos)("deve aceitar CPF válido: %s", async (cpf) => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          documento: cpf,
          tipoDocumento: "CPF",
        })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve rejeitar CPF inválido (dígitos verificadores incorretos)", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          documento: "12345678900",
          tipoDocumento: "CPF",
        })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow("CPF inválido");
    });

    it("deve rejeitar CPF com menos de 11 dígitos", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          documento: "1234567890",
          tipoDocumento: "CPF",
        })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow("CPF inválido");
    });

    it("deve aceitar CPF com formatação (deve remover formatação)", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          documento: "123.456.789-09",
          tipoDocumento: "CPF",
        })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });
  });

  describe("Validações de CNPJ", () => {
    it.each(cnpjsValidos)("deve aceitar CNPJ válido: %s", async (cnpj) => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          documento: cnpj,
          tipoDocumento: "CNPJ",
        })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve rejeitar CNPJ inválido (dígitos verificadores incorretos)", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          documento: "12345678000100",
          tipoDocumento: "CNPJ",
        })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow("CNPJ inválido");
    });

    it("deve rejeitar CNPJ com menos de 14 dígitos", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          documento: "1234567800010",
          tipoDocumento: "CNPJ",
        })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow("CNPJ inválido");
    });

    it("deve aceitar CNPJ com formatação (deve remover formatação)", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          documento: "11.222.333/0001-81",
          tipoDocumento: "CNPJ",
        })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });
  });

  describe("Validações de telefone", () => {
    it("deve aceitar telefone principal válido com 10 dígitos", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ telefonePrincipal: "1134567890" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve aceitar telefone principal válido com 11 dígitos", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ telefonePrincipal: "11987654321" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve rejeitar telefone principal com DDD inválido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ telefonePrincipal: "1034567890" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Telefone deve ter 10 ou 11 dígitos"
      );
    });

    it("deve rejeitar telefone principal com menos de 10 dígitos", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ telefonePrincipal: "119876543" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Telefone deve ter 10 ou 11 dígitos"
      );
    });

    it("deve rejeitar telefone principal com 11 dígitos mas sem 9 no início", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ telefonePrincipal: "1187654321" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Telefone deve ter 10 ou 11 dígitos"
      );
    });

    it("deve aceitar telefone secundário válido quando preenchido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ telefoneSecundario: "11976543210" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve rejeitar telefone secundário inválido quando preenchido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ telefoneSecundario: "1034567890" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Telefone secundário deve ter 10 ou 11 dígitos"
      );
    });

    it("deve aceitar telefone do representante válido quando preenchido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ representanteTelefone: "11976543210" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve rejeitar telefone do representante inválido quando preenchido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ representanteTelefone: "1034567890" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Telefone do representante deve ter 10 ou 11 dígitos"
      );
    });
  });

  describe("Validações de CEP", () => {
    it("deve aceitar CEP válido com 8 dígitos", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ cep: "01234567" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve aceitar CEP válido com formatação", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ cep: "01234-567" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve rejeitar CEP com menos de 8 dígitos", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ cep: "1234567" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "CEP inválido. Deve conter 8 dígitos"
      );
    });

    it("deve rejeitar CEP com mais de 8 dígitos", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ cep: "012345678" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "CEP inválido. Deve conter 8 dígitos"
      );
    });

    it("deve rejeitar CEP com todos os dígitos iguais", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ cep: "00000000" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "CEP inválido. Deve conter 8 dígitos"
      );
    });
  });

  describe("Validações de Estado (UF)", () => {
    it("deve aceitar estado válido em maiúsculas", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ estado: "SP" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve aceitar estado válido em minúsculas (deve converter)", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ estado: "sp" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve aceitar estado válido com espaços (deve remover)", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ estado: " SP " })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it.each(["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"])(
      "deve aceitar UF válida: %s",
      async (uf) => {
        const fornecedor = repo.create(
          criarFornecedorBase({ estado: uf })
        );

        await expect(repo.save(fornecedor)).resolves.not.toThrow();
      }
    );

    it("deve rejeitar estado inválido (UF inexistente)", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ estado: "XX" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Estado (UF) inválido"
      );
    });

    it("deve rejeitar estado com mais de 2 caracteres", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ estado: "SPP" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Estado (UF) inválido"
      );
    });

    it("deve rejeitar estado com menos de 2 caracteres", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ estado: "S" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Estado (UF) inválido"
      );
    });
  });

  describe("Validações de email", () => {
    it("deve aceitar email válido quando preenchido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ email: "contato@empresa.com.br" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve aceitar email vazio (opcional)", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ email: "" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve rejeitar email inválido quando preenchido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ email: "email-invalido" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow("Email inválido");
    });

    it("deve rejeitar email sem @ quando preenchido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ email: "emailinvalido.com" })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow("Email inválido");
    });

    it("deve aceitar email do representante válido quando preenchido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          representanteEmail: "representante@empresa.com.br",
        })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve rejeitar email do representante inválido quando preenchido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          representanteEmail: "email-invalido",
          representanteTelefone: "",
        })
      );

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Email do representante inválido"
      );
    });
  });

  describe("Campos opcionais", () => {
    it("deve aceitar complemento vazio", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ complemento: "" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve aceitar complemento preenchido", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ complemento: "Sala 101" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve aceitar telefone secundário vazio", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ telefoneSecundario: "" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve aceitar representanteNome vazio", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({ representanteNome: "" })
      );

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });
  });

  describe("Geração automática de código", () => {
    it("deve gerar código automaticamente no formato FORN + número sequencial", async () => {
      const fornecedor1 = repo.create(criarFornecedorBase());
      const fornecedorSalvo1 = await repo.save(fornecedor1);

      expect(fornecedorSalvo1.codigo).toMatch(/^FORN\d+$/);

      const fornecedor2 = repo.create(
        criarFornecedorBase({ razaoSocial: "Segunda Empresa Teste" })
      );
      const fornecedorSalvo2 = await repo.save(fornecedor2);

      expect(fornecedorSalvo2.codigo).toMatch(/^FORN\d+$/);
      expect(fornecedorSalvo2.codigo).not.toBe(fornecedorSalvo1.codigo);
    });
  });

  describe("Proteção de código", () => {
    it("deve impedir alteração do código após criação", async () => {
      const fornecedor = repo.create(criarFornecedorBase());
      const fornecedorSalvo = await repo.save(fornecedor);
      const codigoOriginal = fornecedorSalvo.codigo;

      fornecedorSalvo.codigo = "FORN999";

      await expect(repo.save(fornecedorSalvo)).rejects.toThrow(
        "Código não pode ser alterado após a criação"
      );
    });
  });

  describe("Unicidade de documento", () => {
    it("deve rejeitar documento duplicado", async () => {
      const fornecedor1 = repo.create(
        criarFornecedorBase({ razaoSocial: "Primeira Empresa" })
      );
      await repo.save(fornecedor1);

      const fornecedor2 = repo.create(
        criarFornecedorBase({
          razaoSocial: "Segunda Empresa",
          documento: fornecedor1.documento,
        })
      );

      await expect(repo.save(fornecedor2)).rejects.toThrow(
        "Documento já cadastrado"
      );
    });
  });

  describe("Cenários completos", () => {
    it("deve criar fornecedor completo com todos os campos válidos", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          complemento: "Sala 201",
          telefoneSecundario: "1134567890",
          email: "contato@empresa.com.br",
          representanteNome: "João Silva",
          representanteTelefone: "11976543210",
          representanteEmail: "joao@empresa.com.br",
        })
      );

      const fornecedorSalvo = await repo.save(fornecedor);

      expect(fornecedorSalvo.id).toBeTruthy();
      expect(fornecedorSalvo.codigo).toMatch(/^FORN\d+$/);
      expect(fornecedorSalvo.razaoSocial).toBe("Empresa Teste LTDA");
    });

    it("deve criar fornecedor com CPF e campos mínimos", async () => {
      const fornecedor = repo.create(
        criarFornecedorBase({
          documento: cpfsValidos[0],
          tipoDocumento: "CPF",
          complemento: "",
          telefoneSecundario: "",
          email: "",
          representanteNome: "",
          representanteTelefone: "11976543210",
          representanteEmail: "",
        })
      );

      const fornecedorSalvo = await repo.save(fornecedor);

      expect(fornecedorSalvo.id).toBeTruthy();
      expect(fornecedorSalvo.tipoDocumento).toBe("CPF");
    });
  });
});
