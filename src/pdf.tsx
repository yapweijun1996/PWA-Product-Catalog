import { Document, Font, Image, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import fontUrl from '@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff';
import { formatMoney } from './domain';
import type { CompanySettings, QuoteDraft } from './types';

Font.register({ family: 'Noto Sans SC', src: fontUrl });

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: 'Noto Sans SC', fontSize: 9, color: '#243b53' },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: 2, borderBottomColor: '#102a43', paddingBottom: 16, marginBottom: 20 },
  logo: { width: 52, height: 52, objectFit: 'contain' },
  company: { fontSize: 16, color: '#102a43', marginBottom: 4 },
  title: { fontSize: 22, color: '#102a43', textAlign: 'right' },
  meta: { textAlign: 'right', color: '#627d98', marginTop: 4 },
  recipient: { marginBottom: 18, padding: 12, backgroundColor: '#f0f4f8' },
  label: { fontSize: 8, color: '#627d98', textTransform: 'uppercase', marginBottom: 4 },
  table: { borderTop: 1, borderTopColor: '#9fb3c8' },
  tableRow: { flexDirection: 'row', borderBottom: 1, borderBottomColor: '#d9e2ec', paddingVertical: 8, alignItems: 'center' },
  tableHeader: { backgroundColor: '#e8f1f8', color: '#102a43', fontSize: 8 },
  product: { width: '45%', paddingRight: 8 },
  qty: { width: '12%', textAlign: 'right' },
  unit: { width: '12%', textAlign: 'right' },
  line: { width: '16%', textAlign: 'right' },
  tax: { width: '15%', textAlign: 'right' },
  totals: { marginTop: 16, marginLeft: '55%', borderTop: 1, borderTopColor: '#9fb3c8', paddingTop: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  grand: { borderTop: 2, borderTopColor: '#102a43', marginTop: 5, paddingTop: 7, fontSize: 13, color: '#102a43' },
  notes: { marginTop: 22, paddingTop: 10, borderTop: 1, borderTopColor: '#d9e2ec' },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, color: '#829ab1', fontSize: 8 },
});

type PdfLabels = {
  customer: string; notes: string; validUntil: string; subtotal: string; discount: string; tax: string; total: string;
  sku: string; unit: string; price: string; product: string; quantity: string; amount: string; quotation: string;
  generatedLocally: string; companyFallback: string;
};

function QuoteDocument({ quote, settings, labels }: { quote: QuoteDraft; settings: CompanySettings; labels: PdfLabels }) {
  return <Document title={quote.quoteNumber} author={settings.companyName}>
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header} fixed>
        <View>{settings.logoDataUrl ? <Image style={styles.logo} src={settings.logoDataUrl} /> : null}<Text style={styles.company}>{settings.companyName || labels.companyFallback}</Text><Text>{settings.address}</Text><Text>{settings.contact}</Text></View>
        <View><Text style={styles.title}>{labels.quotation}</Text><Text style={styles.meta}>{quote.quoteNumber}</Text><Text style={styles.meta}>{quote.issueDate}</Text></View>
      </View>
      <View style={styles.recipient}><Text style={styles.label}>{labels.customer}</Text><Text>{quote.customer || '—'}</Text><Text>{labels.validUntil}: {quote.validUntil || '—'}</Text></View>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}><Text style={styles.product}>{labels.sku} / {labels.product}</Text><Text style={styles.qty}>{labels.quantity}</Text><Text style={styles.unit}>{labels.unit}</Text><Text style={styles.line}>{labels.price}</Text><Text style={styles.tax}>{labels.amount}</Text></View>
        {quote.lines.map((line) => <View style={styles.tableRow} key={line.id} wrap={false}><Text style={styles.product}>{line.skuSnapshot} · {line.nameSnapshot}</Text><Text style={styles.qty}>{line.quantity}</Text><Text style={styles.unit}>{line.unitSnapshot}</Text><Text style={styles.line}>{formatMoney(line.unitPriceMinorSnapshot, quote.currency)}</Text><Text style={styles.tax}>{formatMoney(line.lineTotalMinor, quote.currency)}</Text></View>)}
      </View>
      <View style={styles.totals}><View style={styles.totalRow}><Text>{labels.subtotal}</Text><Text>{formatMoney(quote.totals.subtotalMinor, quote.currency)}</Text></View><View style={styles.totalRow}><Text>{labels.discount}</Text><Text>− {formatMoney(quote.totals.discountMinor, quote.currency)}</Text></View><View style={styles.totalRow}><Text>{labels.tax}</Text><Text>{formatMoney(quote.totals.taxMinor, quote.currency)}</Text></View><View style={[styles.totalRow, styles.grand]}><Text>{labels.total}</Text><Text>{formatMoney(quote.totals.totalMinor, quote.currency)}</Text></View></View>
      {quote.notes ? <View style={styles.notes}><Text style={styles.label}>{labels.notes}</Text><Text>{quote.notes}</Text></View> : null}
      <Text style={styles.footer} fixed>{labels.generatedLocally} · {settings.companyName}</Text>
    </Page>
  </Document>;
}

export async function createQuotePdf(quote: QuoteDraft, settings: CompanySettings, labels: PdfLabels): Promise<Blob> {
  return pdf(<QuoteDocument quote={quote} settings={settings} labels={labels} />).toBlob();
}

export async function downloadQuotePdf(quote: QuoteDraft, settings: CompanySettings, labels: PdfLabels): Promise<void> {
  const blob = await createQuotePdf(quote, settings, labels);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${quote.quoteNumber}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function shareQuotePdf(quote: QuoteDraft, settings: CompanySettings, labels: PdfLabels): Promise<boolean> {
  if (!navigator.share || !navigator.canShare) return false;
  const blob = await createQuotePdf(quote, settings, labels);
  const file = new File([blob], `${quote.quoteNumber}.pdf`, { type: 'application/pdf' });
  if (!navigator.canShare({ files: [file] })) return false;
  await navigator.share({ title: quote.quoteNumber, text: settings.companyName, files: [file] });
  return true;
}
