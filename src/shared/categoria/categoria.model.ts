import { Entity, Fields, Relations, Allow } from "remult";
import { remult } from "remult";

@Entity<Categoria>("categorias", {
  allowApiCrud: Allow.authenticated,
  saving: async (categoria, e) => {
    // Para registros existentes, buscar o valor original para validações
    let categoriaOriginal: Categoria | null = null;
    const repo = remult.repo(Categoria);

    // Para registros existentes, buscar o valor original primeiro

    // Validações básicas de nível
    if (categoria.nivel < 1 || categoria.nivel > 3) {
      throw new Error("Nível deve ser 1, 2 ou 3");
    }
    // console.log(
    // "categoria alan: ",
    // util.inspect(
    // { ...categoria, categoriaPai: categoria.categoriaPai },
    // { depth: null, colors: true }
    // )
    // );
    // console.log("categoria :>> ", categoria);
    // console.log("categoria.categoriaPai :>> ", categoria.categoriaPai);
    if (categoria.nivel > 1 && !categoria.categoriaPai) {
      throw new Error("Categoria pai é obrigatória para níveis 2 e 3");
    }
    if (categoria.nivel === 1 && categoria.categoriaPai) {
      throw new Error("Categoria pai deve ser nula para nível 1");
    }

    if (!e.isNew) {
      categoriaOriginal = (await repo.findId(categoria.id)) || null;
      // BLOQUEAR alteração de nível (não é novo registro) - deve ser validado primeiro
      if (categoriaOriginal && categoriaOriginal.nivel !== categoria.nivel) {
        throw new Error(
          `Não é permitido alterar o nível da categoria. Nível atual: ${categoriaOriginal.nivel}, Novo nível: ${categoria.nivel}`
        );
      }
    }
    if (categoria.nivel === 3) {
      let categoriaNivel2 = await repo.findId(categoria.categoriaPai!.id, {
        include: { categoriaPai: true },
      });
      if (!categoriaNivel2) {
        throw new Error("Categoria pai de nível 2 não encontrada");
      }
      if (categoriaNivel2.nivel !== 2) {
        console.log(categoriaNivel2.nome);
        throw new Error(
          `Categoria pai de nível 3 deve ser de nível 2. Nível do pai: ${categoriaNivel2.nivel}`
        );
      }

      if (!categoriaNivel2.categoriaPai) {
        throw new Error("Categoria pai de nível 2 não tem pai definido");
      }

      let categoriaNivel1 = await repo.findId(categoriaNivel2.categoriaPai.id, {
        include: { categoriaPai: true },
      });
      if (!categoriaNivel1) {
        throw new Error("Categoria pai de nível 1 não encontrada");
      }
      if (categoriaNivel1.nivel !== 1) {
        throw new Error(
          `Categoria pai de nível 2 deve ser de nível 1. Nível do pai: ${categoriaNivel1.nivel}`
        );
      }

      if (!e.isNew) {
        categoria.caminho = `${categoriaNivel1.nome} => ${categoriaNivel2.nome} => ${categoria.nome}`;
        categoria.caminhoIds = `${categoriaNivel1.id},${categoriaNivel2.id},${categoria.id}`;
      }
    } else if (categoria.nivel === 2) {
      let categoriaNivel1 = await repo.findId(categoria.categoriaPai!.id);
      if (!categoriaNivel1) {
        throw new Error("Categoria pai de nível 1 não encontrada");
      }
      if (categoriaNivel1.nivel !== 1) {
        throw new Error(
          `Categoria pai de nível 2 deve ser de nível 1. Nível do pai: ${categoriaNivel1.nivel}`
        );
      }
      if (!e.isNew) {
        categoria.caminho = `${categoriaNivel1.nome} => ${categoria.nome}`;
        categoria.caminhoIds = `${categoriaNivel1.id},${categoria.id}`;
      }
    } else if (categoria.nivel === 1 && !e.isNew) {
      categoria.caminho = categoria.nome;
      categoria.caminhoIds = categoria.id;
    }
  },
  saved: async (categoria, e) => {
    // Apenas para novas entidades - atualizar caminho inicial
    if (e.isNew) {
      const repo = remult.repo(Categoria);
      if (categoria.nivel === 3) {
        let categoriaNivel2 = await repo.findId(categoria.categoriaPai!.id, {
          include: { categoriaPai: true },
        });
        if (!categoriaNivel2) {
          throw new Error("Categoria pai de nível 2 não encontrada");
        }
        if (categoriaNivel2.nivel !== 2) {
          console.log(categoriaNivel2.nome);
          throw new Error(
            `Categoria pai de nível 3 deve ser de nível 2. Nível do pai: ${categoriaNivel2.nivel}`
          );
        }

        if (!categoriaNivel2.categoriaPai) {
          throw new Error("Categoria pai de nível 2 não tem pai definido");
        }

        let categoriaNivel1 = await repo.findId(
          categoriaNivel2.categoriaPai.id
        );
        if (!categoriaNivel1) {
          throw new Error("Categoria pai de nível 1 não encontrada");
        }
        if (categoriaNivel1.nivel !== 1) {
          throw new Error(
            `Categoria pai de nível 2 deve ser de nível 1. Nível do pai: ${categoriaNivel1.nivel}`
          );
        }

        categoria.caminho = `${categoriaNivel1.nome} => ${categoriaNivel2.nome} => ${categoria.nome}`;
        categoria.caminhoIds = `${categoriaNivel1.id},${categoriaNivel2.id},${categoria.id}`;
      } else if (categoria.nivel === 2) {
        let categoriaNivel1 = await repo.findId(categoria.categoriaPai!.id);
        if (!categoriaNivel1) {
          throw new Error("Categoria pai de nível 1 não encontrada");
        }
        if (categoriaNivel1.nivel !== 1) {
          throw new Error(
            `Categoria pai de nível 2 deve ser de nível 1. Nível do pai: ${categoriaNivel1.nivel}`
          );
        }
        categoria.caminho = `${categoriaNivel1.nome} => ${categoria.nome}`;
        categoria.caminhoIds = `${categoriaNivel1.id},${categoria.id}`;
      } else if (categoria.nivel === 1) {
        categoria.caminho = categoria.nome;
        categoria.caminhoIds = categoria.id;
      }
    }
  },
})
export class Categoria {
  @Fields.id()
  id = "";

  @Fields.string({ required: true, minLength: 2 })
  nome: string = "";

  // Referência para a categoria pai (null = categoria raiz)
  @Relations.toOne(() => Categoria, {
    allowNull: true,
  })
  categoriaPai?: Categoria;

  // Nível na hierarquia (1, 2 ou 3)
  @Fields.integer({
    validate: (nivel: number) => {
      if (nivel < 1 || nivel > 3) {
        return "Nível deve ser 1, 2 ou 3";
      }
    },
    required: true,
  })
  nivel: number = 1;

  // Path completo da hierarquia (ex: "Casa => Móveis => Cama")
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
  atualizadoEm?: Date;

  // Subcategorias filhas
  @Relations.toMany(() => Categoria, "categoriaPai")
  subcategorias: Categoria[] = [];
}
