import { describe, it, expect, beforeAll } from "vitest";
import { remult } from "remult";
import { Usuario } from "$shared/usuario/usuario.model";

describe("Usuario Model", () => {
  let repo: any;

  beforeAll(() => {
    repo = remult.repo(Usuario);
  });

  describe("Validações de campos obrigatórios", () => {
    it("deve rejeitar nome vazio", async () => {
      const usuario = repo.create({
        nome: "",
        login: "teste",
        senha: "12345678",
        cargos: ["admin"],
      });

      await expect(repo.save(usuario)).rejects.toThrow("Nome");
    });

    it("deve rejeitar login vazio", async () => {
      const usuario = repo.create({
        nome: "Usuário Teste",
        login: "",
        senha: "12345678",
        cargos: ["admin"],
      });

      await expect(repo.save(usuario)).rejects.toThrow("Login");
    });

    it("deve rejeitar senha curta", async () => {
      const usuario = repo.create({
        nome: "Usuário Teste",
        login: "teste",
        senha: "123",
        cargos: ["admin"],
      });

      await expect(repo.save(usuario)).rejects.toThrow("Senha");
    });

    it("deve aceitar usuário válido", async () => {
      const usuario = repo.create({
        nome: "Usuário Teste",
        login: "teste",
        senha: "12345678",
        cargos: ["admin"],
      });

      await expect(repo.save(usuario)).resolves.not.toThrow();
    });
  });

  describe("Validações de formato", () => {
    it("deve aceitar nome longo", async () => {
      const usuario = repo.create({
        nome: "Um nome muito longo para testar se o campo aceita textos maiores",
        login: "teste",
        senha: "12345678",
        cargos: ["admin"],
      });

      await expect(repo.save(usuario)).resolves.not.toThrow();
    });

    it("deve aceitar login com números e letras", async () => {
      const usuario = repo.create({
        nome: "Usuário Teste",
        login: "usuario123",
        senha: "12345678",
        cargos: ["admin"],
      });

      await expect(repo.save(usuario)).resolves.not.toThrow();
    });
  });

  describe("Cargos", () => {
    it("deve aceitar array de cargos vazio", async () => {
      const usuario = repo.create({
        nome: "Usuário Teste",
        login: "teste",
        senha: "12345678",
        cargos: [],
      });

      await expect(repo.save(usuario)).resolves.not.toThrow();
    });

    it("deve aceitar múltiplos cargos", async () => {
      const usuario = repo.create({
        nome: "Usuário Teste",
        login: "teste",
        senha: "12345678",
        cargos: ["admin", "vendedor", "gerente"],
      });

      await expect(repo.save(usuario)).resolves.not.toThrow();
    });

    it("deve aceitar cargo único", async () => {
      const usuario = repo.create({
        nome: "Usuário Teste",
        login: "teste",
        senha: "12345678",
        cargos: ["vendedor"],
      });

      await expect(repo.save(usuario)).resolves.not.toThrow();
    });
  });

  describe("Relações", () => {
    it("deve aceitar permissões vazias", async () => {
      const usuario = repo.create({
        nome: "Usuário Teste",
        login: "teste",
        senha: "12345678",
        cargos: ["admin"],
        permissoes: [],
      });

      await expect(repo.save(usuario)).resolves.not.toThrow();
    });
  });
});
