import { describe, it, expect, beforeAll } from "vitest";
import { remult } from "remult";
import { Empresa } from "$shared/empresa/empresa.model";

describe("Empresa Model", () => {
  let repo: any;

  beforeAll(() => {
    repo = remult.repo(Empresa);
  });

  describe("Validações de campos obrigatórios", () => {
    it("deve rejeitar nome vazio", async () => {
      const empresa = repo.create({
        codigo: "1",
        nome: "",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("Nome da Empresa");
    });

    it("deve rejeitar CNPJ vazio", async () => {
      const empresa = repo.create({
        codigo: "2",
        nome: "Empresa Teste CNPJ Vazio",
        cnpj: "",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("CNPJ");
    });

    it("deve aceitar empresa válida", async () => {
      const empresa = repo.create({
        codigo: "3",
        nome: "Empresa Teste",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).resolves.not.toThrow();
    });
  });

  describe("Validações de formato", () => {
    it("deve aceitar CNPJ válido", async () => {
      const empresa = repo.create({
        codigo: "4",
        nome: "Empresa Teste CNPJ Valido",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).resolves.not.toThrow();
    });

    it("deve rejeitar CNPJ inválido", async () => {
      const empresa = repo.create({
        codigo: "5",
        nome: "Empresa Teste CNPJ Invalido",
        cnpj: "12345678000100",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("CNPJ inválido");
    });

    it("deve rejeitar email inválido se preenchido", async () => {
      const empresa = repo.create({
        nome: "Empresa Teste Email Invalido",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "email-invalido",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("Email inválido");
    });
  });

  describe("Campos opcionais", () => {
    it("deve aceitar complemento vazio", async () => {
      const empresa = repo.create({
        codigo: "7",
        nome: "Empresa Teste Complemento Vazio",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        complemento: "",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).resolves.not.toThrow();
    });

    it("deve aceitar telefone vazio", async () => {
      const empresa = repo.create({
        codigo: "8",
        nome: "Empresa Teste Telefone Vazio",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).resolves.not.toThrow();
    });

    it("deve aceitar email vazio", async () => {
      const empresa = repo.create({
        codigo: "9",
        nome: "Empresa Teste Email Vazio",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).resolves.not.toThrow();
    });
  });

  describe("Formatação de CNPJ", () => {
    it("deve aplicar máscara ao CNPJ sem formatação", async () => {
      const empresa = repo.create({
        codigo: "10",
        nome: "Empresa Teste CNPJ Mascara",
        cnpj: "99999999000199", // CNPJ válido sem máscara
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await repo.save(empresa);

      expect(empresa.cnpj).toBe("99.999.999/0001-99");
    });

    it("deve manter CNPJ já formatado", async () => {
      const empresa = repo.create({
        codigo: "11",
        nome: "Empresa Teste CNPJ Formatado",
        cnpj: "99.999.999/0001-99", // CNPJ já com máscara
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await repo.save(empresa);

      expect(empresa.cnpj).toBe("99.999.999/0001-99");
    });

    it("deve formatar CNPJ com caracteres especiais", async () => {
      const empresa = repo.create({
        codigo: "12",
        nome: "Empresa Teste CNPJ Caracteres",
        cnpj: "99.999.999/0001-99", // CNPJ com máscara
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await repo.save(empresa);

      expect(empresa.cnpj).toBe("99.999.999/0001-99");
    });
  });

  describe("Validações de endereço", () => {
    it("deve rejeitar rua vazia", async () => {
      const empresa = repo.create({
        codigo: "13",
        nome: "Empresa Teste Rua Vazia",
        cnpj: "11222333000181",
        rua: "",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("Rua");
    });

    it("deve rejeitar número vazio", async () => {
      const empresa = repo.create({
        codigo: "14",
        nome: "Empresa Teste Numero Vazio",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("Número");
    });

    it("deve rejeitar bairro vazio", async () => {
      const empresa = repo.create({
        codigo: "15",
        nome: "Empresa Teste Bairro Vazio",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("Bairro");
    });

    it("deve rejeitar cidade vazia", async () => {
      const empresa = repo.create({
        codigo: "16",
        nome: "Empresa Teste Cidade Vazia",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "",
        estado: "SP",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("Cidade");
    });

    it("deve rejeitar estado vazio", async () => {
      const empresa = repo.create({
        codigo: "17",
        nome: "Empresa Teste Estado Vazio",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("Estado");
    });

    it("deve rejeitar CEP vazio", async () => {
      const empresa = repo.create({
        codigo: "18",
        nome: "Empresa Teste CEP Vazio",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("CEP");
    });

    it("deve rejeitar estado inválido", async () => {
      const empresa = repo.create({
        codigo: "19",
        nome: "Empresa Teste Estado Invalido",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "XX",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("Estado inválido");
    });

    it("deve aceitar estado válido em minúsculo", async () => {
      const empresa = repo.create({
        codigo: "20",
        nome: "Empresa Teste Estado Minusculo",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "sp",
        cep: "12345-678",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).resolves.not.toThrow();
    });

    it("deve aceitar código de município vazio", async () => {
      const empresa = repo.create({
        codigo: "21",
        nome: "Empresa Teste Codigo Municipio Vazio",
        cnpj: "11222333000181",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        codigoMunicipio: "",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).resolves.not.toThrow();
    });
  });
});
