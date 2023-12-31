import { configure, fireEvent, waitFor } from "@testing-library/react";
import {
  getMountCount,
  getRenderedKeys,
  getTotalRenderCount,
  resetCount,
} from "../counter";
import userEvent from "@testing-library/user-event";
import { renderInNewContainer } from "@/test/util";
import { Root } from "./Root";
import midiFile from "@/assets/1.midi?buffer";
import pngFile from "@/assets/1.png?buffer";
import wavFile from "@/assets/1.wav?buffer";

configure({
  getElementError: (message: string | null) => {
    const error = new Error(message ?? "");
    error.name = "TestingLibraryElementError";
    error.stack = undefined;
    return error;
  },
});

afterEach(() => {
  resetCount();
});
test("should show App", () => {
  renderInNewContainer(<Root />);
  expect(getMountCount("App")).toBe(1);
  expect(getTotalRenderCount("App")).toBe(1);
  expect(getMountCount("MidiSettings")).toBe(1);
  expect(getTotalRenderCount("MidiSettings")).toBe(2);
  expect(getMountCount("RendererSettings")).toBe(1);
  expect(getTotalRenderCount("RendererSettings")).toBe(2);
  expect(getMountCount("PlayerSettings")).toBe(1);
  expect(getTotalRenderCount("PlayerSettings")).toBe(2);
  expect(getMountCount("Player")).toBe(1);
  expect(getTotalRenderCount("Player")).toBe(2);
});
test("should play", async () => {
  const user = userEvent.setup();
  const container = renderInNewContainer(<Root />);
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));
  resetCount();
  const playButton = container.getByText(/Play/i);
  await user.click(playButton);
  expect(getRenderedKeys()).not.toContainAnyOf([
    "App",
    "MidiLoader",
    "AudioLoader",
    "ImageLoader",
    "MidiSettings",
    "RendererSettings",
  ]);
  expect(getMountCount("Player")).toBe(0);
  expect(getTotalRenderCount("Player")).toBe(0);
});
test.skip("should update Min Note", async () => {
  const user = userEvent.setup();
  const container = renderInNewContainer(<Root />);
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));
  resetCount();
  const input = container.getByLabelText(/Min Note/i);
  input.focus();
  await user.dblClick(input);
  await user.keyboard("{backspace}");
  await user.type(input, "42");
  expect(input).toHaveValue(42);
  expect(getRenderedKeys()).not.toContainAnyOf([
    "App",
    "MidiLoader",
    "AudioLoader",
    "ImageLoader",
    "MidiSettings",
  ]);
});
test.skip("should update Max Note", async () => {
  const user = userEvent.setup();
  const container = renderInNewContainer(<Root />);
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));
  resetCount();
  const input = container.getByLabelText(/Max Note/i);
  input.focus();
  await user.dblClick(input);
  await user.keyboard("{backspace}");
  await user.type(input, "42");
  expect(input).toHaveValue(42);
  expect(getRenderedKeys()).not.toContainAnyOf([
    "App",
    "MidiLoader",
    "AudioLoader",
    "ImageLoader",
    "MidiSettings",
  ]);
});
test.skip("should update Midi Offset", async () => {
  const user = userEvent.setup();
  const container = renderInNewContainer(<Root />);
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));
  resetCount();
  const input = container.getByLabelText(/Midi Offset/i);
  input.focus();
  await user.dblClick(input);
  await user.keyboard("{backspace}");
  await user.type(input, "42");
  expect(input).toHaveValue(42);
  expect(getRenderedKeys()).not.toContainAnyOf([
    "App",
    "MidiLoader",
    "ImageLoader",
    "AudioLoader",
    "MidiSettings",
  ]);
  expect(getMountCount("Player")).toBe(0);
  expect(getTotalRenderCount("Player")).toBe(2);
  expect(getMountCount("RendererSettings")).toBe(0);
  expect(getTotalRenderCount("RendererSettings")).toBe(2);
});
test("should update Overlay Opacity", async () => {
  const user = userEvent.setup();
  const container = renderInNewContainer(<Root />);
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));
  resetCount();
  const input = container.getByLabelText(/Overlay Opacity/i);
  input.focus();
  await user.dblClick(input);
  await user.keyboard("{backspace}{backspace}{backspace}");
  await user.type(input, "1");
  expect(input).toHaveValue(1);
  expect(getRenderedKeys()).not.toContainAnyOf([
    "App",
    "MidiLoader",
    "AudioLoader",
    "ImageLoader",
    "MidiSettings",
    "Player",
  ]);
});
test("should load MIDI file", async () => {
  const container = renderInNewContainer(<Root />);
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));
  resetCount();
  const input = container.getByLabelText(/MIDI/);
  const file = new File([midiFile], "test.midi", {
    type: "audio/midi",
  });
  fireEvent.change(input, {
    target: {
      files: [file],
    },
  });
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 500)));
  expect(getRenderedKeys()).not.toContainAnyOf([
    "App",
    "AudioLoader",
    "ImageLoader",
    "Settings",
  ]);
  expect(getMountCount("MidiSettings")).toBe(0);
  expect(getTotalRenderCount("MidiSettings")).toBe(1);
  expect(getMountCount("Player")).toBe(0);
  expect(getTotalRenderCount("Player")).toBeLessThanOrEqual(2);
});
test("should load Image file", async () => {
  const file = new File([pngFile], "test.png", {
    type: "image/png",
  });
  const container = renderInNewContainer(<Root />);
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 800)));
  resetCount();
  const input = container.getByLabelText(/Image/i);
  fireEvent.change(input, {
    target: {
      files: [file],
    },
  });
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 500)));
  expect(getRenderedKeys()).not.toContainAnyOf([
    "App",
    "MidiLoader",
    "AudioLoader",
    "Settings",
    "NumberInput",
  ]);
  expect(getMountCount("ImageLoader")).toBe(0);
  expect(getTotalRenderCount("ImageLoader")).toBe(1);
  expect(getMountCount("Player")).toBe(0);
  expect(getTotalRenderCount("Player")).toBeLessThanOrEqual(2);
});
test("should load Wave file", async () => {
  const container = renderInNewContainer(<Root />);
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 800)));
  resetCount();
  const input = container.getByLabelText(/Audio/i);
  const file = new File([wavFile], "test.wav", {
    type: "audio/wav",
  });
  fireEvent.change(input, {
    target: {
      files: [file],
    },
  });
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 800)));
  expect(getRenderedKeys()).not.toContainAnyOf([
    "App",
    "MidiLoader",
    "ImageLoader",
    "Settings",
    "NumberInput",
  ]);
  expect(getMountCount("AudioLoader")).toBe(0);
  expect(getTotalRenderCount("AudioLoader")).toBe(1);
  expect(getMountCount("Player")).toBe(0);
  expect(getTotalRenderCount("Player")).toBeLessThanOrEqual(2);
});
