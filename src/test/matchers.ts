/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-namespace */
interface CustomMatchers<R = unknown> {
  toContainAnyOf(expected: any[]): R;
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}
expect.extend({
  toContainAnyOf(received: any[], expected: any[]) {
    const { isNot } = this;
    const included = expected.filter((item) => received.includes(item));
    return {
      pass: included.length > 0,
      message: () =>
        isNot
          ? `${included.join(", ")} should not be included`
          : `Any of ${expected.join(", ")} should be included`,
    };
  },
});
export {};
