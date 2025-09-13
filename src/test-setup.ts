/// <reference types="vitest/globals" />

import { remult } from "remult";
import { InMemoryDataProvider } from "remult";
import { entities } from "$shared/entities";

// Configura o Remult com data provider in-memory para testes
remult.dataProvider = new InMemoryDataProvider();

// Registra todas as entidades
entities.forEach((entity) => {
  remult.repo(entity);
});
