import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#0f0f12',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6c8eff',
          fontWeight: 700,
          fontFamily: 'sans-serif',
          borderRadius: 6,
        }}
      >
        a
      </div>
    ),
    { ...size },
  )
}
