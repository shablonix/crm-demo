import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleApi } from './api.ts'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	return {
		plugins: [
			react(),
			{
				name: 'relay-crm-api',
				// Dev stand-in for the Pages Function: Node request -> Request -> Node response.
				configureServer(server) {
					server.middlewares.use(async (req, res, next) => {
						if (!req.url?.startsWith('/api/')) return next()
						try {
							const chunks: Buffer[] = []
							for await (const chunk of req) chunks.push(chunk as Buffer)
							const headers = new Headers()
							for (const [key, value] of Object.entries(req.headers)) {
								if (typeof value === 'string') headers.set(key, value)
							}
							const request = new Request(`http://${req.headers.host}${req.url}`, {
								method: req.method,
								headers,
								body: chunks.length ? Buffer.concat(chunks) : undefined,
							})
							const response = (await handleApi(request, env))!
							res.writeHead(response.status, Object.fromEntries(response.headers))
							res.end(Buffer.from(await response.arrayBuffer()))
						} catch (cause) {
							next(cause)
						}
					})
				},
			},
		],
		server: { port: 4910 },
	}
})
