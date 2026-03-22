<script lang="ts">
  import { repo } from "remult";
  import { Tela } from "../../../shared/tela/tela.model";
  import { Pencil } from "@lucide/svelte";

  let telas = $state<Tela[]>([]);

  $effect(() => {
    repo(Tela)
      .find()
      .then((t) => (telas = t));
  });
</script>

<div class="card p-4 preset-filled-surface-100-900">
  <header class="flex justify-between items-center mb-4">
    <h1 class="h1">Lista de telas</h1>
  </header>
  <div>
    <div class="table-wrap">
      <table class="table caption-bottom">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody class="[&>tr]:hover:preset-tonal-primary">
          {#each telas as tela}
            <tr>
              <td class="font-medium">{tela.nome}</td>
              <td>{tela.categoria}</td>
              <td>
                <div class="flex gap-2">
                  <a
                    class="btn preset-filled-primary size-sm"
                    href={`/app/telas/criar_editar?id=${tela.id}`}
                  >
                    <Pencil class="size-4" />
                    Editar
                  </a>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
