import { useCallback, useEffect, useMemo, useState } from 'react';
import { downloadBackup, restoreBackup } from './backup';
import { DEMO_PRODUCTS } from './demo';
import {
  getActiveCatalog,
  getSettings,
  listQuotes,
  loadDraft,
  loadQuote,
  deleteQuote,
  duplicateQuote,
  replaceCatalog,
  saveDraft,
  saveSettings,
  clearAllData,
  getActiveCatalogVersion,
} from './store';
import {
  calculateTotals,
  createEmptyQuote,
  getQuoteValidationErrors,
  createQuoteLine,
  formatMoney,
  getDefaultTaxRate,
  recalculateDraft,
  validatePercentage,
  validateQuantity,
} from './domain';
import { buildProducts, IMPORT_FIELDS, parseCatalogText, suggestMapping } from './importer';
import { Icon } from './icons';
import { registerPwa, type InstallAction, type UpdateInfo } from './pwa';
import type {
  CatalogVersion,
  CompanySettings,
  ImportField,
  ImportMapping,
  ParsedRows,
  Product,
  Quote,
  QuoteDraft,
} from './types';

const copy = {
  en: {
    catalog: 'Catalog', quotes: 'Quotes', settings: 'Settings', offline: 'Offline', online: 'Online', install: 'Install app',
    search: 'Search by product name or SKU', importTitle: 'Import a catalog', importHelp: 'CSV or JSON files. Nothing changes until validation passes.',
    chooseFile: 'Choose file', loadDemo: 'Load demo catalog', products: 'products', add: 'Add to quote', view: 'View',
    emptyTitle: 'Your catalog is empty', emptyHelp: 'Import a supplier catalog or load the demo data to begin.',
    noResults: 'No products match this search.', quote: 'Current quote', quoteEmpty: 'Your quote is empty', quoteEmptyHelp: 'Add products from the catalog to start a quote.',
    customer: 'Customer / recipient', notes: 'Notes and terms', validUntil: 'Valid until', discount: 'Quote discount %', subtotal: 'Subtotal', tax: 'Tax', total: 'Total',
    exportPdf: 'Export PDF', share: 'Share PDF', shareUnsupported: 'Sharing is unavailable; the PDF was downloaded.', remove: 'Remove', save: 'Saved locally', history: 'Quote history', open: 'Open', duplicate: 'Duplicate', delete: 'Delete', deleteConfirm: 'Delete this quote?',
    company: 'Company name', address: 'Address', contact: 'Contact', currency: 'Currency', defaultTax: 'Default tax %', language: 'Language',
    saveSettings: 'Save settings', backup: 'Download backup', restore: 'Restore backup', clear: 'Clear all local data', clearConfirm: 'Clear all local catalogs, quotes, and settings?',
    mapping: 'Column mapping', required: 'required', preview: 'Preview', commit: 'Commit catalog', mappingHelp: 'Map the required fields before committing.',
    importReady: 'Ready to import', importErrors: 'Fix these issues before committing.', update: 'Update available', updateNow: 'Update now', later: 'Later',
    source: 'Source', local: 'Local catalog', specifications: 'Specifications', unit: 'Unit', price: 'Price', sku: 'SKU', product: 'Product', quantity: 'Qty', amount: 'Amount', quotation: 'Quotation', generatedLocally: 'Generated locally', companyFallback: 'Company', close: 'Close', logo: 'Company logo', dataSafety: 'Data safety', dataSafetyHelp: 'Catalogs, quotes, settings, and imported data stay in this browser.', appName: 'Product Catalog', workspace: 'B2B WORKSPACE', productWorkspace: 'PRODUCT WORKSPACE', salesDocument: 'SALES DOCUMENT', workspaceControl: 'WORKSPACE CONTROL', localOnlyHelp: 'Local-only data and import tools', logoError: 'Logo must be an image up to 1 MB.', pdfDownloaded: 'PDF downloaded.', pdfExportFailed: 'PDF export failed.', shareFailed: 'Share failed.', duplicated: 'Duplicated', imported: 'Imported', backupRestored: 'Backup restored.', restoreFailed: 'Restore failed.', localDataCleared: 'Local data cleared.', invalidSettings: 'Use a three-letter currency and a tax rate from 0 to 100.', draft: 'Draft', statusExported: 'Exported', statusShared: 'Shared', rows: 'rows', validProducts: 'valid products', row: 'Row', more: 'more', name: 'Name', category: 'Category', description: 'Description', english: 'English', mandarin: 'Mandarin Chinese', malay: 'Malay', vietnamese: 'Vietnamese', japanese: 'Japanese', file: 'File', fileEmpty: 'The file is empty.', jsonInvalid: 'JSON must contain an array of product objects.', jsonParseFailed: 'The JSON file could not be parsed.', skuRequired: 'SKU is required.', productNameRequired: 'Product name is required.', priceInvalid: 'Price must be a non-negative number.', duplicateSku: 'Duplicate SKU.', parserError: 'The file contains a parsing error.', categories: 'Categories', quantityFor: 'Quantity for', invalidQuote: 'Fix quote validation errors before exporting.',
  },
  'zh-Hans': {
    catalog: '产品目录', quotes: '报价单', settings: '设置', offline: '离线', online: '在线', install: '安装应用',
    search: '按产品名称或 SKU 搜索', importTitle: '导入目录', importHelp: '支持 CSV 或 JSON。验证通过前不会修改现有目录。',
    chooseFile: '选择文件', loadDemo: '载入示例目录', products: '个产品', add: '加入报价单', view: '查看',
    emptyTitle: '目录为空', emptyHelp: '导入供应商目录，或载入示例数据开始使用。', noResults: '没有匹配的产品。',
    quote: '当前报价单', quoteEmpty: '报价单为空', quoteEmptyHelp: '从产品目录加入产品。', customer: '客户 / 收件人', notes: '备注和条款', validUntil: '有效期至',
    discount: '报价折扣 %', subtotal: '小计', tax: '税费', total: '合计', exportPdf: '导出 PDF', share: '分享 PDF', shareUnsupported: '当前无法分享，已下载 PDF。', remove: '移除', save: '已保存到本机',
    history: '报价历史', open: '打开', duplicate: '复制', delete: '删除', deleteConfirm: '删除此报价？', company: '公司名称', address: '地址', contact: '联系方式', currency: '货币', defaultTax: '默认税率 %', language: '语言', saveSettings: '保存设置', backup: '下载备份', restore: '恢复备份', clear: '清除所有本地数据', clearConfirm: '清除所有本地目录、报价和设置？',
    mapping: '字段映射', required: '必填', preview: '预览', commit: '提交目录', mappingHelp: '提交前请映射所有必填字段。', importReady: '可以导入', importErrors: '请先修复这些问题。', update: '有新版本', updateNow: '立即更新', later: '稍后',
    source: '来源', local: '本地目录', specifications: '规格', unit: '单位', price: '价格', sku: 'SKU', product: '产品', quantity: '数量', amount: '金额', quotation: '报价单', generatedLocally: '本机生成', companyFallback: '公司', close: '关闭', logo: '公司标志', dataSafety: '数据安全', dataSafetyHelp: '目录、报价、设置和导入数据仅保存在此浏览器中。', appName: '产品目录', workspace: 'B2B 工作区', productWorkspace: '产品工作区', salesDocument: '销售单据', workspaceControl: '工作区管理', localOnlyHelp: '仅本地数据和导入工具', logoError: '标志必须是 1 MB 以内的图片。', pdfDownloaded: 'PDF 已下载。', pdfExportFailed: 'PDF 导出失败。', shareFailed: '分享失败。', duplicated: '已复制', imported: '已导入', backupRestored: '备份已恢复。', restoreFailed: '恢复失败。', localDataCleared: '本地数据已清除。', invalidSettings: '请输入三位货币代码和 0 到 100 之间的税率。', draft: '草稿', statusExported: '已导出', statusShared: '已分享', rows: '行', validProducts: '个有效产品', row: '第', more: '更多', name: '名称', category: '类别', description: '描述', english: '英语', mandarin: '普通话', malay: '马来语', vietnamese: '越南语', japanese: '日语', file: '文件', fileEmpty: '文件为空。', jsonInvalid: 'JSON 必须包含产品对象数组。', jsonParseFailed: 'JSON 文件无法解析。', skuRequired: 'SKU 为必填项。', productNameRequired: '产品名称为必填项。', priceInvalid: '价格必须是非负数字。', duplicateSku: 'SKU 重复。', parserError: '文件包含解析错误。', categories: '类别', quantityFor: '数量：', invalidQuote: '导出前请修复报价单错误。',
  },
  ms: {
    catalog: 'Katalog', quotes: 'Sebut Harga', settings: 'Tetapan', offline: 'Luar talian', online: 'Dalam talian', install: 'Pasang aplikasi',
    search: 'Cari mengikut nama produk atau SKU', importTitle: 'Import katalog', importHelp: 'Fail CSV atau JSON. Tiada perubahan sehingga pengesahan lulus.',
    chooseFile: 'Pilih fail', loadDemo: 'Muat katalog demo', products: 'produk', add: 'Tambah ke sebut harga', view: 'Lihat',
    emptyTitle: 'Katalog anda kosong', emptyHelp: 'Import katalog pembekal atau muat data demo untuk bermula.', noResults: 'Tiada produk sepadan dengan carian ini.',
    quote: 'Sebut harga semasa', quoteEmpty: 'Sebut harga anda kosong', quoteEmptyHelp: 'Tambah produk daripada katalog untuk memulakan sebut harga.', customer: 'Pelanggan / penerima', notes: 'Nota dan terma', validUntil: 'Sah sehingga',
    discount: 'Diskaun sebut harga %', subtotal: 'Jumlah kecil', tax: 'Cukai', total: 'Jumlah', exportPdf: 'Eksport PDF', share: 'Kongsi PDF', shareUnsupported: 'Perkongsian tidak tersedia; PDF telah dimuat turun.', remove: 'Buang', save: 'Disimpan secara setempat', history: 'Sejarah sebut harga', open: 'Buka', duplicate: 'Duplikasi', delete: 'Padam', deleteConfirm: 'Padam sebut harga ini?',
    company: 'Nama syarikat', address: 'Alamat', contact: 'Hubungan', currency: 'Mata wang', defaultTax: 'Cukai lalai %', language: 'Bahasa', saveSettings: 'Simpan tetapan', backup: 'Muat turun sandaran', restore: 'Pulihkan sandaran', clear: 'Kosongkan semua data setempat', clearConfirm: 'Kosongkan semua katalog, sebut harga dan tetapan setempat?',
    mapping: 'Pemetaan lajur', required: 'diperlukan', preview: 'Pratonton', commit: 'Komit katalog', mappingHelp: 'Petakan medan yang diperlukan sebelum komit.', importReady: 'Sedia untuk diimport', importErrors: 'Betulkan isu ini sebelum komit.', update: 'Kemas kini tersedia', updateNow: 'Kemas kini sekarang', later: 'Kemudian',
    source: 'Sumber', local: 'Katalog setempat', specifications: 'Spesifikasi', unit: 'Unit', price: 'Harga', sku: 'SKU', product: 'Produk', quantity: 'Kuantiti', amount: 'Amaun', quotation: 'SEBUT HARGA', generatedLocally: 'Dijana secara setempat', companyFallback: 'Syarikat', close: 'Tutup', logo: 'Logo syarikat', dataSafety: 'Keselamatan data', dataSafetyHelp: 'Katalog, sebut harga, tetapan dan data import kekal dalam pelayar ini.', appName: 'Katalog Produk', workspace: 'RUANG KERJA B2B', productWorkspace: 'RUANG KERJA PRODUK', salesDocument: 'DOKUMEN JUALAN', workspaceControl: 'KAWALAN RUANG KERJA', localOnlyHelp: 'Data setempat dan alat import sahaja', logoError: 'Logo mestilah imej sehingga 1 MB.', pdfDownloaded: 'PDF telah dimuat turun.', pdfExportFailed: 'Eksport PDF gagal.', shareFailed: 'Perkongsian gagal.', duplicated: 'Diduplikasi', imported: 'Diimport', backupRestored: 'Sandaran dipulihkan.', restoreFailed: 'Pemulihan gagal.', localDataCleared: 'Data setempat dikosongkan.', invalidSettings: 'Gunakan mata wang tiga huruf dan cukai antara 0 hingga 100.', draft: 'Draf', statusExported: 'Dieksport', statusShared: 'Dikongsi', rows: 'baris', validProducts: 'produk sah', row: 'Baris', more: 'lagi', name: 'Nama', category: 'Kategori', description: 'Penerangan', english: 'Bahasa Inggeris', mandarin: 'Bahasa Mandarin', malay: 'Bahasa Melayu', vietnamese: 'Bahasa Vietnam', japanese: 'Bahasa Jepun', file: 'Fail', fileEmpty: 'Fail kosong.', jsonInvalid: 'JSON mesti mengandungi susunan objek produk.', jsonParseFailed: 'Fail JSON tidak dapat dihuraikan.', skuRequired: 'SKU diperlukan.', productNameRequired: 'Nama produk diperlukan.', priceInvalid: 'Harga mestilah nombor bukan negatif.', duplicateSku: 'SKU pendua.', parserError: 'Fail mengandungi ralat penghuraian.', categories: 'Kategori', quantityFor: 'Kuantiti untuk', invalidQuote: 'Betulkan ralat sebut harga sebelum mengeksport.',
  },
  vi: {
    catalog: 'Danh mục', quotes: 'Báo giá', settings: 'Cài đặt', offline: 'Ngoại tuyến', online: 'Trực tuyến', install: 'Cài đặt ứng dụng',
    search: 'Tìm theo tên sản phẩm hoặc SKU', importTitle: 'Nhập danh mục', importHelp: 'Tệp CSV hoặc JSON. Chưa có gì thay đổi cho đến khi xác thực thành công.',
    chooseFile: 'Chọn tệp', loadDemo: 'Tải danh mục mẫu', products: 'sản phẩm', add: 'Thêm vào báo giá', view: 'Xem',
    emptyTitle: 'Danh mục đang trống', emptyHelp: 'Nhập danh mục nhà cung cấp hoặc tải dữ liệu mẫu để bắt đầu.', noResults: 'Không có sản phẩm phù hợp.',
    quote: 'Báo giá hiện tại', quoteEmpty: 'Báo giá đang trống', quoteEmptyHelp: 'Thêm sản phẩm từ danh mục để bắt đầu.', customer: 'Khách hàng / người nhận', notes: 'Ghi chú và điều khoản', validUntil: 'Có hiệu lực đến',
    discount: 'Chiết khấu báo giá %', subtotal: 'Tạm tính', tax: 'Thuế', total: 'Tổng cộng', exportPdf: 'Xuất PDF', share: 'Chia sẻ PDF', shareUnsupported: 'Không thể chia sẻ; PDF đã được tải xuống.', remove: 'Xóa khỏi báo giá', save: 'Đã lưu trên thiết bị', history: 'Lịch sử báo giá', open: 'Mở', duplicate: 'Nhân bản', delete: 'Xóa', deleteConfirm: 'Xóa báo giá này?',
    company: 'Tên công ty', address: 'Địa chỉ', contact: 'Liên hệ', currency: 'Tiền tệ', defaultTax: 'Thuế mặc định %', language: 'Ngôn ngữ', saveSettings: 'Lưu cài đặt', backup: 'Tải bản sao lưu', restore: 'Khôi phục bản sao lưu', clear: 'Xóa toàn bộ dữ liệu cục bộ', clearConfirm: 'Xóa toàn bộ danh mục, báo giá và cài đặt cục bộ?',
    mapping: 'Ánh xạ cột', required: 'bắt buộc', preview: 'Xem trước', commit: 'Lưu danh mục', mappingHelp: 'Ánh xạ các trường bắt buộc trước khi lưu.', importReady: 'Sẵn sàng nhập', importErrors: 'Hãy sửa các lỗi này trước khi lưu.', update: 'Có bản cập nhật', updateNow: 'Cập nhật ngay', later: 'Để sau',
    source: 'Nguồn', local: 'Danh mục cục bộ', specifications: 'Thông số', unit: 'Đơn vị', price: 'Giá', sku: 'SKU', product: 'Sản phẩm', quantity: 'SL', amount: 'Thành tiền', quotation: 'BÁO GIÁ', generatedLocally: 'Tạo trên thiết bị', companyFallback: 'Công ty', close: 'Đóng', logo: 'Logo công ty', dataSafety: 'An toàn dữ liệu', dataSafetyHelp: 'Danh mục, báo giá, cài đặt và dữ liệu nhập chỉ lưu trong trình duyệt này.', appName: 'Danh mục sản phẩm', workspace: 'KHÔNG GIAN B2B', productWorkspace: 'KHÔNG GIAN SẢN PHẨM', salesDocument: 'TÀI LIỆU BÁN HÀNG', workspaceControl: 'QUẢN LÝ KHÔNG GIAN', localOnlyHelp: 'Dữ liệu cục bộ và công cụ nhập', logoError: 'Logo phải là hình ảnh tối đa 1 MB.', pdfDownloaded: 'Đã tải PDF.', pdfExportFailed: 'Xuất PDF thất bại.', shareFailed: 'Chia sẻ thất bại.', duplicated: 'Đã nhân bản', imported: 'Đã nhập', backupRestored: 'Đã khôi phục bản sao lưu.', restoreFailed: 'Khôi phục thất bại.', localDataCleared: 'Đã xóa dữ liệu cục bộ.', invalidSettings: 'Dùng mã tiền tệ ba chữ cái và thuế từ 0 đến 100.', draft: 'Bản nháp', statusExported: 'Đã xuất', statusShared: 'Đã chia sẻ', rows: 'dòng', validProducts: 'sản phẩm hợp lệ', row: 'Dòng', more: 'nữa', name: 'Tên', category: 'Danh mục', description: 'Mô tả', english: 'Tiếng Anh', mandarin: 'Tiếng Quan Thoại', malay: 'Tiếng Mã Lai', vietnamese: 'Tiếng Việt', japanese: 'Tiếng Nhật', file: 'Tệp', fileEmpty: 'Tệp đang trống.', jsonInvalid: 'JSON phải chứa một mảng đối tượng sản phẩm.', jsonParseFailed: 'Không thể phân tích tệp JSON.', skuRequired: 'SKU là bắt buộc.', productNameRequired: 'Tên sản phẩm là bắt buộc.', priceInvalid: 'Giá phải là số không âm.', duplicateSku: 'SKU bị trùng.', parserError: 'Tệp có lỗi phân tích.', categories: 'Danh mục', quantityFor: 'Số lượng của', invalidQuote: 'Hãy sửa lỗi báo giá trước khi xuất.',
  },
  ja: {
    catalog: 'カタログ', quotes: '見積書', settings: '設定', offline: 'オフライン', online: 'オンライン', install: 'アプリをインストール',
    search: '商品名または SKU で検索', importTitle: 'カタログをインポート', importHelp: 'CSV または JSON。検証が完了するまで変更されません。',
    chooseFile: 'ファイルを選択', loadDemo: 'デモカタログを読み込む', products: '商品', add: '見積書に追加', view: '表示',
    emptyTitle: 'カタログは空です', emptyHelp: '仕入先カタログをインポートするか、デモデータを読み込んでください。', noResults: '一致する商品がありません。',
    quote: '現在の見積書', quoteEmpty: '見積書は空です', quoteEmptyHelp: 'カタログから商品を追加してください。', customer: '顧客 / 宛先', notes: '備考と条件', validUntil: '有効期限',
    discount: '見積割引 %', subtotal: '小計', tax: '税', total: '合計', exportPdf: 'PDF を出力', share: 'PDF を共有', shareUnsupported: '共有できないため、PDF をダウンロードしました。', remove: '削除', save: 'この端末に保存済み', history: '見積履歴', open: '開く', duplicate: '複製', delete: '削除', deleteConfirm: 'この見積書を削除しますか？',
    company: '会社名', address: '住所', contact: '連絡先', currency: '通貨', defaultTax: '既定の税率 %', language: '言語', saveSettings: '設定を保存', backup: 'バックアップをダウンロード', restore: 'バックアップを復元', clear: 'ローカルデータをすべて削除', clearConfirm: 'ローカルのカタログ、見積書、設定をすべて削除しますか？',
    mapping: '列のマッピング', required: '必須', preview: 'プレビュー', commit: 'カタログを登録', mappingHelp: '登録前に必須項目を割り当ててください。', importReady: 'インポート可能', importErrors: '登録前に問題を解決してください。', update: '更新があります', updateNow: '今すぐ更新', later: '後で',
    source: 'ソース', local: 'ローカルカタログ', specifications: '仕様', unit: '単位', price: '価格', sku: 'SKU', product: '商品', quantity: '数量', amount: '金額', quotation: '見積書', generatedLocally: 'ローカルで生成', companyFallback: '会社', close: '閉じる', logo: '会社ロゴ', dataSafety: 'データ保護', dataSafetyHelp: 'カタログ、見積書、設定、インポートデータはこのブラウザに保存されます。', appName: '商品カタログ', workspace: 'B2B ワークスペース', productWorkspace: '商品ワークスペース', salesDocument: '販売書類', workspaceControl: 'ワークスペース管理', localOnlyHelp: 'ローカルデータとインポートツール', logoError: 'ロゴは 1 MB 以下の画像にしてください。', pdfDownloaded: 'PDF をダウンロードしました。', pdfExportFailed: 'PDF の出力に失敗しました。', shareFailed: '共有に失敗しました。', duplicated: '複製しました', imported: 'インポートしました', backupRestored: 'バックアップを復元しました。', restoreFailed: '復元に失敗しました。', localDataCleared: 'ローカルデータを削除しました。', invalidSettings: '3 文字の通貨コードと 0〜100 の税率を入力してください。', draft: '下書き', statusExported: '出力済み', statusShared: '共有済み', rows: '行', validProducts: '件の有効な商品', row: '行', more: '件以上', name: '名前', category: 'カテゴリ', description: '説明', english: '英語', mandarin: '中国語（普通話）', malay: 'マレー語', vietnamese: 'ベトナム語', japanese: '日本語', file: 'ファイル', fileEmpty: 'ファイルが空です。', jsonInvalid: 'JSON には商品オブジェクトの配列が必要です。', jsonParseFailed: 'JSON ファイルを解析できませんでした。', skuRequired: 'SKU は必須です。', productNameRequired: '商品名は必須です。', priceInvalid: '価格は 0 以上の数値にしてください。', duplicateSku: 'SKU が重複しています。', parserError: 'ファイルの解析エラーです。', categories: 'カテゴリ', quantityFor: '数量：', invalidQuote: '出力前に見積書のエラーを修正してください。',
  },
} as const;

