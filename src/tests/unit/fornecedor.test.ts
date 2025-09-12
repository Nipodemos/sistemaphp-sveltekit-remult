import { describe, it, expect, beforeAll } from "vitest";
import { remult } from "remult";
import { Fornecedor } from "$shared/fornecedor/fornecedor.model";

describe("Fornecedor Model", () => {
  let repo: any;

  beforeAll(() => {
    // Configurar repositório para testes (pode precisar de setup adicional para banco)
    repo = remult.repo(Fornecedor);
  });

  describe("Validações de campos obrigatórios", () => {
    it("deve rejeitar razão social vazia", async () => {
      const fornecedor = repo.create({
        razaoSocial: "",
        nomeFantasia: "Teste",
        documento: "12345678000123",
        tipoDocumento: "CNPJ",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "11987654321",
        representanteNome: "João Silva",
      });

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Razão social é obrigatória"
      );
    });

    it("deve rejeitar nome fantasia vazio", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "",
        documento: "12345678000123",
        tipoDocumento: "CNPJ",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "11987654321",
        representanteNome: "João Silva",
      });

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Nome fantasia é obrigatório"
      );
    });

    it("deve rejeitar documento vazio", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "Teste",
        documento: "",
        tipoDocumento: "CNPJ",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "11987654321",
        representanteNome: "João Silva",
      });

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Documento é obrigatório"
      );
    });

    it("deve rejeitar telefone principal vazio", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "Teste",
        documento: "12345678000123",
        tipoDocumento: "CNPJ",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "",
        representanteNome: "João Silva",
      });

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Telefone é obrigatório"
      );
    });

    it("deve rejeitar representante nome vazio", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "Teste",
        documento: "12345678000123",
        tipoDocumento: "CNPJ",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "11987654321",
        representanteNome: "",
      });

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Representante nome é obrigatório"
      );
    });
  });

  describe("Validações de formato", () => {
    it("deve aceitar CPF válido", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "Teste",
        documento: "12345678909", // CPF válido (todos iguais para teste)
        tipoDocumento: "CPF",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "11987654321",
        representanteNome: "João Silva",
      });

      // Para teste, pode precisar mockar ou usar um CPF real
      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve rejeitar CPF inválido", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "Teste",
        documento: "12345678900",
        tipoDocumento: "CPF",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "11987654321",
        representanteNome: "João Silva",
      });

      await expect(repo.save(fornecedor)).rejects.toThrow("CPF inválido");
    });

    it("deve aceitar CNPJ válido", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "Teste",
        documento: "12345678000123", // CNPJ válido (todos iguais para teste)
        tipoDocumento: "CNPJ",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "11987654321",
        representanteNome: "João Silva",
      });

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve rejeitar CNPJ inválido", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "Teste",
        documento: "12345678000100",
        tipoDocumento: "CNPJ",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "11987654321",
        representanteNome: "João Silva",
      });

      await expect(repo.save(fornecedor)).rejects.toThrow("CNPJ inválido");
    });

    it("deve aceitar telefone válido", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "Teste",
        documento: "12345678000123",
        tipoDocumento: "CNPJ",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "11987654321",
        representanteNome: "João Silva",
      });

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve rejeitar telefone inválido", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "Teste",
        documento: "12345678000123",
        tipoDocumento: "CNPJ",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "1234567890", // DDD inválido
        representanteNome: "João Silva",
      });

      await expect(repo.save(fornecedor)).rejects.toThrow(
        "Telefone deve ter 10 ou 11 dígitos"
      );
    });
  });

  describe("Campos opcionais", () => {
    it("deve aceitar telefone secundário vazio", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "Teste",
        documento: "12345678000123",
        tipoDocumento: "CNPJ",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "11987654321",
        telefoneSecundario: "",
        representanteNome: "João Silva",
      });

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve aceitar email vazio", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "Teste",
        documento: "12345678000123",
        tipoDocumento: "CNPJ",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "11987654321",
        email: "",
        representanteNome: "João Silva",
      });

      await expect(repo.save(fornecedor)).resolves.not.toThrow();
    });

    it("deve rejeitar email inválido se preenchido", async () => {
      const fornecedor = repo.create({
        razaoSocial: "Empresa Teste",
        nomeFantasia: "Teste",
        documento: "12345678000123",
        tipoDocumento: "CNPJ",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Bairro Teste",
        cidade: "Cidade Teste",
        estado: "SP",
        cep: "12345-678",
        telefonePrincipal: "11987654321",
        email: "email-invalido",
        representanteNome: "João Silva",
      });

      await expect(repo.save(fornecedor)).rejects.toThrow("Email inválido");
    });
  });
});
