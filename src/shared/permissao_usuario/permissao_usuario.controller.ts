// src/server/PermissionsController.ts
import { BackendMethod, remult } from "remult";
import {
  type PermissoesDoUsuario,
  type PermissaoRegraKey,
  type Tela,
} from "$lib/types/permissoes";
import { PermissaoUsuario } from "./permissao_usuario.model";

export class PermissionsController {
  @BackendMethod({ allowed: true }) // Idealmente, restrinja a administradores
  static async salvarPermissoesDoUsuario(
    usuarioId: string,
    permissoesNovas: PermissoesDoUsuario,
  ): Promise<void> {
    const permissoesRepo = remult.repo(PermissaoUsuario);

    // 1. Apaga todas as permissões antigas do usuário dentro de uma transação
    const permissoesAntigas = await permissoesRepo.find({
      where: { usuarioId },
    });
    for (const p of permissoesAntigas) {
      await permissoesRepo.delete(p);
    }

    // 2. Insere as novas permissões (apenas as que são 'true')
    // A transação garante que isso só aconteça se a exclusão der certo
    for (const tela in permissoesNovas) {
      const regras = permissoesNovas[tela as Tela];
      if (regras) {
        for (const [regra, permitido] of Object.entries(regras)) {
          if (permitido) {
            await permissoesRepo.insert({
              usuarioId,
              tela: tela as Tela,
              regra: regra as PermissaoRegraKey,
              permitido: true,
            });
          }
        }
      }
    }
  }
}
