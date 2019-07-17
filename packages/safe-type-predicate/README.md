# safe-type-predicate

[![Build Status](https://travis-ci.org/kgtkr/safe-type-predicate.svg?branch=master)](https://travis-ci.org/kgtkr/safe-type-predicate)

## Install

```sh
$ npm i safe-type-predicate
```

## Usage

```ts
import { isT, isNotT, defineIsT } from "safe-type-predicate";

// isString: (x: unknown) => x is string
const isString = defineIsT((x: unknown) =>
    typeof x === "string" ? isT(x) : isNotT()
);

isString("x"); // true
isString(null); // false

// isA: (x: "a" | "b") => x is "a"
const isA = defineIsT((x: "a" | "b") =>
    x === "a" ? isT(x) : isNotT()
);

isA("a"); // true
isA("b"); // false
isA("c"); // Argument of type '"c"' is not assignable to parameter of type '"a" | "b"'
```