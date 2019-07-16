declare const isTypeSymbol: unique symbol;
declare const isNotTypeSymbol: unique symbol;

export type IsType<T> = true & { _T: T; _Tag: typeof isTypeSymbol };
export type IsNotType = false & { _Tag: typeof isNotTypeSymbol };

export function isType<T>(_x: T): IsType<T> {
  return true as IsType<T>;
}

export function isNotType(): IsNotType {
  return false as IsNotType;
}

export function toIsTypeFunction<T, R extends T>(
  f: (x: T) => IsType<R> | IsNotType
): (x: T) => x is R {
  return f as any;
}
