// src/server/PermissionsController.ts
import { BackendMethod, remult } from "remult";
import {
  permissoes,
  type PermissoesUsuarioInput,
  type TelaPermissao,
} from "$lib/types/permissoes";
import { PermissaoUsuario } from "./PermissaoUsuario.model";

export class PermissionsController {
  @BackendMethod({ allowed: true }) // Permite que usuários autenticados chamem
  static async getPermissoesDoUsuario(
    usuarioId: string
  ): Promise<PermissoesUsuarioInput> {
    const permissoesRepo = remult.repo(PermissaoUsuario);
    const permissoesAtuais = await permissoesRepo.find({
      where: { usuarioId },
    });

    // Transforma a lista de registros do DB na estrutura de objeto que o front-end gosta
    const resultado: PermissoesUsuarioInput = {};

    for (const p of permissoesAtuais) {
      if (!resultado[p.tela]) {
        resultado[p.tela] = [];
      }
      (resultado[p.tela] as string[]).push(p.regra);
    }

    return resultado;
  }

  @BackendMethod({ allowed: true }) // Idealmente, restrinja a administradores
  static async salvarPermissoesDoUsuario(
    usuarioId: string,
    permissoesNovas: PermissoesUsuarioInput
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
      const regras = permissoesNovas[tela as TelaPermissao];
      if (regras) {
        for (const regra of regras) {
          await permissoesRepo.insert({
            usuarioId,
            tela: tela as TelaPermissao,
            regra: regra,
          });
        }
      }
    }
  }
}
