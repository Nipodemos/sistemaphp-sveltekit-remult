import { describe, it, expect, beforeAll } from "vitest";
import { remult } from "remult";
import { Estoque } from "$shared/estoque/estoque.model";

describe("Estoque Model", () => {
  let repo: any;

  beforeAll(() => {
    repo = remult.repo(Estoque);
  });

  describe("Validações básicas", () => {
    it("deve aceitar estoque válido", async () => {
      const estoque = repo.create({
        saldoReal: 100,
        saldoDisponivel: 90,
        empresa: { id: "empresa-id" },
        produto: { id: "produto-id" },
        variacaoValor: { id: "variacao-id" },
      });

      await expect(repo.save(estoque)).resolves.not.toThrow();
    });

    it("deve aceitar saldos zero", async () => {
      const estoque = repo.create({
        saldoReal: 0,
        saldoDisponivel: 0,
        empresa: { id: "empresa-id" },
        produto: { id: "produto-id" },
        variacaoValor: { id: "variacao-id" },
      });

      await expect(repo.save(estoque)).resolves.not.toThrow();
    });
  });

  describe("Campos numéricos", () => {
    it("deve aceitar saldos positivos", async () => {
      const estoque = repo.create({
        saldoReal: 50.5,
        saldoDisponivel: 45.5,
        empresa: { id: "empresa-id" },
        produto: { id: "produto-id" },
        variacaoValor: { id: "variacao-id" },
      });

      await expect(repo.save(estoque)).resolves.not.toThrow();
    });

    it("deve aceitar saldos negativos", async () => {
      const estoque = repo.create({
        saldoReal: -10,
        saldoDisponivel: -5,
        empresa: { id: "empresa-id" },
        produto: { id: "produto-id" },
        variacaoValor: { id: "variacao-id" },
      });

      await expect(repo.save(estoque)).resolves.not.toThrow();
    });
  });

  describe("Relações obrigatórias", () => {
    it("deve ter empresa associada", async () => {
      const estoque = repo.create({
        saldoReal: 100,
        saldoDisponivel: 90,
        empresa: { id: "empresa-id" },
        produto: { id: "produto-id" },
        variacaoValor: { id: "variacao-id" },
      });

      expect(estoque.empresa).toBeDefined();
      expect(estoque.produto).toBeDefined();
      expect(estoque.variacaoValor).toBeDefined();
    });
  });
});