type Screen = 'catalog' | 'quotes' | 'settings';
type Labels = { [Key in keyof typeof copy.en]: string };

type Notice = { tone: 'success' | 'error' | 'info'; message: string } | null;

function currentScreen(): Screen {
  const value = window.location.hash.slice(1);
  return value === 'quotes' || value === 'settings' ? value : 'catalog';
}

function App() {
  const [screen, setScreen] = useState<Screen>(currentScreen);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogVersion, setCatalogVersion] = useState<CatalogVersion | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [draft, setDraft] = useState<QuoteDraft | null>(null);
  const [settings, setSettings] = useState<CompanySettings>({
    id: 'default', companyName: 'Your Company', address: '', contact: '', defaultCurrency: 'USD', defaultTaxRate: 0, language: 'en', logoDataUrl: '',
  });
  const [online, setOnline] = useState(navigator.onLine);
  const [notice, setNotice] = useState<Notice>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [installAction, setInstallAction] = useState<InstallAction | null>(null);
  const [showUpdate, setShowUpdate] = useState(true);
  const labels = copy[settings.language];

  const refresh = useCallback(async () => {
    const [catalog, savedSettings, savedDraft, quoteHistory, activeVersion] = await Promise.all([
      getActiveCatalog(), getSettings(), loadDraft(), listQuotes(), getActiveCatalogVersion(),
    ]);
    setProducts(catalog);
    setCatalogVersion(activeVersion ?? null);
    setSettings(savedSettings);
    setDraft(savedDraft ? recalculateDraft(savedDraft) : null);
    setQuotes(quoteHistory);
  }, []);

  useEffect(() => {
    void refresh();
    registerPwa(setUpdateInfo, (action) => setInstallAction(() => action));
  }, [refresh]);
  useEffect(() => {
    document.title = labels.appName;
  }, [labels.appName]);
  useEffect(() => {
    const onHash = () => setScreen(currentScreen());
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const navigate = (next: Screen) => { window.location.hash = next; };

  const addToQuote = async (product: Product) => {
    const base = draft ?? createEmptyQuote(settings.defaultCurrency, settings.defaultTaxRate);
    const existing = base.lines.find((line) => line.productId === product.id);
    const lines = existing
      ? base.lines.map((line) => line.id === existing.id ? { ...line, quantity: line.quantity + 1 } : line)
      : [...base.lines, { ...createQuoteLine(product, base.id), taxRateSnapshot: getDefaultTaxRate(settings.defaultTaxRate) }];
    const next = recalculateDraft({ ...base, status: 'draft', lines });
    await saveDraft(next);
    setDraft(next);
    setQuotes(await listQuotes());
    setNotice({ tone: 'success', message: `${product.name} · ${labels.add}` });
  };

  const mutateDraft = async (change: (value: QuoteDraft) => QuoteDraft) => {
    if (!draft) return;
    const next = recalculateDraft(change(draft));
    setDraft(next);
    await saveDraft(next);
    setQuotes(await listQuotes());
  };

  const exportPdf = async () => {
    if (!draft || draft.lines.length === 0) return;
    const quoteErrors = getQuoteValidationErrors(draft);
    if (quoteErrors.length) {
      setNotice({ tone: 'error', message: labels.invalidQuote });
      return;
    }
    try {
      const { downloadQuotePdf } = await import('./pdf');
      await downloadQuotePdf(draft, settings, labels);
      const next = { ...draft, status: 'exported' as const };
      await saveDraft(next);
      setDraft(next);
      setQuotes(await listQuotes());
      setNotice({ tone: 'success', message: labels.pdfDownloaded });
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : labels.pdfExportFailed });
    }
  };

  const sharePdf = async () => {
    if (!draft || draft.lines.length === 0) return;
    const quoteErrors = getQuoteValidationErrors(draft);
    if (quoteErrors.length) {
      setNotice({ tone: 'error', message: labels.invalidQuote });
      return;
    }
    try {
      const { downloadQuotePdf, shareQuotePdf } = await import('./pdf');
      const shared = await shareQuotePdf(draft, settings, labels);
      if (!shared) {
        await downloadQuotePdf(draft, settings, labels);
        setNotice({ tone: 'info', message: labels.shareUnsupported });
      } else {
        setNotice({ tone: 'success', message: labels.share });
      }
      const next = { ...draft, status: 'shared' as const };
      await saveDraft(next);
      setDraft(next);
      setQuotes(await listQuotes());
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : labels.shareFailed });
    }
  };

  const onSettingsSaved = async (next: CompanySettings) => {
    if (!/^[A-Z]{3}$/.test(next.defaultCurrency) || validatePercentage(next.defaultTaxRate)) {
      setNotice({ tone: 'error', message: labels.invalidSettings });
      return;
    }
    await saveSettings(next);
    setSettings(next);
    setNotice({ tone: 'success', message: labels.save });
  };

  const openQuote = async (quoteId: string) => {
    const loaded = await loadQuote(quoteId);
    if (loaded) {
      setDraft(recalculateDraft({ ...loaded, status: 'draft' }));
      navigate('quotes');
    }
  };

  const duplicateQuoteAction = async (quoteId: string) => {
    const next = await duplicateQuote(quoteId);
    setDraft(next);
    setQuotes(await listQuotes());
    navigate('quotes');
    setNotice({ tone: 'success', message: `${labels.duplicated} ${next.quoteNumber}.` });
  };

  const deleteQuoteAction = async (quoteId: string) => {
    if (!window.confirm(labels.deleteConfirm)) return;
    await deleteQuote(quoteId);
    setDraft(await loadDraft());
    setQuotes(await listQuotes());
    setNotice({ tone: 'success', message: labels.delete });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark"><img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" /></div>
          <div><p className="eyebrow">{labels.workspace}</p><h1>{labels.appName}</h1></div>
        </div>
        <div className="topbar-status" aria-live="polite">
          <span className={`status-dot ${online ? 'is-online' : 'is-offline'}`} />
          {online ? labels.online : labels.offline}
          {installAction && <button className="button button-small button-secondary" onClick={async () => { const accepted = await installAction(); if (accepted) setInstallAction(null); }}>{labels.install}</button>}
          {updateInfo && showUpdate && <div className="update-prompt"><span>{labels.update} · v{updateInfo.version}</span><button className="button button-small button-warning" onClick={() => updateInfo.action()}>{labels.updateNow}</button><button className="update-later" onClick={() => setShowUpdate(false)}>{labels.later}</button></div>}
        </div>
      </header>
      <nav className="main-nav" aria-label="Primary navigation">
        {(['catalog', 'quotes', 'settings'] as Screen[]).map((item) => (
          <button key={item} className={screen === item ? 'nav-item is-active' : 'nav-item'} onClick={() => navigate(item)}>
            <Icon name={item === 'catalog' ? 'catalog' : item === 'quotes' ? 'quote' : 'settings'} />{labels[item]}
            {item === 'quotes' && draft?.lines.length ? <b className="nav-count">{draft.lines.length}</b> : null}
          </button>
        ))}
      </nav>
      <main className="main-content">
        {screen === 'catalog' && <CatalogScreen products={products} version={catalogVersion} labels={labels} onAdd={addToQuote} onLoadDemo={async () => {
          await replaceCatalog(DEMO_PRODUCTS, 'Built-in demo catalog'); await refresh(); setNotice({ tone: 'success', message: labels.local });
        }} />}
        {screen === 'quotes' && <QuoteScreen draft={draft} quotes={quotes} labels={labels} onChange={mutateDraft} onExport={exportPdf} onShare={sharePdf} onOpen={openQuote} onDuplicate={duplicateQuoteAction} onDelete={deleteQuoteAction} />}
        {screen === 'settings' && <SettingsScreen settings={settings} labels={labels} onSave={onSettingsSaved} onImported={refresh} onNotice={setNotice} />}
      </main>
      {notice && <div className={`toast toast-${notice.tone}`} role="status">{notice.message}</div>}
    </div>
  );
}

