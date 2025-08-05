// See https://kit.svelte.dev/docs/types#app

import type { Usuario } from "./routes/app/usuarios/usuario.model";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      usuario: Usuario | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

declare module "remult" {
  // interface UserInfo {
  //   phone: string;
  // }
  // interface FieldOptions<entityType, valueType> {
  //   placeholder?: string;
  // }
}

export {};
