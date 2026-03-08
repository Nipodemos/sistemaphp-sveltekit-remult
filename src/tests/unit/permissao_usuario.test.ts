import { describe, it, expect, beforeAll } from "vitest";
import { remult } from "remult";
import { PermissaoUsuario } from "$shared/permissao_usuario/permissao_usuario.model";

describe("PermissaoUsuario Model", () => {
  let repo: any;

  beforeAll(() => {
    repo = remult.repo(PermissaoUsuario);
  });

  describe("Validações de campos obrigatórios", () => {
    it("deve rejeitar usuarioId vazio", async () => {
      const permissao = repo.create({
        usuarioId: "",
        tela: "vendas",
        regra: "visualizar",
      });

      await expect(repo.save(permissao)).rejects.toThrow();
    });

    it("deve rejeitar tela vazia", async () => {
      const permissao = repo.create({
        usuarioId: "usuario-id",
        tela: "",
        regra: "visualizar",
      });

      await expect(repo.save(permissao)).rejects.toThrow();
    });

    it("deve rejeitar regra vazia", async () => {
      const permissao = repo.create({
        usuarioId: "usuario-id",
        tela: "vendas",
        regra: "",
      });

      await expect(repo.save(permissao)).rejects.toThrow();
    });

    it("deve aceitar permissão válida", async () => {
      const permissao = repo.create({
        usuarioId: "usuario-id",
        tela: "vendas",
        regra: "visualizar",
      });

      await expect(repo.save(permissao)).resolves.not.toThrow();
    });
  });

  describe("Validações de formato", () => {
    it("deve aceitar tela válida", async () => {
      const permissao = repo.create({
        usuarioId: "usuario-id",
        tela: "produtos",
        regra: "adicionar",
      });

      await expect(repo.save(permissao)).resolves.not.toThrow();
    });

    it("deve rejeitar tela inválida", async () => {
      const permissao = repo.create({
        usuarioId: "usuario-id",
        tela: "tela-inexistente",
        regra: "visualizar",
      });

      await expect(repo.save(permissao)).rejects.toThrow("Tela");
    });

    it("deve aceitar regra válida", async () => {
      const permissao = repo.create({
        usuarioId: "usuario-id",
        tela: "vendas",
        regra: "editar",
      });

      await expect(repo.save(permissao)).resolves.not.toThrow();
    });

    it("deve rejeitar regra inválida", async () => {
      const permissao = repo.create({
        usuarioId: "usuario-id",
        tela: "vendas",
        regra: "regra-inexistente",
      });

      await expect(repo.save(permissao)).rejects.toThrow("Regra");
    });
  });

  describe("Relações", () => {
    it("deve ter usuário associado", async () => {
      const permissao = repo.create({
        usuarioId: "usuario-id",
        tela: "vendas",
        regra: "visualizar",
      });

      expect(permissao.usuarioId).toBe("usuario-id");
    });
  });
});
