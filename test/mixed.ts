import { pick } from "../src/tool";

interface Parent {
  a: string
}

interface Children {
  b: string,
}

// repeat
interface Parent {
  d: number
}


// implements
class Class implements Parent, Children {
  a: string;
  d: number;
  b: string;
}


// generic
interface C<T> {
  c: T
}

const genericType: C<Children> = {
  c: {
    b: ''
  }
};

// Tree
interface FNode {
  value: number,
  children: FNode[]
}
type ReturnValue<T> = T extends (...args: any) => infer X ? X : never
interface CalcType {
  cadasd: ReturnValue<() => string>
}
const result = {
  str: "asdsa",
  int: 123,
  bool: true,
  genericType,
  array: [1, 2, 3],
  tree: {
    value: 0,
    children: []
  } as FNode,
  adda: null as CalcType
}

pick(result);
