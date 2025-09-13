import { Empresa } from "$shared/empresa/empresa.model";
import { Produto } from "$shared/produto/produto.model";
import { VariacaoValor } from "$shared/variacao_valor/variacao_valor.model";
import { Entity, Fields, Relations } from "remult";

@Entity<Estoque>("estoques", {})
export class Estoque {
  @Fields.id()
  id = "";

  @Fields.number({
    dbName: "saldo_real",
  })
  saldoReal = 0;

  @Fields.number({
    dbName: "saldo_disponivel",
  })
  saldoDisponivel = 0;

  @Fields.createdAt({
    dbName: "criado_em",
  })
  criadoEm?: Date;

  @Fields.updatedAt({
    dbName: "alterado_em",
  })
  alteradoEm?: Date;

  @Relations.toOne(() => Empresa)
  empresa!: Empresa;

  @Relations.toOne(() => Produto)
  produto!: Produto;

  @Relations.toOne(() => VariacaoValor)
  variacaoValor!: VariacaoValor;
}