function CatalogScreen({ products, version, labels, onAdd, onLoadDemo }: {
  products: Product[];
  version: CatalogVersion | null;
  labels: Labels;
  onAdd: (product: Product) => Promise<void>;
  onLoadDemo: () => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Product | null>(null);
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map((product) => product.category))).sort()], [products]);
  const filtered = products.filter((product) => {
    const haystack = `${product.name} ${product.sku} ${product.category} ${product.description} ${Object.entries(product.specifications).flat().join(' ')}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (category === 'All' || product.category === category);
  });

  return <section className="screen">
    <div className="screen-heading"><div><p className="eyebrow">{labels.productWorkspace}</p><h2>{labels.catalog}</h2><p className="muted">{products.length} {labels.products} · {version ? `${version.sourceName} · ${new Date(version.importedAt).toLocaleString()}` : labels.local}</p></div><button className="button button-secondary" onClick={() => void onLoadDemo()}>{labels.loadDemo}</button></div>
    {products.length === 0 ? <div className="empty-state"><div className="empty-icon"><Icon name="add" /></div><h3>{labels.emptyTitle}</h3><p>{labels.emptyHelp}</p><button className="button" onClick={() => window.location.hash = 'settings'}>{labels.importTitle}</button></div> : <>
      <div className="catalog-toolbar"><label className="search-field"><Icon name="search" /><input name="catalog-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} aria-label={labels.search} /></label><div className="chip-row" aria-label={labels.categories}>{categories.map((item) => <button key={item} className={category === item ? 'chip is-selected' : 'chip'} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
      {filtered.length === 0 ? <div className="empty-state compact"><h3>{labels.noResults}</h3></div> : <div className="product-grid">{filtered.map((product) => <article className="product-card" key={product.id}><div className="product-card-top"><span className="product-category">{product.category}</span><span className="product-sku">{product.sku}</span></div><h3>{product.name}</h3><p>{product.description}</p><div className="product-specs">{Object.entries(product.specifications).slice(0, 2).map(([key, value]) => <span key={key}><b>{key}</b>{value}</span>)}</div><div className="product-card-bottom"><strong>{formatMoney(product.priceMinor, product.currency)}</strong><div className="card-actions"><button className="button button-small button-secondary" onClick={() => setSelected(product)}>{labels.view}</button><button className="button button-small" onClick={() => void onAdd(product)}>{labels.add}</button></div></div></article>)}</div>}{selected && <div className="detail-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="product-detail-title"><button className="icon-button detail-close" onClick={() => setSelected(null)} aria-label={labels.close}><Icon name="close" /></button><span className="product-category">{selected.category}</span><h3 id="product-detail-title">{selected.name}</h3><p>{selected.description}</p><p><b>{labels.sku}:</b> {selected.sku} · <b>{labels.price}:</b> {formatMoney(selected.priceMinor, selected.currency)} / {selected.unit}</p><div className="detail-specs">{Object.entries(selected.specifications).map(([key, value]) => <div key={key}><b>{key}</b><span>{value}</span></div>)}</div><button className="button" onClick={() => void onAdd(selected)}>{labels.add}</button></section></div>}
    </>}
  </section>;
}

function QuoteScreen({ draft, quotes, labels, onChange, onExport, onShare, onOpen, onDuplicate, onDelete }: {
  draft: QuoteDraft | null;
  quotes: Quote[];
  labels: Labels;
  onChange: (change: (value: QuoteDraft) => QuoteDraft) => Promise<void>;
  onExport: () => Promise<void>;
  onShare: () => Promise<void>;
  onOpen: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return <section className="screen"><div className="screen-heading"><div><p className="eyebrow">{labels.salesDocument}</p><h2>{labels.quotes}</h2><p className="muted">{draft?.quoteNumber ?? labels.quoteEmpty}</p></div>{draft?.lines.length ? <div className="card-actions"><button className="button button-secondary" onClick={() => void onShare()}>{labels.share}</button><button className="button" onClick={() => void onExport()}>{labels.exportPdf}</button></div> : null}</div>
    {draft?.lines.length ? <div className="quote-layout"><div className="quote-editor card"><div className="form-grid"><label><span>{labels.customer}</span><input name="customer" value={draft.customer} onChange={(event) => void onChange((value) => ({ ...value, customer: event.target.value }))} /></label><label><span>{labels.validUntil}</span><input name="valid-until" type="date" value={draft.validUntil} onChange={(event) => void onChange((value) => ({ ...value, validUntil: event.target.value }))} /></label><label><span>{labels.discount}</span><input name="quote-discount" type="number" min="0" max="100" step="0.1" value={draft.quoteDiscount} onChange={(event) => void onChange((value) => ({ ...value, quoteDiscount: Number(event.target.value) }))} /></label></div><div className="quote-lines">{draft.lines.map((line) => <div className="quote-line" key={line.id}><div><b>{line.nameSnapshot}</b><small>{line.skuSnapshot} · {formatMoney(line.unitPriceMinorSnapshot, draft.currency)} / {line.unitSnapshot}</small></div><div className="line-inputs"><label className="quantity"><span className="sr-only">{labels.quantityFor} {line.nameSnapshot}</span><input name={`quantity-${line.id}`} type="number" min="0.01" step="0.01" value={line.quantity} onChange={(event) => void onChange((value) => ({ ...value, lines: value.lines.map((candidate) => candidate.id === line.id ? { ...candidate, quantity: Number(event.target.value) } : candidate) }))} aria-invalid={Boolean(validateQuantity(line.quantity))} /></label><label className="quantity"><span className="sr-only">{labels.discount} {line.nameSnapshot}</span><input name={`line-discount-${line.id}`} type="number" min="0" max="100" step="0.1" value={line.discountSnapshot} onChange={(event) => void onChange((value) => ({ ...value, lines: value.lines.map((candidate) => candidate.id === line.id ? { ...candidate, discountSnapshot: Number(event.target.value) } : candidate) }))} aria-invalid={Boolean(validatePercentage(line.discountSnapshot))} /></label></div><strong>{formatMoney(line.lineTotalMinor, draft.currency)}</strong><button className="icon-button" onClick={() => void onChange((value) => ({ ...value, lines: value.lines.filter((candidate) => candidate.id !== line.id) }))} aria-label={`${labels.remove} ${line.nameSnapshot}`}><Icon name="close" /></button></div>)}</div><label><span>{labels.notes}</span><textarea name="quote-notes" rows={4} value={draft.notes} onChange={(event) => void onChange((value) => ({ ...value, notes: event.target.value }))} /></label><p className="saved-note"><span className="saved-dot" aria-hidden="true" />{labels.save}</p></div><aside className="totals-card card"><p className="eyebrow">{labels.quote}</p><div><span>{labels.subtotal}</span><strong>{formatMoney(draft.totals.subtotalMinor, draft.currency)}</strong></div><div><span>{labels.discount}</span><strong>− {formatMoney(draft.totals.discountMinor, draft.currency)}</strong></div><div><span>{labels.tax}</span><strong>{formatMoney(draft.totals.taxMinor, draft.currency)}</strong></div><div className="grand-total"><span>{labels.total}</span><strong>{formatMoney(draft.totals.totalMinor, draft.currency)}</strong></div></aside></div> : <div className="empty-state"><div className="empty-icon"><Icon name="quote" /></div><h3>{labels.quoteEmpty}</h3><p>{labels.quoteEmptyHelp}</p><button className="button" onClick={() => window.location.hash = 'catalog'}>{labels.catalog}</button></div>}
    {quotes.length > 0 && <div className="history card"><h3>{labels.history}</h3>{quotes.map((quote) => <div className="history-row" key={quote.id}><span><b>{quote.quoteNumber}</b><small>{quote.customer || labels.draft} · {quote.status === 'draft' ? labels.draft : quote.status === 'exported' ? labels.statusExported : labels.statusShared}</small></span><strong>{formatMoney(quote.totals.totalMinor, quote.currency)}</strong><div className="card-actions"><button className="button button-small button-secondary" onClick={() => void onOpen(quote.id)}>{labels.open}</button><button className="button button-small button-secondary" onClick={() => void onDuplicate(quote.id)}>{labels.duplicate}</button><button className="button button-small button-danger" onClick={() => void onDelete(quote.id)}>{labels.delete}</button></div></div>)}</div>}
  </section>;
}

function SettingsScreen({ settings, labels, onSave, onImported, onNotice }: {
  settings: CompanySettings;
  labels: Labels;
  onSave: (settings: CompanySettings) => Promise<void>;
  onImported: () => Promise<void>;
  onNotice: (notice: Notice) => void;
}) {
  const [value, setValue] = useState(settings);
  useEffect(() => setValue(settings), [settings]);
  return <section className="screen"><div className="screen-heading"><div><p className="eyebrow">{labels.workspaceControl}</p><h2>{labels.settings}</h2><p className="muted">{labels.localOnlyHelp}</p></div></div><div className="settings-layout"><div className="card"><h3>{labels.company}</h3><div className="settings-form"><label><span>{labels.company}</span><input name="company-name" value={value.companyName} onChange={(event) => setValue({ ...value, companyName: event.target.value })} /></label><label><span>{labels.address}</span><textarea name="company-address" rows={2} value={value.address} onChange={(event) => setValue({ ...value, address: event.target.value })} /></label><label><span>{labels.contact}</span><input name="company-contact" value={value.contact} onChange={(event) => setValue({ ...value, contact: event.target.value })} /></label><div className="form-grid"><label><span>{labels.currency}</span><input name="currency" maxLength={3} value={value.defaultCurrency} onChange={(event) => setValue({ ...value, defaultCurrency: event.target.value.toUpperCase() })} /></label><label><span>{labels.defaultTax}</span><input name="default-tax" type="number" min="0" max="100" step="0.1" value={value.defaultTaxRate} onChange={(event) => setValue({ ...value, defaultTaxRate: Number(event.target.value) })} /></label></div><label><span>{labels.language}</span><select name="language" value={value.language} onChange={(event) => setValue({ ...value, language: event.target.value as CompanySettings['language'] })}><option value="en">{labels.english}</option><option value="zh-Hans">{labels.mandarin}</option><option value="ms">{labels.malay}</option><option value="vi">{labels.vietnamese}</option><option value="ja">{labels.japanese}</option></select></label><label><span>{labels.logo}</span><input name="company-logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (!file || file.size > 1024 * 1024) { onNotice({ tone: 'error', message: labels.logoError }); return; } const reader = new FileReader(); reader.onload = () => setValue({ ...value, logoDataUrl: String(reader.result) }); reader.readAsDataURL(file); }} /></label><button className="button" onClick={() => void onSave(value)}>{labels.saveSettings}</button></div></div><ImportPanel currency={value.defaultCurrency} labels={labels} onImported={onImported} onNotice={onNotice} /><div className="card data-tools"><h3>{labels.dataSafety}</h3><p className="muted">{labels.dataSafetyHelp}</p><button className="button button-secondary" onClick={() => void downloadBackup()}>{labels.backup}</button><label className="file-button button button-secondary">{labels.restore}<input name="backup-file" type="file" accept="application/json" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { await restoreBackup(file); await onImported(); onNotice({ tone: 'success', message: labels.backupRestored }); } catch (error) { onNotice({ tone: 'error', message: error instanceof Error ? error.message : labels.restoreFailed }); } }} /></label><button className="button button-danger" onClick={async () => { if (window.confirm(labels.clearConfirm)) { await clearAllData(); await onImported(); onNotice({ tone: 'success', message: labels.localDataCleared }); } }}>{labels.clear}</button></div></div></section>;
}

function localizeImportIssue(message: string, labels: Labels): string {
  const translations: Record<string, string> = {
    'The file is empty.': labels.fileEmpty,
    'JSON must contain an array of product objects.': labels.jsonInvalid,
    'The JSON file could not be parsed.': labels.jsonParseFailed,
    'SKU is required.': labels.skuRequired,
    'Product name is required.': labels.productNameRequired,
    'Price must be a non-negative number.': labels.priceInvalid,
    'Duplicate SKU.': labels.duplicateSku,
  };
  if (message.startsWith('Row ')) return `${labels.parserError} ${message.slice(message.indexOf(':') + 1).trim()}`;
  return translations[message] ?? message;
}

function ImportPanel({ currency, labels, onImported, onNotice }: {
  currency: string;
  labels: Labels;
  onImported: () => Promise<void>;
  onNotice: (notice: Notice) => void;
}) {
  const [filename, setFilename] = useState('');
  const [parsed, setParsed] = useState<ParsedRows | null>(null);
  const [mapping, setMapping] = useState<ImportMapping | null>(null);
  const result = parsed && mapping ? buildProducts(parsed.rows, mapping, currency) : null;
  const parserIssues = parsed?.parserErrors.map((message) => ({ row: 0, field: 'file', message })) ?? [];
  const issues = [...parserIssues, ...(result?.issues ?? [])];
  return <div className="card import-panel"><h3>{labels.importTitle}</h3><p className="muted">{labels.importHelp}</p><label className="file-button button button-secondary">{labels.chooseFile}<input name="catalog-file" type="file" accept=".csv,.json,text/csv,application/json" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setFilename(file.name); const next = parseCatalogText(await file.text(), file.name); setParsed(next); setMapping(suggestMapping(next.headers)); }} /></label>{parsed && mapping && <><div className="mapping-header"><h4>{labels.mapping}</h4><span className={issues.length ? 'badge badge-error' : 'badge badge-success'}>{issues.length ? labels.importErrors : labels.importReady}</span></div><p className="muted">{labels.mappingHelp}</p><div className="mapping-grid">{IMPORT_FIELDS.map((field: ImportField) => <label key={field}><span>{labels[field]}{field === 'sku' || field === 'name' || field === 'price' ? ` (${labels.required})` : ''}</span><select name={`mapping-${field}`} value={mapping[field]} onChange={(event) => setMapping({ ...mapping, [field]: event.target.value })}><option value="">—</option>{parsed.headers.map((header) => <option key={header} value={header}>{header}</option>)}</select></label>)}</div>{issues.length > 0 && <ul className="issue-list">{issues.slice(0, 8).map((issue, index) => <li key={`${issue.field}-${issue.row}-${index}`}>{issue.row ? `${labels.row} ${issue.row} · ` : ''}<b>{labels[issue.field as keyof Labels] ?? issue.field}</b>: {localizeImportIssue(issue.message, labels)}</li>)}{issues.length > 8 && <li>+ {issues.length - 8} {labels.more}</li>}</ul>}<div className="preview-box"><b>{labels.preview}</b><span>{filename} · {parsed.rows.length} {labels.rows} · {result?.products.length ?? 0} {labels.validProducts}</span></div><button className="button" disabled={issues.length > 0 || !result?.products.length} onClick={async () => { if (!result || issues.length) return; await replaceCatalog(result.products, filename); await onImported(); onNotice({ tone: 'success', message: `${labels.imported} ${result.products.length} ${labels.products}.` }); setParsed(null); setMapping(null); }}>{labels.commit}</button></>}</div>;
}

export default App;
