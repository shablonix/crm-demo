// The only server code a host needs: list templates, mint an editor session,
// render a PDF. The API key stays here; the browser only sees /api/*.
// Web-standard Request/Response, so it runs as a Cloudflare Pages Function
// (functions/api/[[path]].ts) and as Vite dev middleware (vite.config.ts).
import { Shablonix, ShablonixApiError } from '@shablonix/sdk'
import { INVOICES, invoiceTemplateData } from './src/crm-data.ts'

export type Env = {
	SHABLONIX_API_KEY?: string
	SHABLONIX_API_URL?: string
	SHABLONIX_INVOICE_TEMPLATE_ID?: string
	SHABLONIX_STARTER_ID?: string
	DEMO_ORIGIN?: string
}

const TEMPLATE_ID = /^[A-Za-z0-9_-]{1,64}$/

const json = (status: number, body: unknown) =>
	Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

/** Returns a response for /api/*, or null so the caller serves the app. */
export async function handleApi(request: Request, env: Env): Promise<Response | null> {
	const url = new URL(request.url)
	if (!url.pathname.startsWith('/api/')) return null

	const apiKey = env.SHABLONIX_API_KEY?.trim()
	if (!apiKey) return json(500, { message: 'Set SHABLONIX_API_KEY for the demo server' })
	const apiUrl = (env.SHABLONIX_API_URL || 'https://api.shablonix.online').replace(/\/$/, '')
	const shablonix = new Shablonix(apiKey, { baseUrl: apiUrl })

	try {
		// The SDK has no template list yet, so this one call is plain HTTP.
		if (request.method === 'GET' && url.pathname === '/api/templates') {
			const response = await fetch(`${apiUrl}/v1/templates?limit=50`, {
				headers: { Authorization: `Bearer ${apiKey}` },
			})
			const body = (await response.json()) as { data?: unknown[]; message?: string }
			return json(response.status, response.ok ? { templates: body.data ?? [] } : body)
		}

		if (request.method === 'POST' && url.pathname === '/api/session') {
			const { templateId } = (await request.json().catch(() => ({}))) as { templateId?: unknown }
			if (typeof templateId !== 'string' || !TEMPLATE_ID.test(templateId)) {
				return json(400, { message: 'templateId is required' })
			}
			// Lock the iframe to this page. Pin DEMO_ORIGIN in production.
			const origin = env.DEMO_ORIGIN || request.headers.get('origin')
			if (!origin) return json(400, { message: 'Set DEMO_ORIGIN to the public URL of this demo' })
			const session = await shablonix.createEmbedSession({ origin, templateId, userId: 'relay-crm-operator' })
			return json(201, { url: session.url, kind: session.kind })
		}

		// "Start fresh": put the shared invoice template back to its starter design.
		// Both ids come from server config, so visitors cannot reset anything else.
		if (request.method === 'POST' && url.pathname === '/api/reset') {
			const templateId = env.SHABLONIX_INVOICE_TEMPLATE_ID
			const starterId = env.SHABLONIX_STARTER_ID
			if (!templateId || !starterId) return json(500, { message: 'Set SHABLONIX_INVOICE_TEMPLATE_ID and SHABLONIX_STARTER_ID' })
			const response = await fetch(`${apiUrl}/v1/templates/${templateId}/reset`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({ starterId }),
			})
			if (!response.ok) {
				const body = (await response.json().catch(() => ({}))) as { message?: string }
				return json(response.status, { message: body.message || 'Reset failed' })
			}
			return json(200, { templateId })
		}

		const route = url.pathname.match(/^\/api\/invoices\/([A-Za-z0-9-]+)\/pdf$/)
		if (request.method === 'GET' && route) {
			const invoice = INVOICES.find((item) => item.id === route[1])
			const templateId = url.searchParams.get('templateId') || env.SHABLONIX_INVOICE_TEMPLATE_ID
			if (!invoice || !templateId || !TEMPLATE_ID.test(templateId)) {
				return json(404, { message: 'Unknown invoice or no invoice template configured' })
			}
			const pdf = await shablonix.generatePdfStream({ templateId, data: invoiceTemplateData(invoice) })
			return new Response(pdf.body, {
				headers: {
					'Content-Type': 'application/pdf',
					'Content-Disposition': `inline; filename="${invoice.id}.pdf"`,
					'Cache-Control': 'no-store',
				},
			})
		}

		return json(404, { message: 'Not found' })
	} catch (cause) {
		const status = cause instanceof ShablonixApiError ? cause.status : 500
		return json(status, { message: cause instanceof Error ? cause.message : 'Request failed' })
	}
}
