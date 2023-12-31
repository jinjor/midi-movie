import { vi, expect, test, afterEach } from "vitest";
import { NumberInput } from "./NumberInput";
import { getMountCount, getTotalRenderCount, resetCount } from "../../counter";
import { renderInNewContainer } from "@/test/util";
import userEvent from "@testing-library/user-event";

afterEach(() => {
  resetCount();
});
test("should show NumberInput", () => {
  const onChange = vi.fn();
  const container = renderInNewContainer(
    <NumberInput defaultValue={42} onChange={onChange} />,
  );
  const input = container.getByRole("spinbutton");
  expect(input).toHaveValue(42);
  expect(getMountCount("NumberInput")).toBe(1);
  expect(getTotalRenderCount("NumberInput")).toBe(1);
});
test("should call onChange", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const container = renderInNewContainer(
    <NumberInput defaultValue={42} onChange={onChange} />,
  );
  const input = container.getByRole("spinbutton");
  await user.dblClick(input);
  await user.keyboard("{backspace}");
  await user.type(input, "42");
  expect(onChange).toHaveBeenCalledWith(42);
  expect(getMountCount("NumberInput")).toBe(1);
  expect(getTotalRenderCount("NumberInput")).toBe(1);
});
