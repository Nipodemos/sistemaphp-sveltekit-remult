import { Entity, Fields, Relations, Allow } from "remult";
import { remult } from "remult";

@Entity<Categoria>("categorias", {
  allowApiCrud: Allow.authenticated,
  saving: async (categoria, e) => {
    const repo = remult.repo(Categoria);

    // Validações básicas de nível
    if (categoria.nivel < 1 || categoria.nivel > 3) {
      throw new Error("Nível deve ser 1, 2 ou 3");
    }
    
    const categoriaPai = await e.relations.categoriaPai.findOne({
      include: { categoriaPai: true },
    });
    if (categoria.nivel > 1) {
      if (!categoriaPai) {
        throw new Error("Categoria pai é obrigatória para níveis 2 e 3");
      }
    } else if (categoriaPai) {
      throw new Error("Categoria de nível 1 não pode ter categoria pai");
    }


    if (!e.isNew) {
      const categoriaOriginal = await repo.findId(categoria.id);
      // BLOQUEAR alteração de nível (não é novo registro)
      if (categoriaOriginal && categoriaOriginal.nivel !== categoria.nivel) {
        throw new Error(
          `Não é permitido alterar o nível da categoria. Nível atual: ${categoriaOriginal.nivel}, Novo nível: ${categoria.nivel}`
        );
      }
    }

    // Calcular caminho e caminhoIds
    if (categoria.nivel === 3) {
      const categoriaNivel2 = categoriaPai;
      if (!categoriaNivel2) {
        throw new Error("Categoria pai de nível 2 não encontrada");
      }
      if (categoriaNivel2.nivel !== 2) {
        throw new Error(
          `Categoria pai de nível 3 deve ser de nível 2. Nível do pai: ${categoriaNivel2.nivel}`
        );
      }
      if (!categoriaNivel2.categoriaPai) {
        throw new Error("Categoria pai de nível 2 não tem pai definido");
      }

      const categoriaNivel1 = await repo.findId(categoriaNivel2.categoriaPai.id);
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
      const categoriaNivel1 = categoriaPai;
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
  },
  deleting: async (categoria) => {
    const repo = remult.repo(Categoria);
    const filhos = await repo.count({ categoriaPai: { $id: categoria.id } });
    if (filhos > 0) {
      throw new Error(
        "Não é possível excluir categoria que possui subcategorias"
      );
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
