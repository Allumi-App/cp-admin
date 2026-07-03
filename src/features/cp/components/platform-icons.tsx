// Brand marks mirrored from the CP marketing site (allumi-section / show-section)
// so the dashboard shows the same SVGs the website renders.

function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className={className}>
      <path
        d="M16.5 1.5c.1 1-.3 2-1 2.8-.7.8-1.8 1.4-2.8 1.3-.1-1 .4-2 1-2.7.7-.8 1.9-1.3 2.8-1.4zM19 17c-.5 1.1-.7 1.6-1.3 2.6-.9 1.4-2.1 3.1-3.6 3.1-1.3 0-1.7-.9-3.5-.8-1.8 0-2.2.8-3.5.8-1.5 0-2.7-1.6-3.6-3C1 16.5.7 12.2 2.3 9.9c1-1.6 2.7-2.6 4.3-2.6 1.6 0 2.6.9 3.9.9 1.3 0 2-.9 3.9-.9 1.4 0 2.9.8 3.9 2.1-3.4 1.9-2.9 6.8.8 7.6z"
        fill="currentColor"
      />
    </svg>
  )
}

function GooglePlayGlyph() {
  return (
    <svg width="18" height="20" viewBox="0 0 22 24">
      <path d="M2 2.5v19l11-9.5z" fill="#C49C40" />
      <path d="M2 2.5l11 9.5 4.5-3.9z" fill="#F4C3C6" />
      <path d="M2 21.5l11-9.5 4.5 3.9z" fill="#C87B82" />
      <path d="M17.5 8.1l3 2c.9.6.9 1.8 0 2.4l-3 2L13 12z" fill="#E5D5CD" />
    </svg>
  )
}

function SpotifyGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#1ED760" />
      <path
        d="M17.5 10.8c-3-1.8-8-2-10.8-1.1a.9.9 0 11-.5-1.7c3.3-1 8.7-.8 12.2 1.3a.9.9 0 11-.9 1.5zm-.1 2.6a.75.75 0 01-1 .25c-2.5-1.5-6.3-2-9.2-1.1a.75.75 0 11-.45-1.4c3.4-1 7.6-.5 10.4 1.3.35.2.45.7.25 1zm-1.1 2.5a.6.6 0 01-.8.2c-2.2-1.3-5-1.6-8.2-.9a.6.6 0 11-.27-1.17c3.6-.8 6.6-.45 9.1 1a.6.6 0 01.17.87z"
        fill="#2C1810"
      />
    </svg>
  )
}

function ApplePodcastsGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#C49C40" />
      <path
        d="M12 5.5a5 5 0 015 5c0 2-1 3.4-2 4.4-.3.3-.6.7-.6 1.1l-.1.8c-.1.6-.6 1-1.2 1h-2.2c-.6 0-1.1-.4-1.2-1l-.1-.8c0-.4-.3-.8-.6-1.1-1-1-2-2.4-2-4.4a5 5 0 015-5z"
        fill="#2C1810"
      />
      <circle cx="12" cy="10.5" r="2.2" fill="#C49C40" />
    </svg>
  )
}

function YoutubeGlyph() {
  return (
    <svg width="22" height="20" viewBox="0 0 24 22">
      <rect x="1" y="3" width="22" height="16" rx="5" fill="#FF0000" />
      <path d="M10 7l6 4-6 4z" fill="#FDF2F0" />
    </svg>
  )
}

function Tile({ dark, children }: { dark?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
        dark ? 'bg-[#2C1810] text-[#FDF2F0]' : 'bg-secondary'
      }`}
    >
      {children}
    </div>
  )
}

/** App Store / Google Play badge, mirroring the dark store buttons on the CP site. */
export function CpStoreIcon({ platform }: { platform: string | null }) {
  return <Tile dark>{platform === 'android' ? <GooglePlayGlyph /> : <AppleGlyph />}</Tile>
}

/** The Show platform mark (Spotify / Apple Podcasts / YouTube). */
export function CpShowIcon({ platform }: { platform: string | null }) {
  const p = (platform ?? '').toLowerCase()
  const glyph = p.includes('spotify') ? (
    <SpotifyGlyph />
  ) : p.includes('apple') ? (
    <ApplePodcastsGlyph />
  ) : p.includes('you') ? (
    <YoutubeGlyph />
  ) : null
  return <Tile>{glyph}</Tile>
}
