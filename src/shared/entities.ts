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

import { Usuario } from "./usuario/usuario.model";
import { PermissaoUsuario } from "./permissao_usuario/permissao_usuario.model";
import { Tela } from "./tela/tela.model";
import type { ClassType } from "remult";
import { Categoria } from "./categoria/categoria.model";
import { Produto } from "./produto/produto.model";
import { Fornecedor } from "./fornecedor/fornecedor.model";
import { Empresa } from "./empresa/empresa.model";
import { Estoque } from "./estoque/estoque.model";
import { Teste } from "./teste/teste.model";
import { ProdutoGrade } from "./produto_grade/produto_grade.model";
import { VariacaoValor } from "./variacao_valor/variacao_valor.model";

// 📝 Array centralizado de todas as entidades do sistema
// Adicione novas entidades aqui e elas serão automaticamente registradas
export const entities: ClassType<any>[] = [
  Usuario,
  PermissaoUsuario,
  Tela,
  Categoria,
  Produto,
  Fornecedor,
  Empresa,
  Estoque,
  ProdutoGrade,
  VariacaoValor,
  Teste,
];

// Função helper para obter a lista de entidades (opcional, para melhor tipagem)
export function getEntities() {
  return entities;
}
