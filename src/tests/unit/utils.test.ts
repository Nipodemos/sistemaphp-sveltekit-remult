import { describe, it, expect } from "vitest";
import {
  formatarCNPJ,
  validarCNPJ,
  validarEmail,
  validarEstado,
  validarUUIDv4,
} from "$lib/utils/utils";

describe("Utils - CNPJ", () => {
  describe("formatarCNPJ", () => {
    it("deve formatar CNPJ corretamente", () => {
      const cnpj = "11222333000181";
      const resultado = formatarCNPJ(cnpj);
      expect(resultado).toBe("11.222.333/0001-81");
    });

    it("deve manter CNPJ já formatado", () => {
      const cnpj = "11.222.333/0001-81";
      const resultado = formatarCNPJ(cnpj);
      expect(resultado).toBe("11.222.333/0001-81");
    });

    it("deve retornar CNPJ inválido como está", () => {
      const cnpj = "1234567800012"; // 13 dígitos
      const resultado = formatarCNPJ(cnpj);
      expect(resultado).toBe("1234567800012");
    });

    it("deve formatar CNPJ com caracteres especiais", () => {
      const cnpj = "11.222.333/0001-81";
      const resultado = formatarCNPJ(cnpj);
      expect(resultado).toBe("11.222.333/0001-81");
    });
  });

  describe("validarCNPJ", () => {
    it("deve validar CNPJ válido", () => {
      const cnpj = "11222333000181";
      const resultado = validarCNPJ(cnpj);
      expect(resultado).toBe(true);
    });

    it("deve rejeitar CNPJ inválido", () => {
      const cnpj = "11222333000182";
      const resultado = validarCNPJ(cnpj);
      expect(resultado).toBe(false);
    });

    it("deve validar CNPJ formatado", () => {
      const cnpj = "11.222.333/0001-81";
      const resultado = validarCNPJ(cnpj);
      expect(resultado).toBe(true);
    });
  });
});

describe("Utils - Email", () => {
  describe("validarEmail", () => {
    it("deve validar email válido simples", () => {
      const email = "teste@example.com";
      const resultado = validarEmail(email);
      expect(resultado).toBe(true);
    });

    it("deve validar email válido com subdomínio", () => {
      const email = "usuario@sub.dominio.com";
      const resultado = validarEmail(email);
      expect(resultado).toBe(true);
    });

    it("deve validar email válido com números", () => {
      const email = "user123@teste.com";
      const resultado = validarEmail(email);
      expect(resultado).toBe(true);
    });

    it("deve validar email válido com caracteres especiais", () => {
      const email = "user.name+tag@example.com";
      const resultado = validarEmail(email);
      expect(resultado).toBe(true);
    });

    it("deve rejeitar email sem @", () => {
      const email = "testeexample.com";
      const resultado = validarEmail(email);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar email sem domínio", () => {
      const email = "teste@";
      const resultado = validarEmail(email);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar email sem nome de usuário", () => {
      const email = "@example.com";
      const resultado = validarEmail(email);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar email com espaços", () => {
      const email = "teste @example.com";
      const resultado = validarEmail(email);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar email vazio", () => {
      const email = "";
      const resultado = validarEmail(email);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar email null", () => {
      const email = null as any;
      const resultado = validarEmail(email);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar email undefined", () => {
      const email = undefined as any;
      const resultado = validarEmail(email);
      expect(resultado).toBe(false);
    });

    it("deve validar email com espaços em branco (trim)", () => {
      const email = "  teste@example.com  ";
      const resultado = validarEmail(email);
      expect(resultado).toBe(true);
    });
  });
});

