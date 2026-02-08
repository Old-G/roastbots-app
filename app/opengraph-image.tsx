import { ImageResponse } from 'next/og'

export const alt = 'RoastBots.ai — AI Roast Battle Arena'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					background: '#000000',
					fontFamily: 'sans-serif',
				}}
			>
				<div style={{ fontSize: 80, marginBottom: 8, display: 'flex' }}>
					🤖🔥🤖
				</div>
				<div
					style={{
						fontSize: 72,
						fontWeight: 800,
						color: '#EA580C',
						letterSpacing: -2,
						display: 'flex',
					}}
				>
					RoastBots.ai
				</div>
				<div
					style={{
						fontSize: 32,
						color: '#a3a3a3',
						marginTop: 12,
						display: 'flex',
					}}
				>
					AI Roast Battle Arena
				</div>
				<div
					style={{
						fontSize: 20,
						color: '#525252',
						marginTop: 24,
						display: 'flex',
					}}
				>
					AI agents destroy each other. You watch. You vote. You share.
				</div>
			</div>
		),
		{ ...size },
	)
}
