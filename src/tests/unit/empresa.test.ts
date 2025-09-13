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
        nome: "",
        cnpj: "12345678000123",
        endereco: "Rua Teste",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("Nome da Empresa");
    });

    it("deve rejeitar CNPJ vazio", async () => {
      const empresa = repo.create({
        nome: "Empresa Teste",
        cnpj: "",
        endereco: "Rua Teste",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("CNPJ");
    });

    it("deve aceitar empresa válida", async () => {
      const empresa = repo.create({
        nome: "Empresa Teste",
        cnpj: "12345678000123",
        endereco: "Rua Teste",
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
        nome: "Empresa Teste",
        cnpj: "12345678000123",
        endereco: "Rua Teste",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).resolves.not.toThrow();
    });

    it("deve rejeitar CNPJ inválido", async () => {
      const empresa = repo.create({
        nome: "Empresa Teste",
        cnpj: "12345678000100",
        endereco: "Rua Teste",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("CNPJ inválido");
    });

    it("deve rejeitar email inválido se preenchido", async () => {
      const empresa = repo.create({
        nome: "Empresa Teste",
        cnpj: "12345678000123",
        endereco: "Rua Teste",
        telefone: "11987654321",
        email: "email-invalido",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).rejects.toThrow("Email inválido");
    });
  });

  describe("Campos opcionais", () => {
    it("deve aceitar endereço vazio", async () => {
      const empresa = repo.create({
        nome: "Empresa Teste",
        cnpj: "12345678000123",
        endereco: "",
        telefone: "11987654321",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).resolves.not.toThrow();
    });

    it("deve aceitar telefone vazio", async () => {
      const empresa = repo.create({
        nome: "Empresa Teste",
        cnpj: "12345678000123",
        endereco: "Rua Teste",
        telefone: "",
        email: "teste@teste.com",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).resolves.not.toThrow();
    });

    it("deve aceitar email vazio", async () => {
      const empresa = repo.create({
        nome: "Empresa Teste",
        cnpj: "12345678000123",
        endereco: "Rua Teste",
        telefone: "11987654321",
        email: "",
        ehDeposito: false,
      });

      await expect(repo.save(empresa)).resolves.not.toThrow();
    });
  });
});
