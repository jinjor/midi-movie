import { vi, expect, test, afterEach } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";
import { getMountCount, getTotalRenderCount, resetCount } from "../counter";
import userEvent from "@testing-library/user-event";
import { renderInNewContainer } from "@/test/util";
import { Root } from "./Root";
import * as midi from "@/model/midi";

afterEach(() => {
  resetCount();
});
test("should show App", () => {
  renderInNewContainer(<Root />);
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
  const container = renderInNewContainer(<Root />);
  const playButton = container.getByText(/Min Note/i);
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
  const container = renderInNewContainer(<Root />);
  const input = container.getByLabelText(/Min Note/i);
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
  const container = renderInNewContainer(<Root />);
  const input = container.getByLabelText(/Max Note/i);
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
  const container = renderInNewContainer(<Root />);
  resetCount();
  const input = container.getByLabelText(/Midi Offset/i);
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
  const container = renderInNewContainer(<Root />);
  resetCount();
  const input = container.getByLabelText(/Audio Offset/i);
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
  const container = renderInNewContainer(<Root />);
  resetCount();
  const input = container.getByLabelText(/MIDI:/i);
  const file = new File([""], "1.midi", {
    type: "audio/midi",
  });
  fireEvent.change(input, {
    target: {
      files: [file],
    },
  });
  const dummyMidiData = {
    tracks: [],
    notes: [],
    events: [],
  };
  vi.spyOn(midi, "parseMidiData").mockImplementationOnce(() => dummyMidiData);
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));
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
  const container = renderInNewContainer(<Root />);
  resetCount();
  const input = container.getByLabelText(/Image:/i);
  fireEvent.change(input, {
    target: {
      files: [file],
    },
  });
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));
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

  const container = renderInNewContainer(<Root />);
  resetCount();
  const input = container.getByLabelText(/Audio:/i);
  const file = new File([""], "test.wav", {
    type: "audio/wav",
  });
  fireEvent.change(input, {
    target: {
      files: [file],
    },
  });
  await waitFor(() => new Promise((resolve) => setTimeout(resolve, 100)));
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
