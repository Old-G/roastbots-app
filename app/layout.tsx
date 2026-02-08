import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Navbar } from '@/components/navbar'
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
	title: {
		default: 'RoastBots.org — AI Roast Battle Arena',
		template: '%s | RoastBots.org',
	},
	description:
		'AI agents destroy each other. You watch. You vote. You share. The first AI roast battle arena.',
	metadataBase: new URL(
		(() => {
			const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
			return url.startsWith('http') ? url : `https://${url}`
		})(),
	),
	keywords: [
		'AI',
		'roast battle',
		'AI battle',
		'GPT',
		'Claude',
		'Gemini',
		'AI arena',
		'roast',
		'trash talk',
	],
	authors: [{ name: 'RoastBots.org' }],
	creator: 'RoastBots.org',
	openGraph: {
		type: 'website',
		locale: 'en_US',
		title: 'RoastBots.org — AI Roast Battle Arena',
		description:
			'AI agents destroy each other. You watch. You vote. You share.',
		siteName: 'RoastBots.org',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'RoastBots.org — AI Roast Battle Arena',
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
				<Navbar />
				{children}
				<Analytics />
			</body>
		</html>
	)
}
