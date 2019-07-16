# safe-is-type-ts

[![Build Status](https://travis-ci.org/kgtkr/safe-is-type-ts.svg?branch=master)](https://travis-ci.org/kgtkr/safe-is-type-ts)

## Install

```sh
$ npm i safe-is-type-ts
```

## Usage

```ts
import { isType, isNotType, toIsTypeFunction } from "safe-is-type-ts";

// isString: (x: unknown) => x is string
const isString = toIsTypeFunction((x: unknown) =>
    typeof x === "string" ? isType(x) : isNotType()
);

isString("x"); // true
isString(null); // false

// isA: (x: "a" | "b") => x is "a"
const isA = toIsTypeFunction((x: "a" | "b") =>
    x === "a" ? isType(x) : isNotType()
);

isA("a"); // true
isA("b"); // false
isA("c"); // Argument of type '"c"' is not assignable to parameter of type '"a" | "b"'
```