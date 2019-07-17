import { isT, isNotT, defineIsT } from "./safe-type-predicate";

describe("safe-type-predicate", () => {
  describe("isT", () => {
    it("should always return true", () => {
      expect(isT(null)).toEqual(true);
    });
  });

  describe("isNotT", () => {
    it("should always return false", () => {
      expect(isNotT()).toEqual(false);
    });
  });

  describe("defineIsT", () => {
    describe("define isString", () => {
      const isString = defineIsT((x: unknown) =>
        typeof x === "string" ? isT(x) : isNotT()
      );

      it("isString(string) should return true", () => {
        expect(isString("test")).toEqual(true);
      });

      it("isString(number) should return false", () => {
        expect(isString(10)).toEqual(false);
      });
    });

    describe("define isOne", () => {
      const isOne = defineIsT((x: 1 | 2) => (x === 1 ? isT(x) : isNotT()));

      it("isOne(1) should return true", () => {
        expect(isOne(1)).toEqual(true);
      });

      it("isOne(2) should return false", () => {
        expect(isOne(2)).toEqual(false);
      });
    });
  });
});
