import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  IoVolumeLowSharp as LowVolume,
  IoVolumeHighSharp as HighVolume,
  IoVolumeMediumSharp as MediumVolume,
  IoVolumeMuteSharp as Muted,
} from "react-icons/io5";
import ShouldRender from "./ShouldRender";

type Props = {
  audioRef: React.RefObject<HTMLAudioElement>;
  src?: string;
  playingState: [boolean, Dispatch<SetStateAction<boolean>>];
};

const formatTime = (time: number) => {
  if (time && !isNaN(time)) {
    const minutes = Math.floor(time / 60);
    const formatMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const seconds = Math.floor(time % 60);
    const formatSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${formatMinutes}:${formatSeconds}`;
  }
  return "00:00";
};

const volumeIconProps = {
  size: 22,
  className: "text-neutral-700 dark:text-white",
};

const AudioPlayer: React.FC<Props> = ({ audioRef, src, playingState }) => {
  const [isPlaying, setIsPlaying] = playingState;
  const progressBarRef = useRef<HTMLInputElement>(null);
  const playAnimationRef = useRef<number>(0);
  const [timeProgress, setTimeProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(60);

  const lowVolume = volume > 0 && volume < 30;
  const mediumVolume = volume >= 30 && volume <= 60;
  const highVolume = volume > 60;

  const clickVolumeButton = useCallback(() => {
    const alreadyMuted = volume === 0;
    if (alreadyMuted) setVolume(50);

    if (!alreadyMuted) setVolume(0);
  }, [volume]);

  const repeat = useCallback(() => {
    if (audioRef?.current && progressBarRef?.current) {
      const currentTime = audioRef.current.currentTime;
      setTimeProgress(currentTime);

      progressBarRef.current.value = String(currentTime);
    }

    playAnimationRef.current = requestAnimationFrame(repeat);
  }, [audioRef, progressBarRef]);

  const handleProgressChange = () => {
    if (audioRef?.current && progressBarRef?.current) {
      audioRef.current.currentTime = Number(progressBarRef.current.value);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef?.current && progressBarRef?.current) {
      const seconds = audioRef.current.duration;
      setDuration(seconds);
      progressBarRef.current.max = String(seconds);
    }
  };

  const handleAudioOver = () => setIsPlaying(false);

  useEffect(() => {
    if (audioRef?.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }

      playAnimationRef.current = requestAnimationFrame(repeat);
    }
  }, [isPlaying, audioRef, repeat]);

  useEffect(() => {
    if (audioRef?.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume, audioRef]);

  return (
    <div className="w-full">
      <audio
        ref={audioRef}
        hidden
        src={src}
        onEnded={handleAudioOver}
        onLoadedMetadata={onLoadedMetadata}
      />
      <div className="w-full">
        <input
          type="range"
          ref={progressBarRef}
          defaultValue="0"
          onChange={handleProgressChange}
          className={`h-1 w-full accent-emerald-600`}
        />
      </div>

      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {formatTime(timeProgress)}
          </p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {formatTime(duration)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-pointer"
            title="Mute audio"
            aria-label="Mute audio"
            onClick={clickVolumeButton}
          >
            <ShouldRender if={volume === 0}>
              <Muted {...volumeIconProps} />
            </ShouldRender>
            <ShouldRender if={lowVolume}>
              <LowVolume {...volumeIconProps} />
            </ShouldRender>
            <ShouldRender if={mediumVolume}>
              <MediumVolume {...volumeIconProps} />
            </ShouldRender>
            <ShouldRender if={highVolume}>
              <HighVolume {...volumeIconProps} />
            </ShouldRender>
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            className="h-1 accent-emerald-600"
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
