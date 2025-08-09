import { remult } from "remult";
import type { LayoutLoad } from "./$types";

export const load = (async (event) => {
  remult.useFetch(event.fetch);
  return { usuario: event.data.usuario };
}) satisfies LayoutLoad;
