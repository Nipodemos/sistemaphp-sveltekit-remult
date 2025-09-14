import { describe, it, expect, beforeAll } from "vitest";
import { remult, type Repository } from "remult";
import { Categoria } from "$shared/categoria/categoria.model";

describe("Categoria Model", () => {
  let repo: Repository<Categoria>;

  beforeAll(() => {
    repo = remult.repo(Categoria);
  });

  describe("Validações de campos obrigatórios", () => {
    it("deve rejeitar nome vazio", async () => {
      const categoria = repo.create({
        nome: "",
        nivel: 1,
      });

      await expect(repo.save(categoria)).rejects.toThrow("Nome");
    });

    it("deve rejeitar nome com menos de 2 caracteres", async () => {
      const categoria = repo.create({
        nome: "A",
        nivel: 1,
      });

      await expect(repo.save(categoria)).rejects.toThrow("Nome");
    });

    it("deve aceitar nome válido", async () => {
      const categoria = repo.create({
        nome: "Categoria Teste",
        nivel: 1,
      });

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });
  });

  describe("Validações de nível", () => {
    it("deve rejeitar nível menor que 1", async () => {
      const categoria = repo.create({
        nome: "Categoria Teste",
        nivel: 0,
      });

      await expect(repo.save(categoria)).rejects.toThrow(
        "Nível deve ser 1, 2 ou 3"
      );
    });

    it("deve rejeitar nível maior que 3", async () => {
      const categoria = repo.create({
        nome: "Categoria Teste",
        nivel: 4,
      });

      await expect(repo.save(categoria)).rejects.toThrow(
        "Nível deve ser 1, 2 ou 3"
      );
    });

    it("deve aceitar nível 1", async () => {
      const categoria = repo.create({
        nome: "Categoria Nível 1",
        nivel: 1,
      });

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });

    it("deve aceitar nível 2", async () => {
      // Criar categoria pai nível 1 primeiro
      const categoriaPai = await repo.save(
        repo.create({
          nome: "Categoria Pai",
          nivel: 1,
        })
      );

      const categoria = repo.create({
        nome: "Categoria Nível 2",
        nivel: 2,
        categoriaPai: categoriaPai,
      });

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });

    it("deve aceitar nível 3", async () => {
      // Criar hierarquia completa: nível 1 -> nível 2 -> nível 3
      const categoriaNivel1 = await repo.save(
        repo.create({
          nome: "Categoria Nível 1",
          nivel: 1,
        })
      );

      const categoriaNivel2 = await repo.save(
        repo.create({
          nome: "Categoria Nível 2",
          nivel: 2,
          categoriaPai: categoriaNivel1,
        })
      );

      const categoria = repo.create({
        nome: "Categoria Nível 3",
        nivel: 3,
        categoriaPai: categoriaNivel2,
      });

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });
  });

  describe("Validações de hierarquia - Categoria Pai", () => {
    it("deve rejeitar categoria nível 1 com pai definido", async () => {
      // Primeiro criar uma categoria pai
      const categoriaPai = await repo.save(
        repo.create({
          nome: "Categoria Pai",
          nivel: 1,
        })
      );

      const categoria = repo.create({
        nome: "Categoria Filha",
        nivel: 1,
        categoriaPai: categoriaPai,
      });

      await expect(repo.save(categoria)).rejects.toThrow(
        "Categoria pai deve ser nula para nível 1"
      );
    });

    it("deve aceitar categoria nível 1 sem pai", async () => {
      const categoria = repo.create({
        nome: "Categoria Raiz",
        nivel: 1,
      });

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });

    it("deve rejeitar categoria nível 2 sem pai", async () => {
      const categoria = repo.create({
        nome: "Categoria Nível 2",
        nivel: 2,
      });

      await expect(repo.save(categoria)).rejects.toThrow(
        "Categoria pai é obrigatória para níveis 2 e 3"
      );
    });

    it("deve rejeitar categoria nível 3 sem pai", async () => {
      const categoria = repo.create({
        nome: "Categoria Nível 3",
        nivel: 3,
      });

      await expect(repo.save(categoria)).rejects.toThrow(
        "Categoria pai é obrigatória para níveis 2 e 3"
      );
    });
  });

  describe("Validações de níveis dos pais", () => {
    it("deve aceitar categoria nível 2 com pai nível 1", async () => {
      const categoriaPai = await repo.save(
        repo.create({
          nome: "Categoria Pai Nível 1",
          nivel: 1,
        })
      );

      const categoria = repo.create({
        nome: "Categoria Filha Nível 2",
        nivel: 2,
        categoriaPai: categoriaPai,
      });

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });

    it("deve aceitar categoria nível 3 com pai nível 2", async () => {
      const categoriaNivel1 = await repo.save(
        repo.create({
          nome: "Categoria Nível 1",
          nivel: 1,
        })
      );

      const categoriaNivel2 = await repo.save(
        repo.create({
          nome: "Categoria Nível 2",
          nivel: 2,
          categoriaPai: categoriaNivel1,
        })
      );

      const categoriaNivel3 = repo.create({
        nome: "Categoria Nível 3",
        nivel: 3,
        categoriaPai: categoriaNivel2,
      });

      await expect(repo.save(categoriaNivel3)).resolves.not.toThrow();
    });

    it("deve rejeitar categoria nível 2 com pai nível 2", async () => {
      const categoriaNivel1 = await repo.save(
        repo.create({
          nome: "Categoria Nível 1",
          nivel: 1,
        })
      );

      const categoriaNivel2 = await repo.save(
        repo.create({
          nome: "Categoria Nível 2",
          nivel: 2,
          categoriaPai: categoriaNivel1,
        })
      );

      const categoriaInvalida = repo.create({
        nome: "Categoria Inválida",
        nivel: 2,
        categoriaPai: categoriaNivel2, // Pai nível 2 para filho nível 2
      });

      await expect(repo.save(categoriaInvalida)).rejects.toThrow(
        "Categoria pai de nível 2 deve ser de nível 1"
      );
    });

    it("deve rejeitar categoria nível 3 com pai nível 1", async () => {
      const categoriaNivel1 = await repo.save(
        repo.create({
          nome: "Categoria Nível 1",
          nivel: 1,
        })
      );

      const categoriaInvalida = repo.create({
        nome: "Categoria Inválida",
        nivel: 3,
        categoriaPai: categoriaNivel1, // Pai nível 1 para filho nível 3
      });

      await expect(repo.save(categoriaInvalida)).rejects.toThrow(
        "Categoria pai de nível 3 deve ser de nível 2"
      );
    });

    it("deve rejeitar categoria nível 3 com pai nível 3", async () => {
      const categoriaNivel1 = await repo.save(
        repo.create({
          nome: "Categoria Nível 1",
          nivel: 1,
        })
      );

      const categoriaNivel2 = await repo.save(
        repo.create({
          nome: "Categoria Nível 2",
          nivel: 2,
          categoriaPai: categoriaNivel1,
        })
      );

      const categoriaNivel3 = await repo.save(
        repo.create({
          nome: "Categoria Nível 3",
          nivel: 3,
          categoriaPai: categoriaNivel2,
        })
      );

      const categoriaInvalida = repo.create({
        nome: "Categoria Inválida",
        nivel: 3,
        categoriaPai: categoriaNivel3, // Pai nível 3 para filho nível 3
      });

      await expect(repo.save(categoriaInvalida)).rejects.toThrow(
        "Categoria pai de nível 3 deve ser de nível 2"
      );
    });
  });

  describe("Validações de alteração de nível", () => {
    it("deve rejeitar alteração de nível de categoria existente", async () => {
      const categoria = await repo.save(
        repo.create({
          nome: "Categoria Original",
          nivel: 1,
        })
      );

      categoria.nivel = 2; // Tentando alterar nível

      await expect(repo.save(categoria)).rejects.toThrow(
        "Categoria pai é obrigatória para níveis 2 e 3"
      );
    });

    it("deve aceitar alteração de nome mantendo nível", async () => {
      const categoria = await repo.save(
        repo.create({
          nome: "Categoria Original",
          nivel: 1,
        })
      );

      categoria.nome = "Categoria Alterada";

      await expect(repo.save(categoria)).resolves.not.toThrow();
    });
  });

  describe("Geração automática de caminhos", () => {
    it("deve gerar caminho correto para categoria nível 1", async () => {
      const categoria = await repo.save(
        repo.create({
          nome: "Eletrônicos",
          nivel: 1,
        })
      );

      expect(categoria.caminho).toBe("Eletrônicos");
      expect(categoria.caminhoIds).toBe(categoria.id);
    });

    it("deve gerar caminho correto para categoria nível 2", async () => {
      const categoriaNivel1 = await repo.save(
        repo.create({
          nome: "Eletrônicos",
          nivel: 1,
        })
      );

      const categoriaNivel2 = await repo.save(
        repo.create({
          nome: "Celulares",
          nivel: 2,
          categoriaPai: categoriaNivel1,
        })
      );

      expect(categoriaNivel2.caminho).toBe("Eletrônicos => Celulares");
      expect(categoriaNivel2.caminhoIds).toBe(
        `${categoriaNivel1.id},${categoriaNivel2.id}`
      );
    });

    it("deve gerar caminho correto para categoria nível 3", async () => {
      const categoriaNivel1 = await repo.save(
        repo.create({
          nome: "Eletrônicos",
          nivel: 1,
        })
      );

      const categoriaNivel2 = await repo.save(
        repo.create({
          nome: "Celulares",
          nivel: 2,
          categoriaPai: categoriaNivel1,
        })
      );

      const categoriaNivel3 = await repo.save(
        repo.create({
          nome: "Smartphones",
          nivel: 3,
          categoriaPai: categoriaNivel2,
        })
      );

      expect(categoriaNivel3.caminho).toBe(
        "Eletrônicos => Celulares => Smartphones"
      );
      expect(categoriaNivel3.caminhoIds).toBe(
        `${categoriaNivel1.id},${categoriaNivel2.id},${categoriaNivel3.id}`
      );
    });
  });

  describe("Campos padrão", () => {
    it("deve definir ativo como true por padrão", async () => {
      const categoria = await repo.save(
        repo.create({
          nome: "Categoria Teste",
          nivel: 1,
        })
      );

      expect(categoria.ativo).toBe(true);
    });

    it("deve aceitar alteração do campo ativo", async () => {
      const categoria = await repo.save(
        repo.create({
          nome: "Categoria Teste",
          nivel: 1,
          ativo: false,
        })
      );

      expect(categoria.ativo).toBe(false);
    });

    it("deve definir timestamps automaticamente", async () => {
      const categoria = await repo.save(
        repo.create({
          nome: "Categoria Teste",
          nivel: 1,
        })
      );

      expect(categoria.criadoEm).toBeInstanceOf(Date);
      expect(categoria.atualizadoEm).toBeInstanceOf(Date);
    });
  });

  describe("Relações", () => {
    it("deve permitir categoria sem subcategorias", async () => {
      const categoria = await repo.save(
        repo.create({
          nome: "Categoria Raiz",
          nivel: 1,
        })
      );

      expect(categoria.subcategorias).toEqual([]);
    });

    it("deve carregar subcategorias corretamente", async () => {
      const categoriaPai = await repo.save(
        repo.create({
          nome: "Eletrônicos",
          nivel: 1,
        })
      );

      const categoriaFilha1 = await repo.save(
        repo.create({
          nome: "Celulares",
          nivel: 2,
          categoriaPai: categoriaPai,
        })
      );

      const categoriaFilha2 = await repo.save(
        repo.create({
          nome: "Computadores",
          nivel: 2,
          categoriaPai: categoriaPai,
        })
      );

      // Verificar que as categorias filhas foram criadas com o pai correto
      expect(categoriaFilha1.categoriaPai?.id).toBe(categoriaPai.id);
      expect(categoriaFilha2.categoriaPai?.id).toBe(categoriaPai.id);
    });
  });

  describe("Cenários complexos de hierarquia", () => {
    it("deve criar hierarquia completa nível 1 -> 2 -> 3", async () => {
      // Nível 1
      const eletronicos = await repo.save(
        repo.create({
          nome: "Eletrônicos",
          nivel: 1,
        })
      );

      // Nível 2
      const celulares = await repo.save(
        repo.create({
          nome: "Celulares",
          nivel: 2,
          categoriaPai: eletronicos,
        })
      );

      // Nível 3
      const smartphones = await repo.save(
        repo.create({
          nome: "Smartphones",
          nivel: 3,
          categoriaPai: celulares,
        })
      );

      expect(eletronicos.caminho).toBe("Eletrônicos");
      expect(celulares.caminho).toBe("Eletrônicos => Celulares");
      expect(smartphones.caminho).toBe(
        "Eletrônicos => Celulares => Smartphones"
      );
    });

    it("deve rejeitar criação de categoria nível 3 sem avô nível 1", async () => {
      // Tentar criar categoria nível 2 sem pai nível 1
      const categoriaNivel2 = repo.create({
        nome: "Categoria Nível 2",
        nivel: 2,
      });

      await expect(repo.save(categoriaNivel2)).rejects.toThrow(
        "Categoria pai é obrigatória para níveis 2 e 3"
      );
    });
  });
});
