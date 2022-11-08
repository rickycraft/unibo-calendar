
import { publicProcedure, router } from "../trpc"

export const exampleRouter = router({
  hello: publicProcedure
    .query(async () => {
      // getLessons("https://corsi.unibo.it/laurea/IngegneriaInformatica", 1, "000-000")
      return "url"
    }),
})
