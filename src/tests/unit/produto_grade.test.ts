import { describe, it, expect, beforeAll } from "vitest";
import { remult } from "remult";
import { ProdutoGrade } from "$shared/produto_grade/produto_grade.model";

describe("ProdutoGrade Model", () => {
  let repo: any;

  beforeAll(() => {
    repo = remult.repo(ProdutoGrade);
  });

  describe("Validações de campos obrigatórios", () => {
    it("deve rejeitar produtoId vazio", async () => {
      const grade = repo.create({
        produtoId: "",
        variacaoValor1Id: "variacao1-id",
        ativo: true,
        produto: { id: "produto-id" },
        variacaoValor1: { id: "variacao1-id" },
      });

      await expect(repo.save(grade)).rejects.toThrow("ID do Produto");
    });

    it("deve rejeitar variacaoValor1Id vazio", async () => {
      const grade = repo.create({
        produtoId: "produto-id",
        variacaoValor1Id: "",
        ativo: true,
        produto: { id: "produto-id" },
        variacaoValor1: { id: "variacao1-id" },
      });

      await expect(repo.save(grade)).rejects.toThrow("Variação 1");
    });

    it("deve aceitar grade válida", async () => {
      const grade = repo.create({
        produtoId: "produto-id",
        variacaoValor1Id: "variacao1-id",
        ativo: true,
        produto: { id: "produto-id" },
        variacaoValor1: { id: "variacao1-id" },
      });

      await expect(repo.save(grade)).resolves.not.toThrow();
    });
  });

  describe("Variações opcionais", () => {
    it("deve aceitar sem variação 2", async () => {
      const grade = repo.create({
        produtoId: "produto-id",
        variacaoValor1Id: "variacao1-id",
        variacaoValor2Id: "",
        ativo: true,
        produto: { id: "produto-id" },
        variacaoValor1: { id: "variacao1-id" },
      });

      await expect(repo.save(grade)).resolves.not.toThrow();
    });

    it("deve aceitar sem variação 3", async () => {
      const grade = repo.create({
        produtoId: "produto-id",
        variacaoValor1Id: "variacao1-id",
        variacaoValor2Id: "variacao2-id",
        variacaoValor3Id: "",
        ativo: true,
        produto: { id: "produto-id" },
        variacaoValor1: { id: "variacao1-id" },
        variacaoValor2: { id: "variacao2-id" },
      });

      await expect(repo.save(grade)).resolves.not.toThrow();
    });

    it("deve aceitar todas as variações", async () => {
      const grade = repo.create({
        produtoId: "produto-id",
        variacaoValor1Id: "variacao1-id",
        variacaoValor2Id: "variacao2-id",
        variacaoValor3Id: "variacao3-id",
        ativo: true,
        produto: { id: "produto-id" },
        variacaoValor1: { id: "variacao1-id" },
        variacaoValor2: { id: "variacao2-id" },
        variacaoValor3: { id: "variacao3-id" },
      });

      await expect(repo.save(grade)).resolves.not.toThrow();
    });
  });

  describe("Status ativo", () => {
    it("deve aceitar ativo true", async () => {
      const grade = repo.create({
        produtoId: "produto-id",
        variacaoValor1Id: "variacao1-id",
        ativo: true,
        produto: { id: "produto-id" },
        variacaoValor1: { id: "variacao1-id" },
      });

      await expect(repo.save(grade)).resolves.not.toThrow();
    });

    it("deve aceitar ativo false", async () => {
      const grade = repo.create({
        produtoId: "produto-id",
        variacaoValor1Id: "variacao1-id",
        ativo: false,
        produto: { id: "produto-id" },
        variacaoValor1: { id: "variacao1-id" },
      });

      await expect(repo.save(grade)).resolves.not.toThrow();
    });
  });

  describe("Relações", () => {
    it("deve ter produto associado", async () => {
      const grade = repo.create({
        produtoId: "produto-id",
        variacaoValor1Id: "variacao1-id",
        ativo: true,
        produto: { id: "produto-id" },
        variacaoValor1: { id: "variacao1-id" },
      });

      expect(grade.produto).toBeDefined();
      expect(grade.variacaoValor1).toBeDefined();
    });
  });
});
