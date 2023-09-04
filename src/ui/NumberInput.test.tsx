/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { vi, expect, test, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { NumberInput } from "./NumberInput";
import { getMountCount, getTotalRenderCount, resetCount } from "../counter";
import userEvent from "@testing-library/user-event";

afterEach(() => {
  resetCount();
});
test("should show NumberInput", () => {
  const onChange = vi.fn();
  render(<NumberInput defaultValue={42} onChange={onChange} />);
  const input = screen.getByRole("spinbutton");
  expect(input).toHaveValue(42);
  expect(getMountCount("NumberInput")).toBe(1);
  expect(getTotalRenderCount("NumberInput")).toBe(1);
});
test("should call onChange", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<NumberInput onChange={onChange} />);
  const input = screen.getByRole("spinbutton");
  input.focus();
  await user.click(input);
  await user.type(input, "42");
  expect(onChange).toHaveBeenCalledWith(42);
  expect(getMountCount("NumberInput")).toBe(1);
  expect(getTotalRenderCount("NumberInput")).toBe(1);
});
