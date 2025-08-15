<script lang="ts">
  import { remult } from "remult";
  import { Categoria } from "$shared/categoria/categoria.model";
  import { CategoriaController } from "$shared/categoria/categoria.controller";
  import { onMount } from "svelte";

  // Estado reativo para armazenar as categorias
  let categorias = $state<Categoria[]>([]);
  let carregando = $state(true);
  let erro = $state<string | null>(null);

  // Repositório do Remult
  const repoCategoria = remult.repo(Categoria);

  // Função para buscar todas as categorias
  async function carregarCategorias() {
    try {
      carregando = true;
      erro = null;

      // Buscar hierarquia completa já ordenada
      categorias = await CategoriaController.obterHierarquiaCompleta();
    } catch (err) {
      erro =
        "Erro ao carregar categorias: " +
        (err instanceof Error ? err.message : String(err));
    } finally {
      carregando = false;
    }
  }

  // Carregar dados quando o componente for montado
  onMount(() => {
    carregarCategorias();
  });

  // Função para obter categorias por nível para exibição em colunas
  function getCategoriasOrganizadas() {
    const organizadas: {
      nivel1: Categoria[];
      nivel2: Categoria[];
      nivel3: Categoria[];
    } = {
      nivel1: [],
      nivel2: [],
      nivel3: [],
    };

    categorias.forEach((cat) => {
      if (cat.nivel === 1) organizadas.nivel1.push(cat);
      else if (cat.nivel === 2) organizadas.nivel2.push(cat);
      else if (cat.nivel === 3) organizadas.nivel3.push(cat);
    });

    return organizadas;
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
    <button onclick={carregarCategorias} disabled={carregando}>
      {carregando ? "Carregando..." : "Atualizar"}
    </button>

    <a href="/app/categorias/criar_editar">
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
      <h2>Hierarquia de Categorias</h2>
      <table>
        <thead>
          <tr>
            <th>Categoria Nível 1</th>
            <th>Categoria Nível 2</th>
            <th>Categoria Nível 3</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {#each getCategoriesHierarchy() as item}
            <tr>
              <td>
                <strong>{item.nivel1.nome}</strong>
                <br />
                <small>{item.nivel1.descricao}</small>
              </td>
              <td>
                {#if item.nivel2}
                  {item.nivel2.nome}
                  <br />
                  <small>{item.nivel2.descricao}</small>
                {:else}
                  <em>(Nenhuma subcategoria)</em>
                {/if}
              </td>
              <td>
                {#if item.nivel3}
                  {item.nivel3.nome}
                  <br />
                  <small>{item.nivel3.descricao}</small>
                {:else}
                  <em>(Nenhuma subcategoria)</em>
                {/if}
              </td>
              <td>
                {#if item.nivel3}
                  <a href="/app/categorias/criar_editar?id={item.nivel3.id}"
                    >Editar Nível 3</a
                  >
                {:else if item.nivel2}
                  <a href="/app/categorias/criar_editar?id={item.nivel2.id}"
                    >Editar Nível 2</a
                  >
                {:else}
                  <a href="/app/categorias/criar_editar?id={item.nivel1.id}"
                    >Editar Nível 1</a
                  >
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      {#if categorias.length === 0}
        <p>Nenhuma categoria encontrada.</p>
      {/if}
    </div>

    <div>
      <h2>Lista Completa (Ordenada por Caminho)</h2>
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
              <td>{categoria.descricao}</td>
              <td>
                <a href="/app/categorias/criar_editar?id={categoria.id}"
                  >Editar</a
                >
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div>
      <p><strong>Resumo:</strong></p>
      <ul>
        <li>Total de categorias: {categorias.length}</li>
        <li>
          Categorias Nível 1: {categorias.filter((c) => c.nivel === 1).length}
        </li>
        <li>
          Categorias Nível 2: {categorias.filter((c) => c.nivel === 2).length}
        </li>
        <li>
          Categorias Nível 3: {categorias.filter((c) => c.nivel === 3).length}
        </li>
      </ul>
    </div>
  {/if}
</div>
