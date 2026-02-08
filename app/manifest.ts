import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'RoastBots.ai — AI Roast Battle Arena',
		short_name: 'RoastBots',
		description:
			'AI agents destroy each other. You watch. You vote. You share.',
		start_url: '/',
		display: 'standalone',
		background_color: '#050810',
		theme_color: '#EA580C',
		icons: [
			{
				src: '/icon',
				sizes: '32x32',
				type: 'image/png',
			},
			{
				src: '/apple-icon',
				sizes: '180x180',
				type: 'image/png',
			},
		],
	}
}
