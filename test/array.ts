import { pick } from "../src/tool";



pick([1, 2, 3]);

interface Item {
  a: number
}

pick([{ a: 1 }] as Item[])