<script lang="ts">
  import { remult } from "remult";
  import { Categoria } from "$shared/categoria/categoria.model";
  import { CategoriaController } from "$shared/categoria/categoria.controller";

  // Estado reativo para armazenar as categorias
  let categorias = $state<Categoria[]>([]);
  let carregando = $state(true);
  let erro = $state<string | null>(null);
  const repoCategoria = remult.repo(Categoria);

  $effect(() => {
    carregando = true;
    repoCategoria
      .find()
      .then((result) => {
        carregando = false;
        categorias = result;
      })
      .catch((err) => {
        erro =
          "Erro ao carregar categorias: " +
          (err instanceof Error ? err.message : String(err));
        carregando = false;
      });
  });

  // Função para excluir uma categoria
  async function excluirCategoria(categoria: Categoria) {
    if (
      !confirm(
        `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`
      )
    ) {
      return;
    }

    try {
      await CategoriaController.excluirCategoria(categoria.id);
      categorias = categorias.filter((cat) => cat.id !== categoria.id);
    } catch (err) {
      alert(
        "Erro ao excluir categoria: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  }

  // Função para criar estrutura hierárquica para exibição
  function getCategoriesHierarchy() {
    const nivel1Cats = categorias.filter((c) => c.nivel === 1);
    const resultado: Array<{
      nivel1: Categoria;
      nivel2?: Categoria;
      nivel3?: Categoria;
    }> = [];

    nivel1Cats.forEach((cat1) => {
      const nivel2Cats = categorias.filter(
        (c) => c.nivel === 2 && c.categoriaPai?.id === cat1.id
      );

      if (nivel2Cats.length === 0) {
        // Categoria nível 1 sem filhos
        resultado.push({ nivel1: cat1 });
      } else {
        nivel2Cats.forEach((cat2) => {
          const nivel3Cats = categorias.filter(
            (c) => c.nivel === 3 && c.categoriaPai?.id === cat2.id
          );

          if (nivel3Cats.length === 0) {
            // Categoria nível 2 sem filhos
            resultado.push({ nivel1: cat1, nivel2: cat2 });
          } else {
            nivel3Cats.forEach((cat3) => {
              resultado.push({ nivel1: cat1, nivel2: cat2, nivel3: cat3 });
            });
          }
        });
      }
    });

    return resultado;
  }
</script>

<div>
  <h1>Listagem de Categorias</h1>

  <div>
    <a href="/app/categorias/assistente">
      <button>Nova Categoria</button>
    </a>
  </div>

  {#if erro}
    <div>
      {erro}
    </div>
  {/if}

  {#if carregando}
    <p>Carregando categorias...</p>
  {:else}
    <div>
      <h2>Categorias</h2>
      <table>
        <thead>
          <tr>
            <th>Caminho Completo</th>
            <th>Nível</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {#each categorias as categoria}
            <tr>
              <td><strong>{categoria.caminho}</strong></td>
              <td>Nível {categoria.nivel}</td>
              <td>
                <a href="/app/categorias/assistente?id={categoria.id}">
                  Editar
                </a>
                <button onclick={() => excluirCategoria(categoria)}>
                  Excluir
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      {#if categorias.length === 0}
        <p>Nenhuma categoria encontrada.</p>
        <a href="/app/categorias/assistente">Criar primeira categoria</a>
      {/if}
    </div>
  {/if}
</div>
