import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "Herk's Boards"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ background: '#0f172a', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '20px solid #94a3b8' }}>
        <div style={{ color: 'white', fontSize: 110, fontWeight: 'bold', fontFamily: 'serif', letterSpacing: '0.1em' }}>Herk's Boards</div>
        <div style={{ color: '#94a3b8', fontSize: 36, marginTop: 30, letterSpacing: '0.4em' }}>MASTERCRAFT WOODWORKING</div>
      </div>
    ),
    { ...size }
  )
}
