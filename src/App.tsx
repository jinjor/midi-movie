import { useRef, useState } from "react";
import styles from "./App.module.css";

import { Tracks } from "./Tracks";
import { Image, ImageLoader } from "./ImageLoader";
import { MidiData, Mutables, Note, Track } from "./model";
import { AudioLoader } from "./AudioLoader";
import { MidiLoader } from "./MidiLoader";
import { Properties } from "./Properties";
import { Player } from "./Player";
import { cx } from "./util";

export const App = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const mutablesRef = useRef<Mutables>({
    minNote: 0,
    maxNote: 127,
    size: {
      width: 512,
      height: 512 * (9 / 16),
    },
    enabledTracks: new Set(),
  });
  const [tracks, setTracks] = useState<Track[]>([]);

  const handleLoadMidi = ({ tracks, notes }: MidiData) => {
    setNotes(notes);
    setTracks(tracks);
    mutablesRef.current.enabledTracks = new Set([
      ...Array(tracks.length).keys(),
    ]);
  };
  const handleLoadImage = ({ imageUrl, size }: Image) => {
    setImageUrl(imageUrl);
    mutablesRef.current.size = size;
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
          imageUrl={imageUrl}
          audioBuffer={audioBuffer}
          mutablesRef={mutablesRef}
        />
      </div>
      <div className={cx(styles.pane, styles.propertyPane, styles.fields)}>
        <Properties mutablesRef={mutablesRef} />
      </div>
    </div>
  );
};
