import { useEffect, useRef, useState } from 'react'
import { mountPdfEditor, type EmbedHandle } from '@shablonix/embed'
import { INVOICES, customerById, invoiceTemplateData } from './crm-data'

type Template = { id: string; name: string; description?: string | null; engine?: string }

async function api<T>(path: string, body?: unknown): Promise<T> {
	const response = await fetch(path, body === undefined ? undefined : {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})
	const json = await response.json().catch(() => ({}))
	if (!response.ok) throw new Error(json.message || `Request failed (${response.status})`)
	return json as T
}

export function TemplatesPage() {
	const [templates, setTemplates] = useState<Template[] | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [open, setOpen] = useState<Template | null>(null)

	useEffect(() => {
		api<{ templates: Template[] }>('/api/templates')
			.then((result) => setTemplates(result.templates))
			.catch((cause: Error) => setError(cause.message))
	}, [])

	if (open) return <TemplateEditor template={open} onClose={() => setOpen(null)} />

	return (
		<>
			<header className="page-header">
				<h1>Templates</h1>
			</header>
			<p className="lede">
				Documents Relay sends to your customers. Open one to change its design. Saved changes apply to
				every invoice straight away.
			</p>
			{error && <p className="alert" role="alert">{error}</p>}
			{!templates && !error && <p className="muted">Loading templates…</p>}
			{templates?.length === 0 && <p className="muted">This account has no templates yet.</p>}
			<ul className="template-grid">
				{templates?.map((template) => (
					<li key={template.id}>
						<button type="button" className="template-card" onClick={() => setOpen(template)}>
							<span className="template-thumb" aria-hidden="true">
								<span /><span /><span /><span />
							</span>
							<strong>{template.name}</strong>
							<span className="muted">{template.description || 'PDF document'}</span>
							<span className="link">Edit template →</span>
						</button>
					</li>
				))}
			</ul>
		</>
	)
}

function TemplateEditor({ template, onClose }: { template: Template; onClose: () => void }) {
	const frame = useRef<HTMLDivElement>(null)
	const editor = useRef<EmbedHandle | null>(null)
	const dialog = useRef<HTMLDialogElement>(null)
	const previewAfterSave = useRef(false)
	const errorAt = useRef(0)
	const [invoiceId, setInvoiceId] = useState(INVOICES[0]!.id)
	const invoiceRef = useRef(invoiceId)
	const [ready, setReady] = useState(false)
	const [busy, setBusy] = useState(false)
	const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)
	const [pdfUrl, setPdfUrl] = useState<string | null>(null)

	const sampleFor = (id: string) => invoiceTemplateData(INVOICES.find((invoice) => invoice.id === id)!)

	useEffect(() => {
		let cancelled = false
		// Sessions are single-use: mint a fresh one every time the editor opens.
		api<{ url: string }>('/api/session', { templateId: template.id })
			.then((session) => {
				if (cancelled || !frame.current) return
				editor.current = mountPdfEditor(frame.current, {
					src: session.url,
					theme: 'light',
					minHeight: 640,
					title: `${template.name} editor`,
					onReady: () => {
						setReady(true)
						editor.current?.load({ sampleData: sampleFor(invoiceRef.current) })
					},
					onSave: () => {
						setBusy(false)
						// A failed save posts `error` and then `save` back to back; keep the error.
						if (performance.now() - errorAt.current < 1000) return
						setMessage({ text: 'Saved. All invoices now use this design.' })
						if (previewAfterSave.current) {
							previewAfterSave.current = false
							setPdfUrl(`/api/invoices/${invoiceRef.current}/pdf?templateId=${template.id}&v=${Date.now()}`)
						}
					},
					onError: (payload) => {
						errorAt.current = performance.now()
						previewAfterSave.current = false
						setBusy(false)
						setMessage({ text: payload.message, error: true })
					},
				})
			})
			.catch((cause: Error) => setMessage({ text: cause.message, error: true }))
		return () => {
			cancelled = true
			editor.current?.destroy()
			editor.current = null
		}
	}, [template.id, template.name])

	useEffect(() => {
		if (pdfUrl) dialog.current?.showModal()
	}, [pdfUrl])

	function pickInvoice(id: string) {
		setInvoiceId(id)
		invoiceRef.current = id
		editor.current?.load({ sampleData: sampleFor(id) })
	}

	function save(preview: boolean) {
		previewAfterSave.current = preview
		setBusy(true)
		setMessage({ text: preview ? 'Saving, then rendering the PDF…' : 'Saving…' })
		editor.current?.save()
	}

	return (
		<div className="editor-page">
			<header className="editor-toolbar">
				<button type="button" className="button ghost" onClick={onClose}>← Templates</button>
				<h1>{template.name}</h1>
				<label className="field">
					Preview with
					<select value={invoiceId} onChange={(event) => pickInvoice(event.target.value)}>
						{INVOICES.map((invoice) => (
							<option key={invoice.id} value={invoice.id}>
								{invoice.id} · {customerById(invoice.customerId).company}
							</option>
						))}
					</select>
				</label>
				<button type="button" className="button ghost" disabled={!ready || busy} onClick={() => save(false)}>Save</button>
				<button type="button" className="button" disabled={!ready || busy} onClick={() => save(true)}>Save &amp; preview PDF</button>
			</header>
			<p className={`editor-status ${message?.error ? 'is-error' : ''}`} role={message?.error ? 'alert' : 'status'}>
				{message?.text ?? (ready ? 'Click any text on the invoice to edit it. Fields in braces fill from the selected CRM invoice.' : 'Opening the editor…')}
			</p>
			<div className="editor-frame" ref={frame} />

			<dialog ref={dialog} className="pdf-dialog" onClose={() => setPdfUrl(null)} aria-label="PDF preview">
				<form method="dialog" className="pdf-dialog-bar">
					<strong>{invoiceId}.pdf</strong>
					{pdfUrl && <a className="link" href={pdfUrl} target="_blank" rel="noreferrer">Open in new tab</a>}
					<button type="submit" className="button ghost">Close</button>
				</form>
				{pdfUrl && <iframe title={`${invoiceId} PDF`} src={pdfUrl} />}
			</dialog>
		</div>
	)
}
