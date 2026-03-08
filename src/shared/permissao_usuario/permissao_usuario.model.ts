// src/shared/PermissaoUsuario.ts
import { Allow, Entity, Fields, Relations } from "remult";
import {
  permissoesExistentes,
  type PermissaoRegraKey,
  type PermissaoTelaKey,
} from "$lib/types/permissoes";
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
  @Relations.toOne(() => Usuario, {
    dbName: "usuario_id",
  })
  usuario?: Usuario;

  @Fields.string({
    dbName: "usuario_id",
  })
  usuarioId = "";

  // Usamos um validador para garantir que a tela existe na nossa Fonte da Verdade
  @Fields.string({
    validate: (e, field) => {
      // Validação usando nosso objeto 'permissoesExistentes'
      const telasValidas = Object.keys(permissoesExistentes);
      if (!telasValidas.includes(field.value)) {
        throw `Tela '${field.value}' é inválida.`;
      }
    },
  })
  tela!: PermissaoTelaKey; // Valor default apenas para satisfazer o tipo

  @Fields.string({
    validate: (entity: PermissaoUsuario, field) => {
      // Validar se a regra existe para a tela específica
      const tela = entity.tela;
      const regrasValidas = Object.keys(permissoesExistentes[tela] || {});
      if (!regrasValidas.includes(field.value)) {
        throw `Regra '${field.value}' é inválida para a tela '${tela}'.`;
      }
    },
  })
  regra!: PermissaoRegraKey; // Aqui guardamos 'visualizar', 'criar', etc.

  @Fields.boolean()
  permitido = false; // Indica se o usuário tem permissão para esta regra nesta tela
}
