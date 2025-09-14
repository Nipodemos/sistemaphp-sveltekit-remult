#!/usr/bin/env tsx

/**
 * Remult Prototyping File
 *
 * This file allows testing and prototyping with Remult models
 * without needing the web server or saving data to disk.
 *
 * How to use:
 * 1. npm install tsx -g (if you don't have it)
 * 2. npx tsx prototype.ts
 */

import { remult, repo } from "remult";
import { InMemoryDataProvider } from "remult";

// Import entities
import { Test } from "./src/shared/teste/teste.model";

// Configure Remult with in-memory data provider
remult.dataProvider = new InMemoryDataProvider();

// Main function
console.log("🚀 Starting Remult prototyping...\n");

try {
  const repoTest = repo(Test);
  let tests = await repoTest.find();
  console.log("tests :>> ", tests);

  const newTest = await repoTest.insert({ code: 1 });
  console.log("newTest :>> ", newTest);

  const newTest2 = await repoTest.insert({ code: 2 });
  console.log("newTest2 :>> ", newTest2);

  const newTest3 = await repoTest.insert({ code: 3 });
  console.log("newTest3 :>> ", newTest3);

  const newTest4 = await repoTest.insert({ code: 4 });
  console.log("newTest4 :>> ", newTest4);

  tests = await repoTest.find();
  console.log("tests :>> ", tests);

  console.log("\n🎉 Prototyping completed successfully!");
} catch (error) {
  console.error("\n💥 General error:", error);
}
