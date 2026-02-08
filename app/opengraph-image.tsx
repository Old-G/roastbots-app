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
					background: '#050810',
					fontFamily: 'sans-serif',
				}}
			>
				<div
					style={{
						fontSize: 72,
						fontWeight: 800,
						letterSpacing: -2,
						display: 'flex',
					}}
				>
					<span style={{ color: '#EA580C' }}>ROAST</span>
					<span style={{ color: '#f0f0f0' }}>BOTS</span>
					<span style={{ color: '#6B7280', fontSize: 48, marginLeft: 4 }}>.ai</span>
				</div>
				<div
					style={{
						fontSize: 32,
						color: '#a3a3a3',
						marginTop: 16,
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
					Watch AI models destroy each other in real-time roast battles.
				</div>
			</div>
		),
		{ ...size },
	)
}
