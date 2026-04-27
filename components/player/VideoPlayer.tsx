"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { updateWatchProgress, markLessonComplete } from "@/lib/actions/progress"

const PROGRESS_THROTTLE_MS = 5000
const COMPLETE_THRESHOLD = 0.9
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

interface VideoPlayerProps {
  src: string
  poster?: string | null
  lessonId: string
  initialWatchedSeconds?: number
  alreadyComplete?: boolean
  onComplete?: () => void
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function VideoPlayer({
  src,
  poster,
  lessonId,
  initialWatchedSeconds = 0,
  alreadyComplete = false,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastProgressSentAt = useRef<number>(0)
  const completionFiredRef = useRef<boolean>(alreadyComplete)

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(initialWatchedSeconds)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Restore playback position once metadata is loaded
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    function handleLoadedMetadata() {
      if (!video) return
      setDuration(video.duration)
      if (initialWatchedSeconds > 0 && initialWatchedSeconds < video.duration) {
        video.currentTime = initialWatchedSeconds
      }
    }
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    return () => video.removeEventListener("loadedmetadata", handleLoadedMetadata)
  }, [initialWatchedSeconds])

  // Fullscreen state sync
  useEffect(() => {
    function handleFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener("fullscreenchange", handleFsChange)
    return () => document.removeEventListener("fullscreenchange", handleFsChange)
  }, [])

  const fireComplete = useCallback(async () => {
    if (completionFiredRef.current) return
    completionFiredRef.current = true
    const result = await markLessonComplete({ lessonId })
    if (result.success) {
      onComplete?.()
    } else {
      completionFiredRef.current = false
    }
  }, [lessonId, onComplete])

  const sendProgress = useCallback(
    async (seconds: number) => {
      const watched = Math.max(0, Math.floor(seconds))
      await updateWatchProgress({ lessonId, watchedSeconds: watched })
    },
    [lessonId]
  )

  function handleTimeUpdate() {
    const video = videoRef.current
    if (!video) return
    const now = Date.now()
    setCurrentTime(video.currentTime)

    if (now - lastProgressSentAt.current >= PROGRESS_THROTTLE_MS) {
      lastProgressSentAt.current = now
      void sendProgress(video.currentTime)
    }

    if (
      video.duration > 0 &&
      video.currentTime / video.duration >= COMPLETE_THRESHOLD &&
      !completionFiredRef.current
    ) {
      void fireComplete()
    }
  }

  function handlePlay() {
    setIsPlaying(true)
  }

  function handlePause() {
    setIsPlaying(false)
    const video = videoRef.current
    if (video) void sendProgress(video.currentTime)
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current
    if (!video) return
    const next = Number(e.target.value)
    video.currentTime = next
    setCurrentTime(next)
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current
    if (!video) return
    const next = Number(e.target.value)
    video.volume = next
    video.muted = next === 0
    setVolume(next)
    setMuted(next === 0)
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  function cycleRate() {
    const idx = PLAYBACK_RATES.indexOf(rate as (typeof PLAYBACK_RATES)[number])
    const next = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length]
    const video = videoRef.current
    if (video) video.playbackRate = next
    setRate(next)
  }

  function toggleFullscreen() {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) void el.requestFullscreen()
    else void document.exitFullscreen()
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black group/player"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        preload="metadata"
        className="w-full h-full"
        onClick={togglePlay}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => void fireComplete()}
      />

      {/* Big center play button when paused */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 flex items-center justify-center pointer-events-auto"
        >
          <span className="w-20 h-20 bg-primary/30 backdrop-blur-sm border-2 border-primary rounded-full flex items-center justify-center text-primary group-hover/player:scale-110 transition-transform">
            <span className="material-symbols-outlined !text-5xl">play_arrow</span>
          </span>
        </button>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          aria-label="Seek"
          className="w-full accent-primary cursor-pointer"
        />

        <div className="flex items-center gap-3 mt-2 text-on-primary">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined !text-2xl">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>

          <span className="text-xs font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined !text-xl">
                {muted || volume === 0 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up"}
              </span>
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={handleVolume}
              aria-label="Volume"
              className="w-20 accent-primary cursor-pointer hidden sm:block"
            />

            <button
              type="button"
              onClick={cycleRate}
              aria-label="Playback speed"
              className="px-2 py-0.5 border border-white/30 rounded text-xs font-bold hover:border-primary hover:text-primary transition-colors"
            >
              {rate}x
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined !text-xl">
                {isFullscreen ? "fullscreen_exit" : "fullscreen"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
