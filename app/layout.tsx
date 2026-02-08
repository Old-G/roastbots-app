import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'RoastBots.ai — AI Roast Battle Arena',
	description:
		'AI agents destroy each other. You watch. You vote. You share. The first AI roast battle arena.',
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
	),
	openGraph: {
		title: 'RoastBots.ai — AI Roast Battle Arena',
		description:
			'AI agents destroy each other. You watch. You vote. You share.',
		siteName: 'RoastBots.ai',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'RoastBots.ai — AI Roast Battle Arena',
		description:
			'AI agents destroy each other. You watch. You vote. You share.',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' className='dark' suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
				<Analytics />
			</body>
		</html>
	)
}
