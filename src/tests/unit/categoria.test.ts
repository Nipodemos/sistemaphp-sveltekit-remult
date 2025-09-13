import { describe, it, expect, beforeAll } from "vitest";
import { remult } from "remult";
import { Categoria } from "$shared/categoria/categoria.model";

describe("Categoria Model", () => {
  let repo: any;

  beforeAll(() => {
    repo = remult.repo(Categoria);
  });

  describe("Validações de campos obrigatórios", () => {
    it("deve rejeitar nome vazio", async () => {
      const categoria = repo.create({
        nome: "",
        nivel: 1,
        caminho: "Teste",
        ativo: true,
      });

      await expect(repo.save(categoria)).rejects.toThrow();
    });

    it("deve aceitar categoria válida", async () => {
      const categoria = repo.create({
        nome: "Categoria Teste",
        nivel: 1,
        caminho: "Categoria Teste",
        ativo: true,
      });

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });
  });

  describe("Campos opcionais", () => {
    it("deve aceitar categoria pai vazio", async () => {
      const categoria = repo.create({
        nome: "Categoria Teste",
        nivel: 1,
        caminho: "Categoria Teste",
        ativo: true,
        categoriaPai: undefined,
      });

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });

    it("deve aceitar caminhoIds vazio", async () => {
      const categoria = repo.create({
        nome: "Categoria Teste",
        nivel: 1,
        caminho: "Categoria Teste",
        ativo: true,
        caminhoIds: undefined,
      });

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });
  });

  describe("Validações de formato", () => {
    it("deve aceitar nível válido", async () => {
      const categoria = repo.create({
        nome: "Categoria Teste",
        nivel: 2,
        caminho: "Categoria Teste",
        ativo: true,
      });

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });
  });
});
