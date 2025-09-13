import { describe, it, expect, beforeAll } from "vitest";
import { remult } from "remult";
import { Tela } from "$shared/tela/tela.model";

describe("Tela Model", () => {
  let repo: any;

  beforeAll(() => {
    repo = remult.repo(Tela);
  });

  describe("Validações básicas", () => {
    it("deve aceitar tela válida", async () => {
      const tela = repo.create({
        categoria: "Vendas",
        descricao: "Tela de Vendas",
        url: "/vendas",
        ordem: 1,
      });

      await expect(repo.save(tela)).resolves.not.toThrow();
    });

    it("deve aceitar categoria vazia", async () => {
      const tela = repo.create({
        categoria: "",
        descricao: "Tela sem categoria",
        url: "/sem-categoria",
        ordem: 2,
      });

      await expect(repo.save(tela)).resolves.not.toThrow();
    });
  });

  describe("Campos de texto", () => {
    it("deve aceitar descrição longa", async () => {
      const tela = repo.create({
        categoria: "Teste",
        descricao:
          "Uma descrição muito longa para testar se o campo aceita textos maiores sem problemas de validação",
        url: "/teste",
        ordem: 1,
      });

      await expect(repo.save(tela)).resolves.not.toThrow();
    });

    it("deve aceitar URL complexa", async () => {
      const tela = repo.create({
        categoria: "Teste",
        descricao: "Tela de teste",
        url: "/admin/usuarios/gerenciar/permissoes",
        ordem: 1,
      });

      await expect(repo.save(tela)).resolves.not.toThrow();
    });
  });

  describe("Campo ordem", () => {
    it("deve aceitar ordem zero", async () => {
      const tela = repo.create({
        categoria: "Teste",
        descricao: "Tela de teste",
        url: "/teste",
        ordem: 0,
      });

      await expect(repo.save(tela)).resolves.not.toThrow();
    });

    it("deve aceitar ordem negativa", async () => {
      const tela = repo.create({
        categoria: "Teste",
        descricao: "Tela de teste",
        url: "/teste",
        ordem: -1,
      });

      await expect(repo.save(tela)).resolves.not.toThrow();
    });

    it("deve aceitar ordem positiva alta", async () => {
      const tela = repo.create({
        categoria: "Teste",
        descricao: "Tela de teste",
        url: "/teste",
        ordem: 999,
      });

      await expect(repo.save(tela)).resolves.not.toThrow();
    });
  });

  describe("Campos obrigatórios", () => {
    it("deve aceitar todos os campos preenchidos", async () => {
      const tela = repo.create({
        categoria: "Administração",
        descricao: "Painel Administrativo",
        url: "/admin",
        ordem: 10,
      });

      expect(tela.categoria).toBe("Administração");
      expect(tela.descricao).toBe("Painel Administrativo");
      expect(tela.url).toBe("/admin");
      expect(tela.ordem).toBe(10);
    });
  });
});
