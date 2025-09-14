import { Entity, Fields } from "remult";

@Entity<Test>("tests", {
  allowApiCrud: true,
})
export class Test {
  @Fields.id()
  id = "";

  @Fields.string<string>({
    valueConverter: {
      toDb: (value: string) => value.replace("PROD", ""),
      fromDb: (value: string) => "PROD" + value, // Adds prefix when loading
    },
  })
  code: number = 0;
}
