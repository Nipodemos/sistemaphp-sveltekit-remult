import { BackendMethod, remult } from "remult";
import { Categoria } from "./categoria.model";

export class CategoriaController {
  @BackendMethod({ allowed: true })
  static async criarCategoria(
    nome: string,
    descricao: string,
    categoriaPaiId?: string
  ): Promise<Categoria> {
    const repo = remult.repo(Categoria);

    let categoria = repo.create();
    categoria.nome = nome;
    categoria.descricao = descricao;

    if (categoriaPaiId) {
      const pai = await repo.findId(categoriaPaiId);
      if (!pai) throw new Error("Categoria pai não encontrada");
      if (pai.nivel >= 3) throw new Error("Máximo 3 níveis permitidos");

      categoria.categoriaPai = pai;
      categoria.nivel = pai.nivel + 1;
    } else {
      categoria.nivel = 1;
    }

    categoria = await repo.save(categoria);
    await this.atualizarCaminho(categoria.id);

    return categoria;
  }

  @BackendMethod({ allowed: true })
  static async editarCategoria(
    categoriaId: string,
    nome: string,
    descricao: string,
    novoCategoriaPaiId?: string
  ): Promise<Categoria> {
    const repo = remult.repo(Categoria);
    const categoria = await repo.findId(categoriaId);
    if (!categoria) throw new Error("Categoria não encontrada");

    categoria.nome = nome;
    categoria.descricao = descricao;

    // Se mudou o pai, atualizar hierarquia
    const paiAtualId = categoria.categoriaPai?.id;
    if (paiAtualId !== novoCategoriaPaiId) {
      if (novoCategoriaPaiId) {
        const novoPai = await repo.findId(novoCategoriaPaiId);
        if (!novoPai) throw new Error("Nova categoria pai não encontrada");
        if (novoPai.nivel >= 3) throw new Error("Máximo 3 níveis permitidos");

        categoria.categoriaPai = novoPai;
        categoria.nivel = novoPai.nivel + 1;
      } else {
        categoria.categoriaPai = undefined;
        categoria.nivel = 1;
      }

      // Atualizar caminhos desta categoria e todas as subcategorias
      await repo.save(categoria);
      await this.atualizarCaminhoRecursivo(categoria.id);
    } else {
      // Só atualizar o caminho se mudou o nome
      await repo.save(categoria);
      await this.atualizarCaminho(categoria.id);
    }

    return categoria;
  }

  @BackendMethod({ allowed: true })
  static async excluirCategoria(categoriaId: string): Promise<void> {
    const repo = remult.repo(Categoria);
    const categoria = await repo.findId(categoriaId);
    if (!categoria) throw new Error("Categoria não encontrada");

    // Verificar se tem subcategorias - buscar todas e filtrar
    const todasCategorias = await repo.find();
    const subcategorias = todasCategorias.filter(
      (cat) => cat.categoriaPai?.id === categoriaId
    );

    if (subcategorias.length > 0) {
      throw new Error(
        "Não é possível excluir categoria que possui subcategorias"
      );
    }

    // TODO: Verificar se tem produtos associados antes de excluir

    await repo.delete(categoria);
  }

  @BackendMethod({ allowed: true })
  static async atualizarCaminho(categoriaId: string): Promise<void> {
    const repo = remult.repo(Categoria);
    const categoria = await repo.findId(categoriaId);
    if (!categoria) return;

    const caminhos: string[] = [];
    const ids: string[] = [];

    // Construir caminho completo
    let atual: Categoria | undefined = categoria;
    while (atual) {
      caminhos.unshift(atual.nome);
      ids.unshift(atual.id);

      // Buscar o pai se existir
      if (atual.categoriaPai?.id) {
        const pai = await repo.findId(atual.categoriaPai.id);
        atual = pai || undefined;
      } else {
        atual = undefined;
      }
    }

    categoria.caminho = caminhos.join(" / ");
    categoria.caminhoIds = ids.join(",");

    await repo.save(categoria);
  }

  @BackendMethod({ allowed: true })
  static async atualizarCaminhoRecursivo(categoriaId: string): Promise<void> {
    const repo = remult.repo(Categoria);

    // Atualizar a categoria atual
    await this.atualizarCaminho(categoriaId);

    // Encontrar e atualizar todas as subcategorias - buscar todas e filtrar
    const todasCategorias = await repo.find();
    const subcategorias = todasCategorias.filter(
      (cat) => cat.categoriaPai?.id === categoriaId
    );

    for (const sub of subcategorias) {
      await this.atualizarCaminhoRecursivo(sub.id);
    }
  }

  @BackendMethod({ allowed: true })
  static async obterHierarquiaCompleta(): Promise<Categoria[]> {
    const repo = remult.repo(Categoria);
    return await repo.find({
      where: { ativo: true },
      orderBy: { caminho: "asc" },
    });
  }

  @BackendMethod({ allowed: true })
  static async obterCategoriasPorNivel(nivel: number): Promise<Categoria[]> {
    const repo = remult.repo(Categoria);
    return await repo.find({
      where: { nivel, ativo: true },
      orderBy: { nome: "asc" },
    });
  }

  @BackendMethod({ allowed: true })
  static async obterCategoriasRaiz(): Promise<Categoria[]> {
    const repo = remult.repo(Categoria);
    // Buscar todas e filtrar as que não têm pai
    const todasCategorias = await repo.find({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });

    return todasCategorias.filter((cat) => !cat.categoriaPai);
  }
}
