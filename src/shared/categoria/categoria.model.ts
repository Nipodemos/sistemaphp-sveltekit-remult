import { validarUUIDv4, atualizarCaminho } from "$lib/utils/utils";
import { Entity, Fields, Relations, Allow, Validators } from "remult";
import { remult } from "remult";

@Entity<Categoria>("categorias", {
  allowApiCrud: Allow.authenticated,
  saving: async (categoria, e) => {
    // Para registros existentes, buscar o valor original para validações
    let categoriaOriginal: Categoria | null = null;
    const repo = remult.repo(Categoria);
    if (!e.isNew) {
      categoriaOriginal = (await repo.findId(categoria.id)) || null;
      // BLOQUEAR alteração de nível (não é novo registro) - deve ser validado primeiro
      if (categoriaOriginal && categoriaOriginal.nivel !== categoria.nivel) {
        throw new Error(
          `Não é permitido alterar o nível da categoria. Nível atual: ${categoriaOriginal.nivel}, Novo nível: ${categoria.nivel}`
        );
      }
      let ids = categoria.caminhoIds.split(",").map((id) => id.trim());
      if (ids.length !== categoria.nivel) {
        throw new Error(
          `Número de IDs no caminho (${ids.length}) não corresponde ao nível (${categoria.nivel})`
        );
      }
      if (categoria.nivel > 1 && ids[ids.length - 1] !== categoria.id) {
        throw new Error(
          "O último ID no caminho deve ser o ID da própria categoria"
        );
      }

      if (categoria.nivel === 1 && ids.length !== 1) {
        throw new Error("Nível 1 deve ter exatamente um ID no caminho");
      }
      if (categoria.nivel === 2 && ids.length !== 2) {
        throw new Error("Nível 2 deve ter exatamente dois IDs no caminho");
      }
      if (categoria.nivel === 3 && ids.length !== 3) {
        throw new Error("Nível 3 deve ter exatamente três IDs no caminho");
      }
      for (const element of ids) {
        if (!validarUUIDv4(element)) {
          throw new Error(`ID inválido no caminho: ${element}`);
        }
      }
    }

    // Validações básicas de nível
    if (categoria.nivel < 1 || categoria.nivel > 3) {
      throw new Error("Nível deve ser 1, 2 ou 3");
    }
    if (categoria.nivel > 1 && !categoria.categoriaPai) {
      throw new Error("Categoria pai é obrigatória para níveis 2 e 3");
    }
    if (categoria.nivel === 1 && categoria.categoriaPai) {
      throw new Error("Categoria pai deve ser nula para nível 1");
    }

    // PERMITIR alteração de categoria pai, mas com validações
    if (
      categoriaOriginal &&
      categoriaOriginal.categoriaPai?.id !== categoria.categoriaPai?.id
    ) {
      // Validar que o novo pai existe (se foi informado)
      if (categoria.categoriaPai) {
        const repo = remult.repo(Categoria);
        const novoPai = await repo.findId(categoria.categoriaPai.id);
        if (!novoPai) {
          throw new Error("Categoria pai não encontrada");
        }

        // Validar nível do novo pai
        if (novoPai.nivel >= categoria.nivel) {
          throw new Error(
            `Categoria pai deve ter nível inferior ao da categoria atual. Pai: nível ${novoPai.nivel}, Categoria: nível ${categoria.nivel}`
          );
        }

        // Evitar ciclos: verificar se a categoria atual não é ancestral do novo pai
        let ancestral = novoPai.categoriaPai;
        while (ancestral) {
          if (ancestral.id === categoria.id) {
            throw new Error(
              "Não é possível criar um ciclo na hierarquia de categorias"
            );
          }
          ancestral = ancestral.categoriaPai;
        }
      }
    }
  },
  saved: async (categoria, e) => {
    await atualizarCaminho(categoria.id);
  },
})
export class Categoria {
  @Fields.id()
  id = "";

  @Fields.string({ required: true, minLength: 2 })
  nome: string = "";

  // Referência para a categoria pai (null = categoria raiz)
  @Relations.toOne(() => Categoria, {
    field: "categoria_pai_id",
    allowNull: true,
  })
  categoriaPai?: Categoria;

  // Nível na hierarquia (1, 2 ou 3)
  @Fields.integer()
  nivel: number = 1;

  // Path completo da hierarquia (ex: "Casa/Móveis/Cama")
  @Fields.string()
  caminho: string = "";

  // Para facilitar consultas - IDs dos pais em ordem
  @Fields.string({
    dbName: "caminho_ids",
  })
  caminhoIds!: string; // ex: "cat1_id,cat2_id,cat3_id"

  @Fields.boolean()
  ativo: boolean = true;

  @Fields.createdAt()
  criadoEm?: Date;

  @Fields.updatedAt()
  alteradoEm?: Date;

  // Subcategorias filhas
  @Relations.toMany(() => Categoria, "categoriaPai")
  subcategorias: Categoria[] = [];
}
