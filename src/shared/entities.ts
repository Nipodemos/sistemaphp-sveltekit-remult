// src/shared/entities.ts
// ======================================
// ARQUIVO CENTRALIZADO DE ENTIDADES
// ======================================
//
// 🎯 COMO USAR:
// 1. Crie sua nova entidade (@Entity)
// 2. Adicione ela no array 'entities' abaixo
// 3. Pronto! Ela será automaticamente incluída em:
//    - Transport hooks (serialização automática)
//    - API do Remult (CRUD endpoints)
//
// ✅ BENEFÍCIOS:
// - Configuração única (DRY - Don't Repeat Yourself)
// - Menos chance de esquecer de registrar entidades
// - Manutenção simplificada

import { Usuario } from "./usuario/usuario.model";
import { PermissaoUsuario } from "./permissaoUsuario/permissaoUsuario.model";
import { Tela } from "./tela/tela.model";
import type { ClassType } from "remult";

// 📝 Array centralizado de todas as entidades do sistema
// Adicione novas entidades aqui e elas serão automaticamente registradas
export const entities: ClassType<any>[] = [
  Usuario,
  PermissaoUsuario,
  Tela,
  // 👆 Adicione suas novas entidades aqui
];

// Função helper para obter a lista de entidades (opcional, para melhor tipagem)
export function getEntities() {
  return entities;
}
