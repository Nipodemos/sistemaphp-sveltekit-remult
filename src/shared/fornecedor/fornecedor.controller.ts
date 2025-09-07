import { Allow, BackendMethod, remult } from "remult";
import { Fornecedor } from "./fornecedor.model";
import type { TipoDocumento } from "./fornecedor.model";

export class FornecedorController {
  @BackendMethod({ allowed: Allow.authenticated })
  static async criarFornecedor(fornecedorData: {
    razaoSocial: string;
    nomeFantasia: string;
    tipoDocumento: TipoDocumento;
    documento: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    telefonePrincipal: string;
    telefoneSecundario: string;
    email: string;
    representanteNome: string;
    representanteCargo: string;
    representanteTelefone: string;
    representanteEmail: string;
  }): Promise<Fornecedor> {
    const repo = remult.repo(Fornecedor);

    // Validações
    this.validarDados(fornecedorData);

    // Gerar código automaticamente
    const codigo = await this.gerarCodigoUnico(
      fornecedorData.nomeFantasia,
      fornecedorData.documento
    );

    const fornecedor = repo.create();
    fornecedor.codigo = codigo;
    fornecedor.razaoSocial = fornecedorData.razaoSocial;
    fornecedor.nomeFantasia = fornecedorData.nomeFantasia;
    fornecedor.tipoDocumento = fornecedorData.tipoDocumento;
    fornecedor.documento = fornecedorData.documento;
    fornecedor.rua = fornecedorData.rua;
    fornecedor.numero = fornecedorData.numero;
    fornecedor.complemento = fornecedorData.complemento;
    fornecedor.bairro = fornecedorData.bairro;
    fornecedor.cidade = fornecedorData.cidade;
    fornecedor.estado = fornecedorData.estado;
    fornecedor.cep = fornecedorData.cep;
    fornecedor.telefonePrincipal = fornecedorData.telefonePrincipal;
    fornecedor.telefoneSecundario = fornecedorData.telefoneSecundario;
    fornecedor.email = fornecedorData.email;
    fornecedor.representanteNome = fornecedorData.representanteNome;
    fornecedor.representanteCargo = fornecedorData.representanteCargo;
    fornecedor.representanteTelefone = fornecedorData.representanteTelefone;
    fornecedor.representanteEmail = fornecedorData.representanteEmail;

    return await repo.save(fornecedor);
  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async editarFornecedor(
    fornecedorId: string,
    fornecedorData: Partial<{
      razaoSocial: string;
      nomeFantasia: string;
      tipoDocumento: TipoDocumento;
      documento: string;
      rua: string;
      numero: string;
      complemento: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
      telefonePrincipal: string;
      telefoneSecundario: string;
      email: string;
      representanteNome: string;
      representanteCargo: string;
      representanteTelefone: string;
      representanteEmail: string;
    }>
  ): Promise<Fornecedor> {
    const repo = remult.repo(Fornecedor);
    const fornecedor = await repo.findId(fornecedorId);

    if (!fornecedor) {
      throw new Error("Fornecedor não encontrado");
    }

    // Validações
    if (fornecedorData.documento || fornecedorData.tipoDocumento) {
      const dadosParaValidacao = {
        ...fornecedor,
        ...fornecedorData,
      };
      this.validarDados(dadosParaValidacao as any);
    }

    // Se nome fantasia ou documento mudou, gerar novo código
    if (fornecedorData.nomeFantasia || fornecedorData.documento) {
      const nomeFantasia =
        fornecedorData.nomeFantasia || fornecedor.nomeFantasia;
      const documento = fornecedorData.documento || fornecedor.documento;
      fornecedor.codigo = await this.gerarCodigoUnico(nomeFantasia, documento);
    }

    // Atualizar campos
    Object.assign(fornecedor, fornecedorData);

    return await repo.save(fornecedor);
  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async excluirFornecedor(fornecedorId: string): Promise<void> {
    const repo = remult.repo(Fornecedor);
    const fornecedor = await repo.findId(fornecedorId);

    if (!fornecedor) {
      throw new Error("Fornecedor não encontrado");
    }

    // TODO: Verificar se tem produtos ou outras dependências antes de excluir

    await repo.delete(fornecedor);
  }

  private static validarDados(fornecedorData: {
    tipoDocumento: TipoDocumento;
    documento: string;
    email: string;
    razaoSocial: string;
    nomeFantasia: string;
  }): void {
    // Validar campos obrigatórios
    if (!fornecedorData.razaoSocial?.trim()) {
      throw new Error("Razão social é obrigatória");
    }

    if (!fornecedorData.nomeFantasia?.trim()) {
      throw new Error("Nome fantasia é obrigatório");
    }

    if (!fornecedorData.documento?.trim()) {
      throw new Error("Documento é obrigatório");
    }

    // Validar documento
    if (fornecedorData.tipoDocumento === "CPF") {
      if (!this.validarCPF(fornecedorData.documento)) {
        throw new Error("CPF inválido");
      }
    } else if (fornecedorData.tipoDocumento === "CNPJ") {
      if (!this.validarCNPJ(fornecedorData.documento)) {
        throw new Error("CNPJ inválido");
      }
    }

    // Validar email se fornecido
    if (fornecedorData.email && !this.validarEmail(fornecedorData.email)) {
      throw new Error("Email inválido");
    }
  }

  private static async gerarCodigoUnico(
    nomeFantasia: string,
    documento: string
  ): Promise<string> {
    // Limpar documento removendo caracteres não numéricos
    const documentoLimpo = documento.replace(/\D/g, "");

    // Dividir nome fantasia em palavras (ignorando espaços extras)
    const palavras = nomeFantasia
      .trim()
      .split(/\s+/)
      .filter((p) => p.length > 0);

    let codigoBase: string;

    if (palavras.length === 1) {
      // 1 palavra: Primeiras 3 letras maiúsculas + primeiros 3 dígitos do documento
      const letras = palavras[0].substring(0, 3).toUpperCase();
      const digitos = documentoLimpo.substring(0, 3);
      codigoBase = letras + digitos;
    } else if (palavras.length === 2) {
      // 2 palavras: Iniciais maiúsculas das 2 palavras + primeiros 4 dígitos do documento
      const letras = palavras
        .slice(0, 2)
        .map((p) => p.charAt(0).toUpperCase())
        .join("");
      const digitos = documentoLimpo.substring(0, 4);
      codigoBase = letras + digitos;
    } else {
      // 3+ palavras: Iniciais maiúsculas das 3 primeiras palavras + primeiros 3 dígitos do documento
      const letras = palavras
        .slice(0, 3)
        .map((p) => p.charAt(0).toUpperCase())
        .join("");
      const digitos = documentoLimpo.substring(0, 3);
      codigoBase = letras + digitos;
    }

    // Verificar se código já existe e gerar versão única se necessário
    return await this.tornarCodigoUnico(codigoBase);
  }

  private static async tornarCodigoUnico(codigoBase: string): Promise<string> {
    const repo = remult.repo(Fornecedor);
    const fornecedores = await repo.find();

    // Verificar se código base já existe
    const existe = fornecedores.some((f) => f.codigo === codigoBase);

    if (!existe) {
      return codigoBase;
    }

    // Se existe, adicionar sufixo A-Z sequencialmente
    for (let i = 65; i <= 90; i++) {
      // A-Z
      const codigoComSufixo = codigoBase + String.fromCharCode(i);
      const existeComSufixo = fornecedores.some(
        (f) => f.codigo === codigoComSufixo
      );

      if (!existeComSufixo) {
        return codigoComSufixo;
      }
    }

    throw new Error("Não foi possível gerar um código único para o fornecedor");
  }

  private static validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      return false;
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpfLimpo)) {
      return false;
    }

    // Calcular primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;

    // Calcular segundo dígito verificador
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

  private static validarCNPJ(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/\D/g, "");

    if (cnpjLimpo.length !== 14) {
      return false;
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpjLimpo)) {
      return false;
    }

    // Pesos para cálculo dos dígitos verificadores
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    // Calcular primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpjLimpo.charAt(i)) * pesos1[i];
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;

    // Calcular segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpjLimpo.charAt(i)) * pesos2[i];
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;

    return (
      parseInt(cnpjLimpo.charAt(12)) === digito1 &&
      parseInt(cnpjLimpo.charAt(13)) === digito2
    );
  }

  private static validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
