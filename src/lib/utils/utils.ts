import {
  permissoes,
  type PermissoesCompletas,
  type PermissoesUsuarioInput,
} from "$lib/types/permissoes";
import { Categoria } from "$shared/categoria/categoria.model";
import type { PermissaoUsuario } from "$shared/permissao_usuario/permissao_usuario.model";
import { remult } from "remult";

export function criarObjetoPermissoes(
  permissoesUsuarios?: PermissaoUsuario[]
): PermissoesCompletas {
  // Clona o objeto base com todas as permissões como false
  const resultado = JSON.parse(JSON.stringify(permissoes));
  if (!permissoesUsuarios) {
    return resultado;
  }

  for (const permissao of permissoesUsuarios) {
    const tela = permissao.tela as keyof PermissoesCompletas;
    const regra = permissao.regra as keyof PermissoesCompletas[typeof tela];

    if (resultado[tela] && resultado[tela][regra]) {
      resultado[tela][regra].temPermissao = true;
    }
  }

  return resultado as PermissoesCompletas;
}

export interface PesquisaProduto {
  codigoProduto: number | null;
  codigoFornecedor: string | null;
}

export function processarPesquisaProduto(pesquisa: string): PesquisaProduto {
  const resultado: PesquisaProduto = {
    codigoProduto: null,
    codigoFornecedor: null,
  };

  if (!pesquisa.trim()) {
    return resultado;
  }

  // Dividir por underline se houver
  const partes = pesquisa.split("_");

  for (const parte of partes) {
    const trimmed = parte.trim();
    if (!trimmed) continue;

    // Se for só números
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed.replace(/^0+/, "")) || null;
      if (num !== null) {
        resultado.codigoProduto = num;
      }
    }
    // Se começar com P seguido de números
    else if (/^P\d+$/.test(trimmed)) {
      const numStr = trimmed.substring(1);
      const num = parseInt(numStr.replace(/^0+/, "")) || null;
      if (num !== null) {
        resultado.codigoProduto = num;
      }
    }
    // Se começar com F
    else if (trimmed.startsWith("F") && trimmed.length > 1) {
      resultado.codigoFornecedor = trimmed.substring(1);
    }
    // Caso contrário, ignorar ou considerar mal escrito
  }

  return resultado;
}

export function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, "");

  if (cpfLimpo.length !== 11) {
    return false;
  }

  // Permitir CPFs com todos os dígitos iguais (ex.: 11111111111)
  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return true;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;

  return (
    parseInt(cpfLimpo.charAt(9)) === digito1 &&
    parseInt(cpfLimpo.charAt(10)) === digito2
  );
}

export function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, "");

  if (cnpjLimpo.length !== 14) {
    return false;
  }

  // Permitir CNPJs com todos os dígitos iguais (ex.: 11111111111111)
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
    return true;
  }

  // Calcular primeiro dígito verificador
  let soma = 0;
  let peso = 5;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpjLimpo.charAt(i)) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;

  // Calcular segundo dígito verificador
  soma = 0;
  peso = 6;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpjLimpo.charAt(i)) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;

  return (
    parseInt(cnpjLimpo.charAt(12)) === digito1 &&
    parseInt(cnpjLimpo.charAt(13)) === digito2
  );
}

export function formatarCNPJ(cnpj: string): string {
  const limpo = cnpj.replace(/\D/g, "");

  if (limpo.length !== 14) {
    return cnpj; // Retorna como está se não tiver 14 dígitos
  }

  return `${limpo.slice(0, 2)}.${limpo.slice(2, 5)}.${limpo.slice(
    5,
    8
  )}/${limpo.slice(8, 12)}-${limpo.slice(12, 14)}`;
}

export function validarTelefone(telefone: string): boolean {
  if (!telefone) return false;
  const limpo = telefone.replace(/\D/g, "");
  if (limpo.length !== 10 && limpo.length !== 11) return false;

  const ddd = parseInt(limpo.substring(0, 2));
  const dddsValidos = [
    11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35,
    37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64,
    65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88,
    89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
  ];
  if (!dddsValidos.includes(ddd)) return false;

  if (limpo.length === 11) {
    const terceiroDigito = limpo.charAt(2);
    if (terceiroDigito !== "9") return false;
  }

  return true;
}

export function validarEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  // Expressão regular para validar email
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email.trim());
}

export function validarEstado(estado: string): boolean {
  if (!estado || typeof estado !== "string") {
    return false;
  }

  const estadoLimpo = estado.trim().toUpperCase();

  // Lista de UFs válidas do Brasil
  const ufsValidas = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  return ufsValidas.includes(estadoLimpo);
}

export function validarUUIDv4(uuid: string): boolean {
  if (!uuid || typeof uuid !== "string") {
    return false;
  }

  // Expressão regular para validar UUID v4
  // Formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Onde x é qualquer dígito hexadecimal (0-9, a-f, A-F)
  // O 4 na terceira posição é obrigatório
  // O y na quarta posição deve ser 8, 9, a, ou b
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(uuid.trim());
}
