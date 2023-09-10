import { useRef, useState } from "react";
import styles from "./App.module.css";

import { Tracks } from "../Tracks";
import { ImageLoader } from "../ImageLoader";
import { Image, MidiData, Mutables, Note, Track } from "@/model/types";
import { AudioLoader } from "../AudioLoader";
import { MidiLoader } from "../MidiLoader";
import { Properties } from "../Properties";
import { Player } from "../Player";
import { cx } from "../../util";

export const App = () => {
  const [image, setImage] = useState<Image>({
    url: null,
    size: {
      width: 512,
      height: 512 * (9 / 16),
    },
  });
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const mutablesRef = useRef<Mutables>({
    minNote: 0,
    maxNote: 127,
    size: image.size,
    enabledTracks: new Set(),
  });
  const [tracks, setTracks] = useState<Track[]>([]);
  const [midiOffsetInSec, setMidiOffsetInSec] = useState(0);
  const [audioOffsetInSec, setAudioOffsetInSec] = useState(0);
  const handleLoadMidi = ({ tracks, notes }: MidiData) => {
    setNotes(notes);
    setTracks(tracks);
    mutablesRef.current.enabledTracks = new Set([
      ...Array(tracks.length).keys(),
    ]);
  };
  const handleLoadImage = (image: Image) => {
    setImage(image);
    mutablesRef.current.size = image.size;
  };
  const handleLoadAudio = (audioBuffer: AudioBuffer) => {
    setAudioBuffer(audioBuffer);
  };
  return (
    <div className={styles.panes}>
      <div className={cx(styles.pane, styles.resourcePane, styles.fields)}>
        <MidiLoader onLoad={handleLoadMidi} />
        <ImageLoader onLoad={handleLoadImage} />
        <AudioLoader onLoad={handleLoadAudio} />
      </div>
      <div className={cx(styles.pane, styles.trackPane)}>
        <Tracks tracks={tracks} mutablesRef={mutablesRef} />
      </div>
      <div className={cx(styles.pane, styles.playerPane)}>
        <Player
          notes={notes}
          image={image}
          audioBuffer={audioBuffer}
          mutablesRef={mutablesRef}
          midiOffsetInSec={midiOffsetInSec}
          audioOffsetInSec={audioOffsetInSec}
        />
      </div>
      <div className={cx(styles.pane, styles.propertyPane, styles.fields)}>
        <Properties
          midiOffsetInSec={midiOffsetInSec}
          onMidiOffsetChange={setMidiOffsetInSec}
          audioOffsetInSec={audioOffsetInSec}
          onAudioOffsetChange={setAudioOffsetInSec}
          mutablesRef={mutablesRef}
        />
      </div>
    </div>
  );
};
