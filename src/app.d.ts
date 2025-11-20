// See https://kit.svelte.dev/docs/types#app

import type { PermissoesCompletas } from "$lib/types/permissoes";
import type { Usuario } from "$shared/usuario/usuario.model";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      usuario: Usuario | null;
      permissoesCompletas: PermissoesCompletas | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

declare module "remult" {
  interface UserInfo {
    permissoesCompletas: PermissoesCompletas;
  }
  // interface FieldOptions<entityType, valueType> {
  //   placeholder?: string;
  // }
}

export {};
