// src/shared/PermissaoUsuario.ts
import { Allow, Entity, Fields, Relations } from "remult";
import { type TelaPermissao, permissoes } from "$lib/types/permissoes";
import { Usuario } from "../routes/app/usuarios/usuario.model";

@Entity("permissoesUsuario", {
  allowApiCrud: Allow.authenticated, // Bloqueia completamente o acesso via API

  id: {
    usuarioId: true,
    tela: true,
    regra: true,
  },
})
export class PermissaoUsuario {
  @Relations.toOne(() => Usuario, { field: "usuarioId" })
  usuario?: Usuario;

  @Fields.string()
  usuarioId = "";

  // Usamos um validador para garantir que a tela existe na nossa Fonte da Verdade
  @Fields.string<PermissaoUsuario>({
    validate: (e, field) => {
      // Validação usando nosso objeto 'permissions'
      const telasValidas = Object.keys(permissoes);
      if (!telasValidas.includes(field.value)) {
        throw `Tela '${field.value}' é inválida.`;
      }
    },
  })
  tela: TelaPermissao = "vendas"; // Valor default apenas para satisfazer o tipo

  @Fields.string()
  regra = ""; // Aqui guardamos 'visualizar', 'criar', etc.
}
