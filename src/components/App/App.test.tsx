import { vi, expect, test, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { App } from "./App";
import { getMountCount, getTotalRenderCount, resetCount } from "../../counter";
import userEvent from "@testing-library/user-event";
import fs from "node:fs/promises";
import { setTimeout } from "timers/promises";

afterEach(() => {
  resetCount();
});
test("should show App", () => {
  render(<App />);
  expect(getMountCount("App")).toBe(1);
  expect(getTotalRenderCount("App")).toBe(1);
  expect(getMountCount("Tracks")).toBe(1);
  expect(getTotalRenderCount("Tracks")).toBe(1);
  expect(getMountCount("Properties")).toBe(1);
  expect(getTotalRenderCount("Properties")).toBe(2);
  expect(getMountCount("Player")).toBe(1);
  expect(getTotalRenderCount("Player")).toBe(2);
});
test("should play", async () => {
  const user = userEvent.setup();
  render(<App />);
  const playButton = screen.getByText(/Min Note/i);
  await user.click(playButton);
  expect(getMountCount("App")).toBe(1);
  expect(getTotalRenderCount("App")).toBe(1);
  expect(getMountCount("Tracks")).toBe(1);
  expect(getTotalRenderCount("Tracks")).toBe(1);
  expect(getMountCount("Properties")).toBe(1);
  expect(getTotalRenderCount("Properties")).toBe(2);
  expect(getMountCount("Player")).toBe(1);
  expect(getTotalRenderCount("Player")).toBe(2);
});
test("should update Min Note", async () => {
  const user = userEvent.setup();
  render(<App />);
  const input = screen.getByLabelText(/Min Note/i);
  input.focus();
  await user.dblClick(input);
  await user.keyboard("{backspace}");
  await user.type(input, "42");
  expect(input).toHaveValue(42);
  expect(getMountCount("App")).toBe(1);
  expect(getTotalRenderCount("App")).toBe(1);
  expect(getMountCount("Properties")).toBe(1);
  expect(getTotalRenderCount("Properties")).toBe(2);
});
test("should update Max Note", async () => {
  const user = userEvent.setup();
  render(<App />);
  const input = screen.getByLabelText(/Max Note/i);
  input.focus();
  await user.dblClick(input);
  await user.keyboard("{backspace}");
  await user.type(input, "42");
  expect(input).toHaveValue(42);
  expect(getMountCount("App")).toBe(1);
  expect(getTotalRenderCount("App")).toBe(1);
  expect(getMountCount("MidiLoader")).toBe(1);
  expect(getTotalRenderCount("MidiLoader")).toBe(1);
  expect(getMountCount("AudioLoader")).toBe(1);
  expect(getTotalRenderCount("AudioLoader")).toBe(1);
  expect(getMountCount("ImageLoader")).toBe(1);
  expect(getTotalRenderCount("ImageLoader")).toBe(1);
  expect(getMountCount("Tracks")).toBe(1);
  expect(getTotalRenderCount("Tracks")).toBe(1);
  expect(getMountCount("Properties")).toBe(1);
  expect(getTotalRenderCount("Properties")).toBe(2);
  expect(getMountCount("NumberInput")).toBe(4);
  expect(getTotalRenderCount("NumberInput")).toBe(4);
});
test("should update Midi Offset", async () => {
  const user = userEvent.setup();
  render(<App />);
  resetCount();
  const input = screen.getByLabelText(/Midi Offset/i);
  input.focus();
  await user.dblClick(input);
  await user.keyboard("{backspace}");
  await user.type(input, "42");
  expect(input).toHaveValue(42);
  expect(getMountCount("App")).toBe(0);
  expect(getTotalRenderCount("App")).toBe(0);
  expect(getMountCount("Player")).toBe(0);
  expect(getTotalRenderCount("Player")).toBe(2);
  expect(getMountCount("Properties")).toBe(0);
  expect(getTotalRenderCount("Properties")).toBe(2);
});

test("should update Audio Offset", async () => {
  const user = userEvent.setup();
  render(<App />);
  resetCount();
  const input = screen.getByLabelText(/Audio Offset/i);
  input.focus();
  await user.dblClick(input);
  await user.keyboard("{backspace}");
  await user.type(input, "42");
  expect(input).toHaveValue(42);
  expect(getMountCount("App")).toBe(0);
  expect(getTotalRenderCount("App")).toBe(0);
  expect(getMountCount("MidiLoader")).toBe(0);
  expect(getTotalRenderCount("MidiLoader")).toBe(0);
  expect(getMountCount("AudioLoader")).toBe(0);
  expect(getTotalRenderCount("AudioLoader")).toBe(0);
  expect(getMountCount("ImageLoader")).toBe(0);
  expect(getTotalRenderCount("ImageLoader")).toBe(0);
  expect(getMountCount("Tracks")).toBe(0);
  expect(getTotalRenderCount("Tracks")).toBe(0);
  expect(getMountCount("Player")).toBe(0);
  expect(getTotalRenderCount("Player")).toBe(2);
  expect(getMountCount("Properties")).toBe(0);
  expect(getTotalRenderCount("Properties")).toBe(2);
  expect(getMountCount("NumberInput")).toBe(0);
  expect(getTotalRenderCount("NumberInput")).toBe(8);
});

test("should load MIDI file", async () => {
  render(<App />);
  resetCount();
  const input = screen.getByLabelText(/MIDI:/i);
  const buffer = await fs.readFile("./src/assets/1.midi");
  const file = new File([buffer], "1.midi", {
    type: "audio/midi",
  });
  fireEvent.change(input, {
    target: {
      files: [file],
    },
  });
  await waitFor(() => setTimeout(100));
  expect(getMountCount("App")).toBe(0);
  expect(getTotalRenderCount("App")).toBe(1);
  expect(getMountCount("MidiLoader")).toBe(0);
  expect(getTotalRenderCount("MidiLoader")).toBe(1);
  expect(getMountCount("AudioLoader")).toBe(0);
  expect(getTotalRenderCount("AudioLoader")).toBe(1);
  expect(getMountCount("ImageLoader")).toBe(0);
  expect(getTotalRenderCount("ImageLoader")).toBe(1);
  expect(getMountCount("Tracks")).toBe(0);
  expect(getTotalRenderCount("Tracks")).toBe(1);
  expect(getMountCount("Player")).toBe(0);
  expect(getTotalRenderCount("Player")).toBe(1);
  expect(getMountCount("Properties")).toBe(0);
  expect(getTotalRenderCount("Properties")).toBe(1);
  expect(getMountCount("NumberInput")).toBe(0);
  expect(getTotalRenderCount("NumberInput")).toBe(4);
});

test("should load Image file", async () => {
  const file = new File([""], "test.png", {
    type: "image/png",
  });
  vi.stubGlobal("URL", {
    createObjectURL: () => "",
    revokeObjectURL: vi.fn(),
  });
  vi.stubGlobal(
    "Image",
    vi.fn(() => ({
      onload: vi.fn(),
      set src(_: string) {
        this.onload();
      },
      naturalWidth: 640,
      naturalHeight: 384,
    }))
  );
  render(<App />);
  resetCount();
  const input = screen.getByLabelText(/Image:/i);
  fireEvent.change(input, {
    target: {
      files: [file],
    },
  });
  await waitFor(() => setTimeout(100));
  expect(getMountCount("App")).toBe(0);
  expect(getTotalRenderCount("App")).toBe(1);
  expect(getMountCount("MidiLoader")).toBe(0);
  expect(getTotalRenderCount("MidiLoader")).toBe(1);
  expect(getMountCount("AudioLoader")).toBe(0);
  expect(getTotalRenderCount("AudioLoader")).toBe(1);
  expect(getMountCount("ImageLoader")).toBe(0);
  expect(getTotalRenderCount("ImageLoader")).toBe(1);
  expect(getMountCount("Tracks")).toBe(0);
  expect(getTotalRenderCount("Tracks")).toBe(1);
  expect(getMountCount("Player")).toBe(0);
  expect(getTotalRenderCount("Player")).toBe(1);
  expect(getMountCount("Properties")).toBe(0);
  expect(getTotalRenderCount("Properties")).toBe(1);
  expect(getMountCount("NumberInput")).toBe(0);
  expect(getTotalRenderCount("NumberInput")).toBe(4);
});

test("should load Wave file", async () => {
  const AudioContextMock = vi.fn(() => ({
    decodeAudioData: () => ({}),
  }));
  vi.stubGlobal("AudioContext", AudioContextMock);

  render(<App />);
  resetCount();
  const input = screen.getByLabelText(/Audio:/i);
  const file = new File([""], "test.wav", {
    type: "audio/wav",
  });
  fireEvent.change(input, {
    target: {
      files: [file],
    },
  });
  await waitFor(() => setTimeout(100));
  expect(getMountCount("App")).toBe(0);
  expect(getTotalRenderCount("App")).toBe(1);
  expect(getMountCount("MidiLoader")).toBe(0);
  expect(getTotalRenderCount("MidiLoader")).toBe(1);
  expect(getMountCount("AudioLoader")).toBe(0);
  expect(getTotalRenderCount("AudioLoader")).toBe(1);
  expect(getMountCount("ImageLoader")).toBe(0);
  expect(getTotalRenderCount("ImageLoader")).toBe(1);
  expect(getMountCount("Tracks")).toBe(0);
  expect(getTotalRenderCount("Tracks")).toBe(1);
  expect(getMountCount("Player")).toBe(0);
  expect(getTotalRenderCount("Player")).toBe(1);
  expect(getMountCount("Properties")).toBe(0);
  expect(getTotalRenderCount("Properties")).toBe(1);
  expect(getMountCount("NumberInput")).toBe(0);
  expect(getTotalRenderCount("NumberInput")).toBe(4);
});
