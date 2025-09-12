import { Entity, Fields, Validators } from "remult";
import { tipoVariacao } from "$lib/types/variacao.types";
import type { TypeTipoVariacao } from "$lib/types/variacao.types";

@Entity("variacoes_valor")
export class VariacaoValor {
  @Fields.id()
  id = "";

  @Fields.literal(() => tipoVariacao)
  tipoVariacao!: TypeTipoVariacao; // Tipo fixo da variação

  @Fields.string({
    validate: Validators.required,
    caption: "Valor da Variação",
  })
  valor = ""; // Ex.: "Rosa", "Médio", "Couro"

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;
}
