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
        caminhoIds: "550e8400-e29b-41d4-a716-446655440000",
        ativo: true,
      });

      await expect(repo.save(categoria)).rejects.toThrow();
    });

    it("deve aceitar categoria válida", async () => {
      const categoria = repo.create({
        nome: "Categoria Teste",
        nivel: 1,
        caminho: "Categoria Teste",
        caminhoIds: "550e8400-e29b-41d4-a716-446655440000",
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
        caminhoIds: "550e8400-e29b-41d4-a716-446655440001",
        ativo: true,
        categoriaPai: undefined,
      });

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });

    it("deve aceitar caminhoIds válido", async () => {
      const categoria = repo.create({
        nome: "Categoria Teste",
        nivel: 1,
        caminho: "Categoria Teste",
        caminhoIds: "550e8400-e29b-41d4-a716-446655440002",
        ativo: true,
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
        caminhoIds: "550e8400-e29b-41d4-a716-446655440003",
        ativo: true,
      });

      await expect(repo.save(categoria)).rejects.toThrow(
        "Categoria pai é obrigatória"
      );
    });
  });

  describe("Alteração de nível", () => {
    it("deve bloquear alteração de nível", async () => {
      // Criar categoria nível 1
      const categoria = repo.create({
        nome: "Categoria Nivel 1",
        nivel: 1,
        caminho: "Categoria Nivel 1",
        caminhoIds: "550e8400-e29b-41d4-a716-446655440004",
        ativo: true,
      });

      await repo.save(categoria);

      // Tentar alterar nível para 2
      categoria.nivel = 2;

      await expect(repo.save(categoria)).rejects.toThrow(
        "Não é permitido alterar o nível da categoria"
      );
    });
  });

  describe("Alteração de categoria pai", () => {
    it("deve permitir alteração de categoria pai", async () => {
      // Criar categoria pai nível 1
      const categoriaPai1 = repo.create({
        nome: "Categoria Pai 1",
        nivel: 1,
        caminho: "Categoria Pai 1",
        caminhoIds: "550e8400-e29b-41d4-a716-446655440005",
        ativo: true,
      });

      await repo.save(categoriaPai1);

      // Criar categoria pai nível 2
      const categoriaPai2 = repo.create({
        nome: "Categoria Pai 2",
        nivel: 2,
        caminho: "Categoria Pai 1 / Categoria Pai 2",
        caminhoIds:
          "550e8400-e29b-41d4-a716-446655440005,550e8400-e29b-41d4-a716-446655440006",
        ativo: true,
        categoriaPai: categoriaPai1,
      });

      await repo.save(categoriaPai2);

      // Criar categoria filha nível 3
      const categoriaFilha = repo.create({
        nome: "Categoria Filha",
        nivel: 3,
        caminho: "Categoria Pai 1 / Categoria Pai 2 / Categoria Filha",
        caminhoIds:
          "550e8400-e29b-41d4-a716-446655440005,550e8400-e29b-41d4-a716-446655440006,550e8400-e29b-41d4-a716-446655440007",
        ativo: true,
        categoriaPai: categoriaPai2,
      });

      await repo.save(categoriaFilha);

      // Alterar pai da categoria filha
      categoriaFilha.categoriaPai = categoriaPai1;

      await expect(repo.save(categoriaFilha)).resolves.not.toThrow();
    });

    it("deve rejeitar categoria pai inexistente", async () => {
      // Criar categoria
      const categoria = repo.create({
        nome: "Categoria Teste Pai Inexistente",
        nivel: 2,
        caminho: "Categoria Teste Pai Inexistente",
        caminhoIds: "550e8400-e29b-41d4-a716-446655440008",
        ativo: true,
        categoriaPai: { id: "id-inexistente" },
      });

      await expect(repo.save(categoria)).rejects.toThrow(
        "Categoria pai não encontrada"
      );
    });

    it("deve rejeitar categoria pai com nível igual ou superior", async () => {
      // Criar categoria nível 2
      const categoriaPai = repo.create({
        nome: "Categoria Pai Nivel 2",
        nivel: 2,
        caminho: "Categoria Pai Nivel 2",
        caminhoIds: "550e8400-e29b-41d4-a716-446655440009",
        ativo: true,
      });

      await repo.save(categoriaPai);

      // Criar categoria nível 2 tentando usar pai nível 2
      const categoria = repo.create({
        nome: "Categoria Nivel 2 Com Pai Nivel 2",
        nivel: 2,
        caminho: "Categoria Nivel 2 Com Pai Nivel 2",
        caminhoIds: "550e8400-e29b-41d4-a716-446655440010",
        ativo: true,
        categoriaPai: categoriaPai,
      });

      await expect(repo.save(categoria)).rejects.toThrow(
        "Categoria pai deve ter nível inferior"
      );
    });

    it("deve rejeitar criação de ciclos na hierarquia", async () => {
      // Criar categoria A nível 1
      const categoriaA = repo.create({
        nome: "Categoria A",
        nivel: 1,
        caminho: "Categoria A",
        caminhoIds: "550e8400-e29b-41d4-a716-446655440011",
        ativo: true,
      });

      await repo.save(categoriaA);

      // Criar categoria B nível 2 filha de A
      const categoriaB = repo.create({
        nome: "Categoria B",
        nivel: 2,
        caminho: "Categoria A / Categoria B",
        caminhoIds:
          "550e8400-e29b-41d4-a716-446655440011,550e8400-e29b-41d4-a716-446655440012",
        ativo: true,
        categoriaPai: categoriaA,
      });

      await repo.save(categoriaB);

      // Tentar fazer A ser filha de B (criaria ciclo)
      categoriaA.categoriaPai = categoriaB;

      await expect(repo.save(categoriaA)).rejects.toThrow(
        "Não é possível criar um ciclo na hierarquia"
      );
    });
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
        caminhoIds: "550e8400-e29b-41d4-a716-446655440000",
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
        caminhoIds: "550e8400-e29b-41d4-a716-446655440001",
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
      // Criar categoria pai primeiro
      const categoriaPai = repo.create({
        nome: "Categoria Pai",
        nivel: 1,
        caminho: "Categoria Pai",
        ativo: true,
      });

      await repo.save(categoriaPai);

      // Agora criar categoria nível 2 com pai válido
      const categoria = repo.create({
        nome: "Categoria Teste",
        nivel: 2,
        caminho: "Categoria Pai / Categoria Teste",
        ativo: true,
        categoriaPai: categoriaPai,
      });

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });
  });

  describe("Alteração de nível", () => {
    it("deve bloquear alteração de nível", async () => {
      // Criar categoria nível 1
      const categoria = repo.create({
        nome: "Categoria Nivel 1",
        nivel: 1,
        caminho: "Categoria Nivel 1",
        caminhoIds: "550e8400-e29b-41d4-a716-446655440013",
        ativo: true,
      });

      await repo.save(categoria);

      // Tentar alterar nível para 2 sem fornecer categoria pai
      categoria.nivel = 2;
      // Não definir categoriaPai para forçar o erro correto

      await expect(repo.save(categoria)).rejects.toThrow(
        "Não é permitido alterar o nível da categoria"
      );
    });
  });

  describe("Alteração de categoria pai", () => {
    it("deve permitir alteração de categoria pai", async () => {
      // Criar categoria pai nível 1
      const categoriaPai1 = repo.create({
        nome: "Categoria Pai 1",
        nivel: 1,
        caminho: "Categoria Pai 1",
        ativo: true,
      });

      await repo.save(categoriaPai1);

      // Criar categoria pai nível 2
      const categoriaPai2 = repo.create({
        nome: "Categoria Pai 2",
        nivel: 2,
        caminho: "Categoria Pai 1 / Categoria Pai 2",
        ativo: true,
        categoriaPai: categoriaPai1,
      });

      await repo.save(categoriaPai2);

      // Criar categoria filha nível 3
      const categoriaFilha = repo.create({
        nome: "Categoria Filha",
        nivel: 3,
        caminho: "Categoria Pai 1 / Categoria Pai 2 / Categoria Filha",
        ativo: true,
        categoriaPai: categoriaPai2,
      });

      await repo.save(categoriaFilha);

      // Alterar pai da categoria filha
      categoriaFilha.categoriaPai = categoriaPai1;

      await expect(repo.save(categoriaFilha)).resolves.not.toThrow();
    });

    it("deve rejeitar categoria pai inexistente", async () => {
      // Criar categoria
      const categoria = repo.create({
        nome: "Categoria Teste Pai Inexistente",
        nivel: 2,
        caminho: "Categoria Teste Pai Inexistente",
        ativo: true,
        categoriaPai: { id: "id-inexistente" },
      });

      await expect(repo.save(categoria)).rejects.toThrow(
        "Categoria pai não encontrada"
      );
    });

    it("deve rejeitar categoria pai com nível igual ou superior", async () => {
      // Criar categoria nível 2
      const categoriaPai = repo.create({
        nome: "Categoria Pai Nivel 2",
        nivel: 2,
        caminho: "Categoria Pai Nivel 2",
        ativo: true,
      });

      await repo.save(categoriaPai);

      // Criar categoria nível 2 tentando usar pai nível 2
      const categoria = repo.create({
        nome: "Categoria Nivel 2 Com Pai Nivel 2",
        nivel: 2,
        caminho: "Categoria Nivel 2 Com Pai Nivel 2",
        ativo: true,
        categoriaPai: categoriaPai,
      });

      await expect(repo.save(categoria)).rejects.toThrow(
        "Categoria pai deve ter nível inferior"
      );
    });

    it("deve rejeitar criação de ciclos na hierarquia", async () => {
      // Criar categoria A nível 1
      const categoriaA = repo.create({
        nome: "Categoria A",
        nivel: 1,
        caminho: "Categoria A",
        ativo: true,
      });

      await repo.save(categoriaA);

      // Criar categoria B nível 2 filha de A
      const categoriaB = repo.create({
        nome: "Categoria B",
        nivel: 2,
        caminho: "Categoria A / Categoria B",
        ativo: true,
        categoriaPai: categoriaA,
      });

      await repo.save(categoriaB);

      // Tentar fazer A ser filha de B (criaria ciclo)
      categoriaA.categoriaPai = categoriaB;

      await expect(repo.save(categoriaA)).rejects.toThrow(
        "Não é possível criar um ciclo na hierarquia"
      );
    });
  });
});