describe("Utils - Estado", () => {
  describe("validarEstado", () => {
    it("deve validar estado válido em maiúsculo", () => {
      const estado = "SP";
      const resultado = validarEstado(estado);
      expect(resultado).toBe(true);
    });

    it("deve validar estado válido em minúsculo", () => {
      const estado = "sp";
      const resultado = validarEstado(estado);
      expect(resultado).toBe(true);
    });

    it("deve validar estado válido com espaços", () => {
      const estado = " SP ";
      const resultado = validarEstado(estado);
      expect(resultado).toBe(true);
    });

    it("deve rejeitar estado inválido", () => {
      const estado = "XX";
      const resultado = validarEstado(estado);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar estado vazio", () => {
      const estado = "";
      const resultado = validarEstado(estado);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar estado null", () => {
      const estado = null as any;
      const resultado = validarEstado(estado);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar estado undefined", () => {
      const estado = undefined as any;
      const resultado = validarEstado(estado);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar estado com mais de 2 caracteres", () => {
      const estado = "SPR";
      const resultado = validarEstado(estado);
      expect(resultado).toBe(false);
    });

    it("deve validar todos os estados brasileiros", () => {
      const estadosValidos = [
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

      estadosValidos.forEach((estado) => {
        expect(validarEstado(estado)).toBe(true);
        expect(validarEstado(estado.toLowerCase())).toBe(true);
      });
    });
  });
});

describe("Utils - UUID v4", () => {
  describe("validarUUIDv4", () => {
    it("deve validar UUID v4 válido", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(true);
    });

    it("deve validar UUID v4 válido com letras maiúsculas", () => {
      const uuid = "550E8400-E29B-41D4-A716-446655440000";
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(true);
    });

    it("deve validar UUID v4 válido com letras minúsculas", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(true);
    });

    it("deve rejeitar UUID v4 com versão incorreta", () => {
      const uuid = "550e8400-e29b-31d4-a716-446655440000"; // versão 3
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar UUID v4 com variante incorreta", () => {
      const uuid = "550e8400-e29b-41d4-c716-446655440000"; // variante c
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar UUID v4 com variante incorreta (d-f)", () => {
      const uuid = "550e8400-e29b-41d4-d716-446655440000"; // variante d
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar UUID com formato incorreto (sem hífens)", () => {
      const uuid = "550e8400e29b41d4a716446655440000";
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar UUID com formato incorreto (hífens extras)", () => {
      const uuid = "550e8400-e29b-41d4-a716-4466-55440000";
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar UUID muito curto", () => {
      const uuid = "550e8400-e29b-41d4-a716-44665544000";
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar UUID muito longo", () => {
      const uuid = "550e8400-e29b-41d4-a716-4466554400000";
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar UUID com caracteres inválidos", () => {
      const uuid = "550e8400-e29b-41d4-a716-44665544000g";
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar string vazia", () => {
      const uuid = "";
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar null", () => {
      const uuid = null as any;
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar undefined", () => {
      const uuid = undefined as any;
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(false);
    });

    it("deve rejeitar string apenas com espaços", () => {
      const uuid = "   ";
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(false);
    });

    it("deve aceitar UUID v4 válido com espaços em branco", () => {
      const uuid = "  550e8400-e29b-41d4-a716-446655440000  ";
      const resultado = validarUUIDv4(uuid);
      expect(resultado).toBe(true);
    });

    it("deve validar vários UUIDs v4 válidos", () => {
      const uuidsValidos = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-41d4-80b4-00c04fd430c8",
        "6ba7b811-9dad-41d4-80b4-00c04fd430c8",
        "6ba7b812-9dad-41d4-80b4-00c04fd430c8",
        "6ba7b814-9dad-41d4-80b4-00c04fd430c8",
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "12345678-1234-4123-8123-123456789012",
      ];

      uuidsValidos.forEach((uuid) => {
        expect(validarUUIDv4(uuid)).toBe(true);
      });
    });

    it("deve rejeitar UUIDs de outras versões", () => {
      const uuidsInvalidos = [
        "550e8400-e29b-11d4-a716-446655440000", // v1
        "550e8400-e29b-21d4-a716-446655440000", // v2
        "550e8400-e29b-31d4-a716-446655440000", // v3
        "550e8400-e29b-51d4-a716-446655440000", // v5
      ];

      uuidsInvalidos.forEach((uuid) => {
        expect(validarUUIDv4(uuid)).toBe(false);
      });
    });
  });
});
