// See https://kit.svelte.dev/docs/types#app

import type { ServerSession } from "$lib/types/auth";
import type { PermissoesCompletas } from "$lib/types/permissoes";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: ServerSession | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

declare module "remult" {
  interface UserInfo {
    id: string;
    name: string;
    roles: string[];
    permissoesCompletas: PermissoesCompletas;
  }
  // interface FieldOptions<entityType, valueType> {
  //   placeholder?: string;
  // }
}

export {};
