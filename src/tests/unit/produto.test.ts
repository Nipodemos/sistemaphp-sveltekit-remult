import { describe, it, expect, beforeAll } from "vitest";
import { remult } from "remult";
import { Produto } from "$shared/produto/produto.model";

describe("Produto Model", () => {
  let repo: any;

  beforeAll(() => {
    repo = remult.repo(Produto);
  });

  describe("Validações de campos obrigatórios", () => {
    it("deve rejeitar categoriaId vazio", async () => {
      const produto = repo.create({
        categoriaId: "",
        fornecedorId: "fornecedor-id",
        descricao: "Produto Teste",
        precoCusto: 10.0,
        precoVenda: 15.0,
        unidadeMedida: "UN",
        variacao1: "Cor",
        fornecedor: { id: "fornecedor-id" },
      });

      await expect(repo.save(produto)).rejects.toThrow("Categoria");
    });

    it("deve rejeitar fornecedorId vazio", async () => {
      const produto = repo.create({
        categoriaId: "categoria-id",
        fornecedorId: "",
        descricao: "Produto Teste",
        precoCusto: 10.0,
        precoVenda: 15.0,
        unidadeMedida: "UN",
        variacao1: "Cor",
        fornecedor: { id: "fornecedor-id" },
      });

      await expect(repo.save(produto)).rejects.toThrow("Fornecedor");
    });

    it("deve rejeitar descricao vazia", async () => {
      const produto = repo.create({
        categoriaId: "categoria-id",
        fornecedorId: "fornecedor-id",
        descricao: "",
        precoCusto: 10.0,
        precoVenda: 15.0,
        unidadeMedida: "UN",
        variacao1: "Cor",
        fornecedor: { id: "fornecedor-id" },
      });

      await expect(repo.save(produto)).rejects.toThrow("Descrição");
    });

    it("deve aceitar produto válido", async () => {
      const produto = repo.create({
        categoriaId: "categoria-id",
        fornecedorId: "fornecedor-id",
        descricao: "Produto Teste",
        precoCusto: 10.0,
        precoVenda: 15.0,
        unidadeMedida: "UN",
        variacao1: "Cor",
        fornecedor: { id: "fornecedor-id" },
      });

      await expect(repo.save(produto)).resolves.not.toThrow();
    });
  });

  describe("Validações de preço", () => {
    it("deve rejeitar preço de custo zero ou negativo", async () => {
      const produto = repo.create({
        categoriaId: "categoria-id",
        fornecedorId: "fornecedor-id",
        descricao: "Produto Teste",
        precoCusto: 0,
        precoVenda: 15.0,
        unidadeMedida: "UN",
        variacao1: "Cor",
        fornecedor: { id: "fornecedor-id" },
      });

      await expect(repo.save(produto)).rejects.toThrow("Preço de custo");
    });

    it("deve rejeitar preço de venda zero ou negativo", async () => {
      const produto = repo.create({
        categoriaId: "categoria-id",
        fornecedorId: "fornecedor-id",
        descricao: "Produto Teste",
        precoCusto: 10.0,
        precoVenda: -5.0,
        unidadeMedida: "UN",
        variacao1: "Cor",
        fornecedor: { id: "fornecedor-id" },
      });

      await expect(repo.save(produto)).rejects.toThrow("Preço de venda");
    });

    it("deve aceitar preços positivos", async () => {
      const produto = repo.create({
        categoriaId: "categoria-id",
        fornecedorId: "fornecedor-id",
        descricao: "Produto Teste",
        precoCusto: 10.5,
        precoVenda: 15.99,
        unidadeMedida: "KG",
        variacao1: "Cor",
        fornecedor: { id: "fornecedor-id" },
      });

      await expect(repo.save(produto)).resolves.not.toThrow();
    });
  });

  describe("Unidade de medida", () => {
    it("deve aceitar unidades válidas", async () => {
      const unidades = ["UN", "KG", "LT", "M"];

      for (const unidade of unidades) {
        const produto = repo.create({
          categoriaId: "categoria-id",
          fornecedorId: "fornecedor-id",
          descricao: "Produto Teste",
          precoCusto: 10.0,
          precoVenda: 15.0,
          unidadeMedida: unidade,
          variacao1: "Cor",
          fornecedor: { id: "fornecedor-id" },
        });

        await expect(repo.save(produto)).resolves.not.toThrow();
      }
    });
  });

  describe("Variações", () => {
    it("deve aceitar variações definidas", async () => {
      const produto = repo.create({
        categoriaId: "categoria-id",
        fornecedorId: "fornecedor-id",
        descricao: "Produto Teste",
        precoCusto: 10.0,
        precoVenda: 15.0,
        unidadeMedida: "UN",
        variacao1: "Cor",
        variacao2: "Tamanho",
        variacao3: "Material",
        fornecedor: { id: "fornecedor-id" },
      });

      await expect(repo.save(produto)).resolves.not.toThrow();
    });
  });
});
