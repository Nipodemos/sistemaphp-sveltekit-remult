// src/shared/PermissaoUsuario.ts
import { Allow, Entity, Fields, Relations } from "remult";
import { type TelaPermissao, permissoes } from "$lib/types/permissoes";
import { Usuario } from "$shared/usuario/usuario.model";

@Entity("permissoesUsuario", {
  allowApiCrud: Allow.authenticated, // Bloqueia completamente o acesso via API

  id: {
    usuarioId: true,
    tela: true,
    regra: true,
  },
})
export class PermissaoUsuario {
  @Relations.toOne(() => Usuario, { field: "usuario_id" })
  usuario?: Usuario;

  @Fields.string({
    dbName: "usuario_id",
  })
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

  @Fields.string<PermissaoUsuario>({
    validate: (e, field) => {
      // Validar se a regra existe para a tela específica
      const tela = e.tela as TelaPermissao;
      const regrasValidas = Object.keys(permissoes[tela] || {});
      if (!regrasValidas.includes(field.value)) {
        throw `Regra '${field.value}' é inválida para a tela '${tela}'.`;
      }
    },
  })
  regra = ""; // Aqui guardamos 'visualizar', 'criar', etc.
}
