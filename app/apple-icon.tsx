import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '32px',
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 900,
            color: '#000000',
            marginTop: '8px',
          }}
        >
          M
        </div>
      </div>
    ),
    { ...size }
  );
}
