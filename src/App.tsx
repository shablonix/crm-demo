import { useEffect, useState, type ReactNode } from 'react'
import {
	CUSTOMERS,
	DEALS,
	INVOICES,
	customerById,
	formatDate,
	formatMoney,
	invoiceTotal,
	type DealStage,
	type InvoiceStatus,
} from './crm-data'
import { TemplatesPage } from './TemplatesPage'

const PAGES = {
	dashboard: { label: 'Dashboard', icon: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z' },
	customers: { label: 'Customers', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
	deals: { label: 'Deals', icon: 'M3 3v18h18M7 16l4-4 4 4 5-6' },
	invoices: { label: 'Invoices', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5' },
	templates: { label: 'Templates', icon: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z' },
} as const

type Page = keyof typeof PAGES

const pageFromHash = (): Page => {
	const hash = location.hash.slice(1)
	return hash in PAGES ? (hash as Page) : 'dashboard'
}

function Icon({ d }: { d: string }) {
	return (
		<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d={d} />
		</svg>
	)
}

export default function App() {
	const [page, setPage] = useState(pageFromHash)

	useEffect(() => {
		const sync = () => setPage(pageFromHash())
		window.addEventListener('hashchange', sync)
		return () => window.removeEventListener('hashchange', sync)
	}, [])

	return (
		<div className="app">
			<nav className="sidebar" aria-label="Main">
				<a className="logo" href="#dashboard">
					<span className="logo-mark" aria-hidden="true">R</span>
					Relay CRM
				</a>
				<ul>
					{(Object.keys(PAGES) as Page[]).map((key) => (
						<li key={key}>
							<a href={`#${key}`} aria-current={page === key ? 'page' : undefined}>
								<Icon d={PAGES[key].icon} />
								{PAGES[key].label}
								{key === 'templates' && <span className="nav-badge">Shablonix</span>}
							</a>
						</li>
					))}
				</ul>
				<a className="powered" href="https://shablonix.online" target="_blank" rel="noreferrer">
					Documents powered by <strong>Shablonix</strong>
				</a>
			</nav>

			<main className="main">
				<p className="demo-banner">
					Demo CRM with mock data. The <a href="#templates">Templates</a> tab runs the real Shablonix
					editor, embedded with <code>@shablonix/embed</code>.
				</p>
				{page === 'dashboard' && <Dashboard />}
				{page === 'customers' && <Customers />}
				{page === 'deals' && <Deals />}
				{page === 'invoices' && <Invoices />}
				{page === 'templates' && <TemplatesPage />}
			</main>
		</div>
	)
}

function Header({ title, children }: { title: string; children?: ReactNode }) {
	return (
		<header className="page-header">
			<h1>{title}</h1>
			{children}
		</header>
	)
}

function Status({ value }: { value: InvoiceStatus }) {
	return <span className={`status status-${value.toLowerCase()}`}>{value}</span>
}

function Dashboard() {
	const pipeline = DEALS.filter((deal) => deal.stage !== 'Won').reduce((sum, deal) => sum + deal.value, 0)
	const won = DEALS.filter((deal) => deal.stage === 'Won').reduce((sum, deal) => sum + deal.value, 0)
	const unpaid = INVOICES.filter((invoice) => invoice.status === 'Open' || invoice.status === 'Overdue')
	const overdue = INVOICES.filter((invoice) => invoice.status === 'Overdue')

	return (
		<>
			<Header title="Good morning, Elena" />
			<section className="kpis" aria-label="Key figures">
				<div className="kpi"><span>Open pipeline</span><strong>{formatMoney(pipeline)}</strong></div>
				<div className="kpi"><span>Won this quarter</span><strong>{formatMoney(won)}</strong></div>
				<div className="kpi"><span>Awaiting payment</span><strong>{formatMoney(unpaid.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0))}</strong></div>
				<div className="kpi"><span>Overdue invoices</span><strong className={overdue.length ? 'is-bad' : ''}>{overdue.length}</strong></div>
			</section>

			<section className="callout">
				<div>
					<h2>Your invoices, your design</h2>
					<p>
						Change the invoice layout, colours, or wording yourself. Every invoice in Relay uses the
						template the moment you save it.
					</p>
				</div>
				<a className="button" href="#templates">Edit invoice template</a>
			</section>

			<section className="card">
				<h2>Recent invoices</h2>
				<InvoiceTable rows={INVOICES.slice(0, 4)} />
			</section>
		</>
	)
}

function Customers() {
	return (
		<>
			<Header title="Customers" />
			<div className="card table-wrap">
				<table>
					<thead>
						<tr><th>Company</th><th>Contact</th><th>Email</th><th>City</th><th>Owner</th></tr>
					</thead>
					<tbody>
						{CUSTOMERS.map((customer) => (
							<tr key={customer.id}>
								<td className="strong">{customer.company}</td>
								<td>{customer.contact}</td>
								<td className="muted">{customer.email}</td>
								<td>{customer.city}</td>
								<td>{customer.owner}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	)
}

const STAGES: DealStage[] = ['Lead', 'Qualified', 'Proposal', 'Won']

function Deals() {
	return (
		<>
			<Header title="Deals" />
			<div className="board">
				{STAGES.map((stage) => {
					const deals = DEALS.filter((deal) => deal.stage === stage)
					return (
						<section key={stage} className="column" aria-label={stage}>
							<h2>{stage} <span>{deals.length}</span></h2>
							{deals.map((deal) => (
								<article key={deal.id} className="deal">
									<strong>{deal.title}</strong>
									<span className="muted">{customerById(deal.customerId).company}</span>
									<span className="deal-meta">
										<b>{formatMoney(deal.value)}</b>
										<span className="muted">{formatDate(deal.closeDate)}</span>
									</span>
								</article>
							))}
						</section>
					)
				})}
			</div>
		</>
	)
}

function Invoices() {
	return (
		<>
			<Header title="Invoices">
				<a className="button ghost" href="#templates">Edit invoice template</a>
			</Header>
			<div className="card table-wrap">
				<InvoiceTable rows={INVOICES} />
			</div>
			<p className="hint">
				PDFs are rendered on demand by Shablonix from the saved invoice template and this CRM&apos;s data.
			</p>
		</>
	)
}

function InvoiceTable({ rows }: { rows: typeof INVOICES }) {
	return (
		<table>
			<thead>
				<tr><th>Number</th><th>Customer</th><th>Issued</th><th>Due</th><th className="num">Amount</th><th>Status</th><th><span className="sr-only">PDF</span></th></tr>
			</thead>
			<tbody>
				{rows.map((invoice) => (
					<tr key={invoice.id}>
						<td className="strong">{invoice.id}</td>
						<td>{customerById(invoice.customerId).company}</td>
						<td>{formatDate(invoice.issueDate)}</td>
						<td>{formatDate(invoice.dueDate)}</td>
						<td className="num">{formatMoney(invoiceTotal(invoice))}</td>
						<td><Status value={invoice.status} /></td>
						<td className="num">
							<a className="link" href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">PDF</a>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}
