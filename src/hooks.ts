import { repo, type ClassType } from "remult";
import { entities } from "./shared/entities";
import type { Transport } from "@sveltejs/kit";

export const transport: Transport = {
  remultTransport: {
    encode: (value: any) => {
      for (let index = 0; index < entities.length; index++) {
        const element = entities[index] as ClassType<any>;
        if (value instanceof element) {
          return {
            ...repo(element).toJson(value),
            entity_key: repo(element).metadata.key,
          };
        }
      }
    },
    decode: (value: any) => {
      for (let index = 0; index < entities.length; index++) {
        const element = entities[index] as ClassType<any>;
        if (value.entity_key === repo(element).metadata.key) {
          return repo(element).fromJson(value);
        }
      }
    },
  },
};
