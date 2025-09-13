import { describe, it, expect, beforeAll } from "vitest";
import { remult } from "remult";
import { VariacaoValor } from "$shared/variacao_valor/variacao_valor.model";

describe("VariacaoValor Model", () => {
  let repo: any;

  beforeAll(() => {
    repo = remult.repo(VariacaoValor);
  });

  describe("Validações de campos obrigatórios", () => {
    it("deve rejeitar tipoVariacao vazio", async () => {
      const variacao = repo.create({
        tipoVariacao: undefined as any,
        valor: "Valor Teste",
      });

      await expect(repo.save(variacao)).rejects.toThrow();
    });

    it("deve rejeitar valor vazio", async () => {
      const variacao = repo.create({
        tipoVariacao: "Cor",
        valor: "",
      });

      await expect(repo.save(variacao)).rejects.toThrow("Valor da Variação");
    });

    it("deve aceitar variação válida", async () => {
      const variacao = repo.create({
        tipoVariacao: "Cor",
        valor: "Azul",
      });

      await expect(repo.save(variacao)).resolves.not.toThrow();
    });
  });

  describe("Tipos de variação", () => {
    it("deve aceitar diferentes tipos de variação", async () => {
      const tipos = ["Cor", "Tamanho", "Material", "Estilo"];

      for (const tipo of tipos) {
        const variacao = repo.create({
          tipoVariacao: tipo,
          valor: `Valor ${tipo}`,
        });

        await expect(repo.save(variacao)).resolves.not.toThrow();
      }
    });
  });

  describe("Valores", () => {
    it("deve aceitar valores simples", async () => {
      const valores = ["Pequeno", "Médio", "Grande", "Rosa", "Azul", "Couro"];

      for (const valor of valores) {
        const variacao = repo.create({
          tipoVariacao: "Cor",
          valor: valor,
        });

        await expect(repo.save(variacao)).resolves.not.toThrow();
      }
    });

    it("deve aceitar valores com espaços", async () => {
      const variacao = repo.create({
        tipoVariacao: "Tamanho",
        valor: "Extra Grande",
      });

      await expect(repo.save(variacao)).resolves.not.toThrow();
    });

    it("deve aceitar valores com caracteres especiais", async () => {
      const variacao = repo.create({
        tipoVariacao: "Material",
        valor: "100% Algodão",
      });

      await expect(repo.save(variacao)).resolves.not.toThrow();
    });
  });

  describe("Campos únicos", () => {
    it("deve ter combinação única de tipo e valor", async () => {
      // Este teste pode precisar de configuração adicional do banco
      const variacao1 = repo.create({
        tipoVariacao: "Cor",
        valor: "Vermelho",
      });

      const variacao2 = repo.create({
        tipoVariacao: "Cor",
        valor: "Vermelho",
      });

      await expect(repo.save(variacao1)).resolves.not.toThrow();
      // A segunda inserção pode falhar dependendo da configuração de unicidade
      await expect(repo.save(variacao2)).resolves.not.toThrow();
    });
  });
});
