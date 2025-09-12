import { Entity, Fields, Relations, Validators, repo } from "remult";
import { Produto } from "../produto/produto.model";
import { VariacaoValor } from "../variacao_valor/variacao_valor.model";

@Entity("produto_grades", {
  saving: async (grade: ProdutoGrade, e) => {
    // Impedir mudanças nas variações após criação
    if (!e.isNew) {
      const original = await repo(ProdutoGrade).findId(grade.id);
      if (!original) {
        throw new Error("Grade original não encontrada");
      }
      if (grade.variacaoValor1Id !== original.variacaoValor1Id) {
        throw new Error(
          "Não é possível alterar a variação 1 após a criação da grade"
        );
      }
      if (grade.variacaoValor2Id !== original.variacaoValor2Id) {
        throw new Error(
          "Não é possível alterar a variação 2 após a criação da grade"
        );
      }
      if (grade.variacaoValor3Id !== original.variacaoValor3Id) {
        throw new Error(
          "Não é possível alterar a variação 3 após a criação da grade"
        );
      }
    }

    // Verificação: Pelo menos a variação 1 deve estar preenchida
    if (!grade.variacaoValor1Id || grade.variacaoValor1Id.trim() === "") {
      throw new Error("A variação 1 deve estar preenchida");
    }

    // Carregar o produto para validação
    const produto = await repo(Produto).findId(grade.produtoId);
    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    // Validação da variação 1
    if (grade.variacaoValor1Id) {
      const valor1 = await repo(VariacaoValor).findId(grade.variacaoValor1Id);
      if (!valor1) {
        throw new Error("Variação 1 não encontrada");
      }
      if (valor1.tipoVariacao !== produto.variacao1) {
        throw new Error(
          `A variação 1 deve ser do tipo '${produto.variacao1}', mas é '${valor1.tipoVariacao}'`
        );
      }
    }

    // Validação da variação 2 (se preenchida e produto tiver variação 2)
    if (grade.variacaoValor2Id && produto.variacao2) {
      const valor2 = await repo(VariacaoValor).findId(grade.variacaoValor2Id);
      if (!valor2) {
        throw new Error("Variação 2 não encontrada");
      }
      if (valor2.tipoVariacao !== produto.variacao2) {
        throw new Error(
          `A variação 2 deve ser do tipo '${produto.variacao2}', mas é '${valor2.tipoVariacao}'`
        );
      }
    }

    // Validação da variação 3 (se preenchida e produto tiver variação 3)
    if (grade.variacaoValor3Id && produto.variacao3) {
      const valor3 = await repo(VariacaoValor).findId(grade.variacaoValor3Id);
      if (!valor3) {
        throw new Error("Variação 3 não encontrada");
      }
      if (valor3.tipoVariacao !== produto.variacao3) {
        throw new Error(
          `A variação 3 deve ser do tipo '${produto.variacao3}', mas é '${valor3.tipoVariacao}'`
        );
      }
    }
  },
})
export class ProdutoGrade {
  @Fields.id()
  id = "";

  @Fields.string({
    validate: Validators.required,
    caption: "ID do Produto",
  })
  produtoId = "";

  @Fields.string({
    validate: Validators.required,
    caption: "ID da Variação 1",
    allowApiUpdate: false,
  })
  variacaoValor1Id = "";

  @Fields.string({
    caption: "ID da Variação 2 (opcional)",
    allowApiUpdate: false,
  })
  variacaoValor2Id = "";

  @Fields.string({
    caption: "ID da Variação 3 (opcional)",
    allowApiUpdate: false,
  })
  variacaoValor3Id = "";

  @Fields.boolean({
    defaultValue: () => true,
    caption: "Ativo",
  })
  ativo = true;

  @Relations.toOne(() => Produto, { field: "produtoId" })
  produto!: Produto;

  @Relations.toOne(() => VariacaoValor, { field: "variacaoValor1Id" })
  variacaoValor1!: VariacaoValor;

  @Relations.toOne(() => VariacaoValor, { field: "variacaoValor2Id" })
  variacaoValor2?: VariacaoValor;

  @Relations.toOne(() => VariacaoValor, { field: "variacaoValor3Id" })
  variacaoValor3?: VariacaoValor;

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
