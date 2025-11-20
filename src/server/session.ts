import { randomUUID } from "crypto";

interface SessionEntry {
  data: App.Locals;
  expiresAt: number;
}

// Define o tipo global para evitar erros do TypeScript
declare global {
  var sessionStore: Map<string, SessionEntry>;
}

// Inicializa o store no globalThis se não existir (garante persistência no HMR)
if (!globalThis.sessionStore) {
  globalThis.sessionStore = new Map<string, SessionEntry>();
}

const store = globalThis.sessionStore;

/**
 * Cria uma nova sessão e retorna o ID
 * @param data Dados da sessão (App.Locals)
 * @param expiresInMinutes Tempo de expiração em minutos (padrão: 24h)
 */
export function createSession(
  data: App.Locals,
  expiresInMinutes: number = 60 * 24
): string {
  const sessionId = randomUUID();
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

  store.set(sessionId, {
    data,
    expiresAt,
  });

  return sessionId;
}

/**
 * Obtém os dados de uma sessão pelo ID.
 * Retorna a referência direta ao objeto, permitindo mutação.
 * Retorna null se não existir ou estiver expirada.
 */
export function getSession(sessionId: string): App.Locals | null {
  const session = store.get(sessionId);

  if (!session) {
    return null;
  }

  if (Date.now() > session.expiresAt) {
    store.delete(sessionId);
    return null;
  }

  // Atualiza o tempo de expiração a cada acesso? (Opcional, estilo PHP)
  // Por enquanto vamos manter expiração fixa baseada no login, mas poderíamos renovar aqui.
  
  return session.data;
}

/**
 * Remove sessões expiradas.
 * Deve ser chamado periodicamente.
 */
function pruneSessions() {
  const now = Date.now();
  for (const [id, session] of store.entries()) {
    if (now > session.expiresAt) {
      store.delete(id);
    }
  }
}

// Inicia o garbage collector de sessões (roda a cada 1 hora)
// Usamos uma variável global para o intervalo também, para não duplicar timers no HMR
declare global {
  var sessionCleanupInterval: NodeJS.Timeout;
}

if (!globalThis.sessionCleanupInterval) {
  globalThis.sessionCleanupInterval = setInterval(pruneSessions, 60 * 60 * 1000);
  // Opcional: rodar uma limpeza imediata ao iniciar
  pruneSessions();
}
