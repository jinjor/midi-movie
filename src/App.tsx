import { useRef, useState } from "react";
import "./App.css";

import { Tracks } from "./Tracks";
import { Image, ImageLoader } from "./ImageLoader";
import { MidiData, Mutables, Note, Track } from "./model";
import { AudioLoader } from "./AudioLoader";
import { MidiLoader } from "./MidiLoader";
import { Properties } from "./Properties";
import { Player } from "./Player";

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
  });
  const [tracks, setTracks] = useState<Track[]>([]);
  const [enabledTracks, setEnabledTracks] = useState<boolean[]>([]);

  const handleLoadMidi = ({ tracks, notes }: MidiData) => {
    setNotes(notes);
    setTracks(tracks);
    setEnabledTracks(new Array(tracks.length).fill(true));
  };
  const handleLoadImage = ({ imageUrl, size }: Image) => {
    setImageUrl(imageUrl);
    mutablesRef.current.size = size;
  };
  const handleLoadAudio = (audioBuffer: AudioBuffer) => {
    setAudioBuffer(audioBuffer);
  };
  const handleSelectTracks = (enabledTracks: boolean[]) => {
    setEnabledTracks(enabledTracks);
  };

  return (
    <div className="panes">
      <div className="pane resourcePane fields">
        <MidiLoader onLoad={handleLoadMidi} />
        <ImageLoader onLoad={handleLoadImage} />
        <AudioLoader onLoad={handleLoadAudio} />
      </div>
      <div className="pane trackPane">
        <Tracks
          tracks={tracks}
          enabledTracks={enabledTracks}
          onChange={handleSelectTracks}
        />
      </div>
      <div className="pane playerPane">
        <Player
          notes={notes}
          imageUrl={imageUrl}
          audioBuffer={audioBuffer}
          enabledTracks={enabledTracks}
          mutablesRef={mutablesRef}
        />
      </div>
      <div className="pane propertyPane fields">
        <Properties mutablesRef={mutablesRef} />
      </div>
    </div>
  );
};
