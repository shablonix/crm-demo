// Mock CRM records. Shared by the browser (editor sample data) and the server
// (PDF generation), so the server never trusts invoice data from the page.

export type Customer = {
	id: string
	company: string
	contact: string
	email: string
	address: string
	city: string
	owner: string
}

export type DealStage = 'Lead' | 'Qualified' | 'Proposal' | 'Won'

export type Deal = {
	id: string
	customerId: string
	title: string
	value: number
	stage: DealStage
	closeDate: string
}

export type InvoiceStatus = 'Paid' | 'Open' | 'Overdue' | 'Draft'

export type Invoice = {
	id: string
	customerId: string
	issueDate: string
	dueDate: string
	purchaseOrder: string
	status: InvoiceStatus
	items: { description: string; quantity: number; unitPrice: number }[]
}

export const SELLER = {
	name: 'Fernhill Digital',
	tagline: 'Product design & engineering',
	email: 'billing@fernhill.example',
	phone: '+359 2 555 0190',
	website: 'fernhill.example',
	address: '21 Vitosha Boulevard, Sofia 1000, Bulgaria',
	vatNumber: 'BG207551834',
}

export const CUSTOMERS: Customer[] = [
	{ id: 'c1', company: 'Acme Manufacturing GmbH', contact: 'Maya Keller', email: 'maya@acme.example', address: '42 Innovation Park, 10115', city: 'Berlin', owner: 'Elena' },
	{ id: 'c2', company: 'Atlas Freight B.V.', contact: 'Joris de Vries', email: 'joris@atlasfreight.example', address: 'Waalhaven 18, 3089 JH', city: 'Rotterdam', owner: 'Nikolay' },
	{ id: 'c3', company: 'Bloom & Co.', contact: 'Inês Moreira', email: 'ines@bloomco.example', address: 'Rua Augusta 112, 1100-053', city: 'Lisbon', owner: 'Elena' },
	{ id: 'c4', company: 'Cobalt Health', contact: 'Lukas Bauer', email: 'lukas@cobalthealth.example', address: 'Mariahilfer Str. 77, 1060', city: 'Vienna', owner: 'Petya' },
	{ id: 'c5', company: 'Delta Foods S.p.A.', contact: 'Giulia Rossi', email: 'giulia@deltafoods.example', address: 'Via Tortona 31, 20144', city: 'Milan', owner: 'Nikolay' },
	{ id: 'c6', company: 'Seaview Hotels', contact: 'Pau Ferrer', email: 'pau@seaviewhotels.example', address: 'Passeig de Gràcia 55, 08007', city: 'Barcelona', owner: 'Petya' },
]

export const DEALS: Deal[] = [
	{ id: 'd1', customerId: 'c1', title: 'Customer portal redesign', value: 18400, stage: 'Won', closeDate: '2026-09-12' },
	{ id: 'd2', customerId: 'c2', title: 'Shipment tracking app', value: 32000, stage: 'Proposal', closeDate: '2026-10-20' },
	{ id: 'd3', customerId: 'c3', title: 'E-commerce migration', value: 12500, stage: 'Qualified', closeDate: '2026-11-04' },
	{ id: 'd4', customerId: 'c4', title: 'Patient booking flow', value: 26800, stage: 'Won', closeDate: '2026-09-02' },
	{ id: 'd5', customerId: 'c5', title: 'Supplier dashboard', value: 9600, stage: 'Lead', closeDate: '2026-12-01' },
	{ id: 'd6', customerId: 'c6', title: 'Loyalty programme MVP', value: 21000, stage: 'Proposal', closeDate: '2026-10-28' },
	{ id: 'd7', customerId: 'c1', title: 'Design system retainer', value: 7200, stage: 'Qualified', closeDate: '2026-11-15' },
]

