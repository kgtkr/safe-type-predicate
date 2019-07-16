import { isType, isNotType, toIsTypeFunction } from "./safe-is-type";

describe("safe is type", () => {
  describe("isType", () => {
    it("should always return true", () => {
      expect(isType(null)).toEqual(true);
    });
  });

  describe("isNotType", () => {
    it("should always return false", () => {
      expect(isNotType()).toEqual(false);
    });
  });

  describe("toIsTypeFunction", () => {
    describe("define isString", () => {
      const isString = toIsTypeFunction((x: unknown) =>
        typeof x === "string" ? isType(x) : isNotType()
      );

      it("isString(string) should return true", () => {
        expect(isString("test")).toEqual(true);
      });

      it("isString(number) should return false", () => {
        expect(isString(10)).toEqual(false);
      });
    });

    describe("define isOne", () => {
      const isOne = toIsTypeFunction((x: 1 | 2) =>
        x === 1 ? isType(x) : isNotType()
      );

      it("isOne(1) should return true", () => {
        expect(isOne(1)).toEqual(true);
      });

      it("isOne(2) should return false", () => {
        expect(isOne(2)).toEqual(false);
      });
    });
  });
});
