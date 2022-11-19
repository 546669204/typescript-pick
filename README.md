# typescript-pick

一款智能的数据挑选工具   


根据 变量的 `ts` 定义 自动剔除掉多余的属性  


# Usage

```
yarn add typescript-pick
```

```ts
import { pick } from "typescript-pick";


interface T {
  a: number,
  b: string,
}

const data = {
  a: 1,
  b: "str",
  c: 7,
  d: true
}

pick(data) // => { a:1,b:"str" }

```