export const INVOICES: Invoice[] = [
	{
		id: 'INV-2026-0418', customerId: 'c1', issueDate: '2026-09-15', dueDate: '2026-10-15', purchaseOrder: 'PO-7731', status: 'Open',
		items: [
			{ description: 'Customer portal — UX research sprint', quantity: 1, unitPrice: 4800 },
			{ description: 'Interface design, 12 screens', quantity: 12, unitPrice: 650 },
			{ description: 'Front-end implementation (days)', quantity: 8, unitPrice: 720 },
		],
	},
	{
		id: 'INV-2026-0412', customerId: 'c4', issueDate: '2026-09-03', dueDate: '2026-10-03', purchaseOrder: 'PO-1189', status: 'Paid',
		items: [
			{ description: 'Patient booking flow — discovery', quantity: 1, unitPrice: 3200 },
			{ description: 'Prototype & usability testing', quantity: 1, unitPrice: 5400 },
			{ description: 'Accessibility audit (WCAG 2.2 AA)', quantity: 1, unitPrice: 1900 },
		],
	},
	{
		id: 'INV-2026-0397', customerId: 'c2', issueDate: '2026-08-20', dueDate: '2026-09-19', purchaseOrder: 'PO-5520', status: 'Overdue',
		items: [
			{ description: 'Tracking app technical spike', quantity: 3, unitPrice: 720 },
			{ description: 'Cloud infrastructure setup', quantity: 1, unitPrice: 2400 },
		],
	},
	{
		id: 'INV-2026-0421', customerId: 'c6', issueDate: '2026-09-28', dueDate: '2026-10-28', purchaseOrder: 'PO-0042', status: 'Draft',
		items: [
			{ description: 'Loyalty programme workshop', quantity: 2, unitPrice: 1450 },
			{ description: 'Service blueprint & roadmap', quantity: 1, unitPrice: 3800 },
			{ description: 'Brand illustration set', quantity: 6, unitPrice: 280 },
			{ description: 'Project management (days)', quantity: 4, unitPrice: 540 },
		],
	},
	{
		id: 'INV-2026-0389', customerId: 'c3', issueDate: '2026-08-05', dueDate: '2026-09-04', purchaseOrder: 'PO-3307', status: 'Paid',
		items: [
			{ description: 'Storefront performance audit', quantity: 1, unitPrice: 2600 },
			{ description: 'Checkout redesign', quantity: 1, unitPrice: 4100 },
		],
	},
]

const VAT_RATE = 0.2
const money = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })
const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export const formatMoney = (value: number) => money.format(value)
export const formatDate = (iso: string) => longDate.format(new Date(`${iso}T00:00:00Z`))
export const customerById = (id: string) => CUSTOMERS.find((customer) => customer.id === id)!
export const invoiceSubtotal = (invoice: Invoice) =>
	invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
export const invoiceTotal = (invoice: Invoice) => invoiceSubtotal(invoice) * (1 + VAT_RATE)

/** Maps a CRM invoice onto the invoice template's bindings (company / customer / invoice / payment). */
export function invoiceTemplateData(invoice: Invoice): Record<string, unknown> {
	const customer = customerById(invoice.customerId)
	const subtotal = invoiceSubtotal(invoice)
	return {
		company: SELLER,
		customer: {
			name: customer.contact,
			company: customer.company,
			email: customer.email,
			address: `${customer.address} ${customer.city}`,
		},
		invoice: {
			number: invoice.id,
			issueDate: formatDate(invoice.issueDate),
			dueDate: formatDate(invoice.dueDate),
			purchaseOrder: invoice.purchaseOrder,
			currency: 'EUR',
			items: invoice.items.map((item) => ({
				description: item.description,
				quantity: String(item.quantity),
				unitPrice: formatMoney(item.unitPrice),
				total: formatMoney(item.quantity * item.unitPrice),
			})),
			subtotal: formatMoney(subtotal),
			taxLabel: 'VAT 20%',
			tax: formatMoney(subtotal * VAT_RATE),
			total: formatMoney(subtotal * (1 + VAT_RATE)),
			notes: `Thank you for working with ${SELLER.name}. Please quote ${invoice.id} with your payment.`,
		},
		payment: {
			bank: 'First Investment Bank',
			iban: 'BG18 FINV 9150 1017 3378 41',
			bic: 'FINVBGSF',
			reference: invoice.id,
		},
	}
}
