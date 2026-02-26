'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import {
    ChevronDown, Copy, Settings, HelpCircle, Clock, CheckCircle2,
    Loader2, Check, ExternalLink, Mail, X, Layers, Globe, Search, Bell, ChevronRight, ChevronLeft
} from 'lucide-react';

const CURRENCIES = [
    // --- USDT ---
    { id: 'USDTTRC20', name: 'USDT', network: 'TRON (TRC-20)', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/tron-trx-logo.svg?v=024' },
    { id: 'USDTBSC', name: 'USDT', network: 'Binance Smart Chain (BEP-20)', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=024' },
    { id: 'USDTERC20', name: 'USDT', network: 'Ethereum (ERC-20)', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024' },
    { id: 'USDTMATIC', name: 'USDT', network: 'Polygon (MATIC)', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=024' },
    { id: 'USDTSOL', name: 'USDT', network: 'Solana (SOL)', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=024' },
    { id: 'USDTALGO', name: 'USDT', network: 'Algorand (ALGO)', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/algorand-algo-logo.svg?v=024' },

    // --- USDC ---
    { id: 'USDC', name: 'USDC', network: 'Ethereum (ERC-20)', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024' },
    { id: 'USDCBSC', name: 'USDC', network: 'Binance Smart Chain (BEP-20)', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=024' },
    { id: 'USDCMATIC', name: 'USDC', network: 'Polygon (MATIC)', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=024' },
    { id: 'USDCSOL', name: 'USDC', network: 'Solana (SOL)', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=024' },

    // --- BTC & Main Coins ---
    { id: 'BTC', name: 'BTC', network: 'Bitcoin', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=024' },
    { id: 'ETH', name: 'ETH', network: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024' },
    { id: 'LTC', name: 'LTC', network: 'Litecoin', logo: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg?v=024' },
    { id: 'SOL', name: 'SOL', network: 'Solana', logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=024' },
    { id: 'TRX', name: 'TRX', network: 'TRON', logo: 'https://cryptologos.cc/logos/tron-trx-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/tron-trx-logo.svg?v=024' },
    { id: 'DOGE', name: 'DOGE', network: 'Dogecoin', logo: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=024' },
    { id: 'XRP', name: 'XRP', network: 'Ripple', logo: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg?v=024' },
    { id: 'ADA', name: 'ADA', network: 'Cardano', logo: 'https://cryptologos.cc/logos/cardano-ada-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/cardano-ada-logo.svg?v=024' },
    { id: 'DOT', name: 'DOT', network: 'Polkadot', logo: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg?v=024' },
    { id: 'MATIC', name: 'MATIC', network: 'Polygon', logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=024' },

    // --- More Coins ---
    { id: 'AVAX', name: 'AVAX', network: 'Avalanche (C-Chain)', logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=024' },
    { id: 'LINK', name: 'LINK', network: 'Ethereum (ERC-20)', logo: 'https://cryptologos.cc/logos/chainlink-link-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024' },
    { id: 'SHIB', name: 'SHIB', network: 'Ethereum (ERC-20)', logo: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024' },
    { id: 'SHIBBSC', name: 'SHIB', network: 'Binance Smart Chain (BEP-20)', logo: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=024' },
    { id: 'BCH', name: 'BCH', network: 'Bitcoin Cash', logo: 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.svg?v=024' },
    { id: 'XLM', name: 'XLM', network: 'Stellar', logo: 'https://cryptologos.cc/logos/stellar-xlm-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/stellar-xlm-logo.svg?v=024' },
    { id: 'ATOM', name: 'ATOM', network: 'Cosmos', logo: 'https://cryptologos.cc/logos/cosmos-atom-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/cosmos-atom-logo.svg?v=024' },
    { id: 'XMR', name: 'XMR', network: 'Monero', logo: 'https://cryptologos.cc/logos/monero-xmr-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/monero-xmr-logo.svg?v=024' },
    { id: 'XNO', name: 'NANO', network: 'Nano', logo: 'https://cryptologos.cc/logos/nano-xno-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/nano-xno-logo.svg?v=024' },
    { id: 'DASH', name: 'DASH', network: 'Dash', logo: 'https://cryptologos.cc/logos/dash-dash-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/dash-dash-logo.svg?v=024' },
    { id: 'VET', name: 'VET', network: 'VeChain', logo: 'https://cryptologos.cc/logos/vechain-vet-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/vechain-vet-logo.svg?v=024' },
    { id: 'DGB', name: 'DGB', network: 'DigiByte', logo: 'https://cryptologos.cc/logos/digibyte-dgb-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/digibyte-dgb-logo.svg?v=024' },
    { id: 'ZEC', name: 'ZEC', network: 'Zcash', logo: 'https://cryptologos.cc/logos/zcash-zec-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/zcash-zec-logo.svg?v=024' },
    { id: 'EOS', name: 'EOS', network: 'EOS', logo: 'https://cryptologos.cc/logos/eos-eos-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/eos-eos-logo.svg?v=024' },
    { id: 'ALGO', name: 'ALGO', network: 'Algorand', logo: 'https://cryptologos.cc/logos/algorand-algo-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/algorand-algo-logo.svg?v=024' },
    { id: 'NEAR', name: 'NEAR', network: 'NEAR Protocol', logo: 'https://cryptologos.cc/logos/near-protocol-near-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/near-protocol-near-logo.svg?v=024' },
    { id: 'FTM', name: 'FTM', network: 'Fantom', logo: 'https://cryptologos.cc/logos/fantom-ftm-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/fantom-ftm-logo.svg?v=024' },
    { id: 'MANA', name: 'MANA', network: 'Ethereum (ERC-20)', logo: 'https://cryptologos.cc/logos/decentraland-mana-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024' },
    { id: 'SAND', name: 'SAND', network: 'Ethereum (ERC-20)', logo: 'https://cryptologos.cc/logos/the-sandbox-sand-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024' },
    { id: 'AXS', name: 'AXS', network: 'Ethereum (ERC-20)', logo: 'https://cryptologos.cc/logos/axie-infinity-axs-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024' },
    { id: 'ETC', name: 'ETC', network: 'Ethereum Classic', logo: 'https://cryptologos.cc/logos/ethereum-classic-etc-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/ethereum-classic-etc-logo.svg?v=024' },
    { id: 'FIL', name: 'FIL', network: 'Filecoin', logo: 'https://cryptologos.cc/logos/filecoin-fil-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/filecoin-fil-logo.svg?v=024' },
    { id: 'BUSDBSC', name: 'BUSD', network: 'Binance Smart Chain (BEP-20)', logo: 'https://cryptologos.cc/logos/binance-usd-busd-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=024' },
    { id: 'BUSD', name: 'BUSD', network: 'Ethereum (ERC-20)', logo: 'https://cryptologos.cc/logos/binance-usd-busd-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024' },
    { id: 'DAI', name: 'DAI', network: 'Ethereum (ERC-20)', logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024' },
    { id: 'DAIMATIC', name: 'DAI', network: 'Polygon (MATIC)', logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=024' },
    { id: 'USDDTRC20', name: 'USDD', network: 'TRON (TRC-20)', logo: 'https://cryptologos.cc/logos/usdd-usdd-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/tron-trx-logo.svg?v=024' },
    { id: 'TUSDTRC20', name: 'TUSD', network: 'TRON (TRC-20)', logo: 'https://cryptologos.cc/logos/trueusd-tusd-logo.svg?v=024', netLogo: 'https://cryptologos.cc/logos/tron-trx-logo.svg?v=024' },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
    'English': {
        selectPayment: 'Select payment', chooseCurrency: '1. Choose Currency', chooseNetwork: '2. Choose Network', searchCoin: 'Search coin...',
        noCoinFound: 'No coin found...', totalToPay: 'TOTAL TO PAY', proceedToPayment: 'PROCEED TO PAYMENT', generating: 'GENERATING...',
        networkFix: 'Network', youPayNetFee: 'You pay network fee', recipientAddress: "Recipient's wallet address", whenPaymentStatus: "When your payment status will change, we'll send to you notification",
        leaveEmail: "Leave your email", active: "Active", save: "SAVE", expirationTime: "Expiration time", confirmations: "Confirmations", from: "from",
        paid: "Paid!", successMessage: "Success! Your payment has been confirmed by the network.", continueBtn: "CONTINUE", languageTitle: "Language", languageDesc: "Choose your language",
        notifyTitle: "Enable notification", selectLangHeading: "Select Language"
    },
    'Spanish (Español)': {
        selectPayment: 'Seleccionar pago', chooseCurrency: '1. Elegir Moneda', chooseNetwork: '2. Elegir Red', searchCoin: 'Buscar moneda...',
        noCoinFound: 'No se encontró...', totalToPay: 'TOTAL A PAGAR', proceedToPayment: 'PROCEDER AL PAGO', generating: 'GENERANDO...',
        networkFix: 'Red', youPayNetFee: 'Pagas tarifa de red', recipientAddress: 'Dirección del destinatario', whenPaymentStatus: 'Notificaremos el estado de tu pago',
        leaveEmail: 'Dejar correo', active: 'Activo', save: 'GUARDAR', expirationTime: 'Tiempo restante', confirmations: 'Confirmaciones', from: 'de',
        paid: '¡Pagado!', successMessage: '¡Éxito! Red confirmada.', continueBtn: 'CONTINUAR', languageTitle: 'Idioma', languageDesc: 'Elige tu idioma',
        notifyTitle: 'Activar notificar', selectLangHeading: 'Seleccionar Idioma'
    },
    'French (Français)': {
        selectPayment: 'Sélectionner le paiement', chooseCurrency: '1. Choisir la devise', chooseNetwork: '2. Choisir le réseau', searchCoin: 'Chercher...',
        noCoinFound: 'Aucune devise...', totalToPay: 'TOTAL À PAYER', proceedToPayment: 'PROCÉDER AU PAIEMENT', generating: 'GÉNÉRATION...',
        networkFix: 'Réseau', youPayNetFee: 'Vous payez les frais', recipientAddress: 'Adresse du portfeuille', whenPaymentStatus: 'Nous vous informerons du statut',
        leaveEmail: 'Laissez un email', active: 'Actif', save: 'ENREGISTRER', expirationTime: 'Délai d\'expiration', confirmations: 'Confirmations', from: 'sur',
        paid: 'Payé !', successMessage: 'Succès ! Le paiement est confirmé.', continueBtn: 'CONTINUER', languageTitle: 'Langue', languageDesc: 'Choisissez la langue',
        notifyTitle: 'Activer la notification', selectLangHeading: 'Sélectionner Langue'
    },
    'German (Deutsch)': {
        selectPayment: 'Zahlung auswählen', chooseCurrency: '1. Währung wählen', chooseNetwork: '2. Netzwerk wählen', searchCoin: 'Suchen...',
        noCoinFound: 'Keine Münze...', totalToPay: 'GESAMTBETRAG', proceedToPayment: 'ZUR ZAHLUNG', generating: 'GENERIEREN...',
        networkFix: 'Netzwerk', youPayNetFee: 'Gebühr zahlen Sie', recipientAddress: 'Empfängeradresse', whenPaymentStatus: 'Wir benachrichtigen Sie bei Statusänderung',
        leaveEmail: 'E-Mail hinterlassen', active: 'Aktiv', save: 'SPEICHERN', expirationTime: 'Ablaufzeit', confirmations: 'Bestätigungen', from: 'von',
        paid: 'Bezahlt!', successMessage: 'Erfolg! Zahlung wurde bestätigt.', continueBtn: 'WEITER', languageTitle: 'Sprache', languageDesc: 'Wählen Sie Sprache',
        notifyTitle: 'Benachrichtigen', selectLangHeading: 'Sprache auswählen'
    },
    'Russian (Русский)': {
        selectPayment: 'Выберите способ оплаты', chooseCurrency: '1. Валюта', chooseNetwork: '2. Выбор сети', searchCoin: 'Поиск...',
        noCoinFound: 'Монета не найдена...', totalToPay: 'К ОПЛАТЕ', proceedToPayment: 'ПЕРЕЙТИ К ОПЛАТЕ', generating: 'ГЕНЕРАЦИЯ...',
        networkFix: 'Сеть', youPayNetFee: 'Комиссия сети 100%', recipientAddress: 'Адрес кошелька', whenPaymentStatus: 'Мы отправим вам уведомление',
        leaveEmail: 'Оставьте email', active: 'Активно', save: 'СОХРАНИТЬ', expirationTime: 'Истекает через', confirmations: 'Подтверждения', from: 'из',
        paid: 'Оплачено!', successMessage: 'Успешно! Платеж подтвержден.', continueBtn: 'ПРОДОЛЖИТЬ', languageTitle: 'Язык', languageDesc: 'Выберите свой язык',
        notifyTitle: 'Уведомления', selectLangHeading: 'Выбор языка'
    },
    'Chinese (中文)': {
        selectPayment: '选择支付方式', chooseCurrency: '1. 选择币种', chooseNetwork: '2. 选择网络', searchCoin: '搜索币种...',
        noCoinFound: '未找到币种...', totalToPay: '支付总计', proceedToPayment: '去支付', generating: '生成中...',
        networkFix: '网络', youPayNetFee: '您支付网络费用', recipientAddress: '接收钱包地址', whenPaymentStatus: '支付状态更改时发送通知',
        leaveEmail: '留下邮箱', active: '已开启', save: '保存', expirationTime: '过期时间', confirmations: '确认数', from: '/',
        paid: '已支付!', successMessage: '成功！您的付款已被网络确认。', continueBtn: '继续', languageTitle: '语言', languageDesc: '选择您的语言',
        notifyTitle: '启用通知', selectLangHeading: '选择语言'
    },
    'Japanese (日本語)': {
        selectPayment: '支払いを選択', chooseCurrency: '1. 通貨を選択', chooseNetwork: '2. ネットワーク', searchCoin: '検索...',
        noCoinFound: '見つかりません...', totalToPay: 'お支払い合計', proceedToPayment: '支払いに進む', generating: '生成中...',
        networkFix: 'ネットワーク', youPayNetFee: 'ネットワーク手数料はお客様負担です', recipientAddress: '受取人のアドレス', whenPaymentStatus: '支払い状況が変わった際にお知らせ',
        leaveEmail: 'メールを残す', active: '有効', save: '保存', expirationTime: '有効期限', confirmations: '確認数', from: '/',
        paid: '支払い完了!', successMessage: '成功しました。支払いが確認されました。', continueBtn: '続行する', languageTitle: '言語', languageDesc: '言語を選択',
        notifyTitle: '通知を有効にする', selectLangHeading: '言語を選択'
    },
    'Korean (한국어)': {
        selectPayment: '결제 수단 선택', chooseCurrency: '1. 통화 선택', chooseNetwork: '2. 네트워크 선택', searchCoin: '검색...',
        noCoinFound: '결과 없음...', totalToPay: '총 결제 금액', proceedToPayment: '결제 진행', generating: '생성 중...',
        networkFix: '네트워크', youPayNetFee: '네트워크 수수료 발생', recipientAddress: '수취인 지갑 주소', whenPaymentStatus: '결제 상태 변경시 알림 전송',
        leaveEmail: '이메일 입력', active: '활성', save: '저장', expirationTime: '만료 시간', confirmations: '확인', from: '/',
        paid: '결제 완료!', successMessage: '성공! 결제가 네트워크 확인됨.', continueBtn: '계속하기', languageTitle: '언어', languageDesc: '언어를 선택하세요',
        notifyTitle: '알림 설정', selectLangHeading: '언어 선택'
    },
    'Arabic (العربية)': {
        selectPayment: 'حدد طريقة الدفع', chooseCurrency: '1. اختر العملة', chooseNetwork: '2. اختر الشبكة', searchCoin: 'بحث...',
        noCoinFound: 'لم يتم العثور...', totalToPay: 'إجمالي الدفع', proceedToPayment: 'المتابعة للدفع', generating: 'جاري الإنشاء...',
        networkFix: 'الشبكة', youPayNetFee: 'أنت تدفع رسوم الشبكة', recipientAddress: 'عنوان المحفظة', whenPaymentStatus: 'سنرسل لك إشعارًا عند التغيير',
        leaveEmail: 'اترك بريدك', active: 'نشط', save: 'حفظ', expirationTime: 'وقت الانتهاء', confirmations: 'تأكيدات', from: 'من',
        paid: 'تم الدفع!', successMessage: 'نجاح! تم تأكيد دفعتك.', continueBtn: 'متابعة', languageTitle: 'لغة', languageDesc: 'اختر لغتك',
        notifyTitle: 'إشعارات', selectLangHeading: 'اختر اللغة'
    },
    'Portuguese (Português)': {
        selectPayment: 'Selecionar pagamento', chooseCurrency: '1. Escolha a moeda', chooseNetwork: '2. Escolha a rede', searchCoin: 'Buscar...',
        noCoinFound: 'Nenhuma moeda...', totalToPay: 'TOTAL A PAGAR', proceedToPayment: 'PROCEDER AO PAGAMENTO', generating: 'GERANDO...',
        networkFix: 'Rede', youPayNetFee: 'Você paga a taxa da rede', recipientAddress: 'Endereço da carteira', whenPaymentStatus: 'Notificaremos status das mudanças',
        leaveEmail: 'Deixar e-mail', active: 'Ativo', save: 'SALVAR', expirationTime: 'Tempo limite', confirmations: 'Confirmações', from: 'de',
        paid: 'Pago!', successMessage: 'Sucesso! Pagamento confirmado.', continueBtn: 'CONTINUAR', languageTitle: 'Idioma', languageDesc: 'Escolhe idioma',
        notifyTitle: 'Notificações', selectLangHeading: 'Selecionar Idioma'
    },
    'Hindi (हिन्दी)': {
        selectPayment: 'भुगतान चुनें', chooseCurrency: '1. मुद्रा चुनें', chooseNetwork: '2. नेटवर्क चुनें', searchCoin: 'खोजें...',
        noCoinFound: 'नहीं मिला...', totalToPay: 'कुल भुगतान', proceedToPayment: 'भुगतान के लिए आगे', generating: 'बनाया जा रहा...',
        networkFix: 'नेटवर्क', youPayNetFee: 'नेटवर्क शुल्क', recipientAddress: 'प्राप्तकर्ता का पता', whenPaymentStatus: 'हम आपको स्थिति पर सूचित करेंगे',
        leaveEmail: 'ईमेल छोड़ें', active: 'सक्रिय', save: 'सहेजें', expirationTime: 'समाप्ति समय', confirmations: 'पुष्टिकरण', from: 'से',
        paid: 'भुगतान किया!', successMessage: 'सफल! आपका भुगतान कन्फर्म हो गया।', continueBtn: 'जारी रखें', languageTitle: 'भाषा', languageDesc: 'भाषा चुनें',
        notifyTitle: 'सूचना सक्षम', selectLangHeading: 'भाषा चुनें'
    }
};

export default function CheckoutPage() {
    const params = useParams();
    const invoiceId = params?.id as string;

    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [payAddress, setPayAddress] = useState('');
    const [payAmount, setPayAmount] = useState<number | null>(null);
    const [payCurrency, setPayCurrency] = useState('USDTTRC20');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [status, setStatus] = useState('FETCHING');
    const statusRef = useRef(status);
    // Keep ref in sync with state
    useEffect(() => { statusRef.current = status; }, [status]);

    // Payment method: 'crypto' = NowPayments, 'binance' = Binance Pay ID
    const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'binance'>('crypto');

    // Binance Pay states
    const [binancePayId, setBinancePayId] = useState('');
    const [binanceNote, setBinanceNote] = useState('');
    const [binanceAmount, setBinanceAmount] = useState<number | null>(null);
    const [binanceQrUrl, setBinanceQrUrl] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verifyMessage, setVerifyMessage] = useState('');
    const [verifyError, setVerifyError] = useState('');
    const [copiedNote, setCopiedNote] = useState(false);
    const [copiedBinanceId, setCopiedBinanceId] = useState(false);

    // Multi-step selection states
    const [selectedCoin, setSelectedCoin] = useState('USDT');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCoinDropdownOpen, setIsCoinDropdownOpen] = useState(false);
    const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');

    // UI states
    const [timeLeft, setTimeLeft] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [copiedAmount, setCopiedAmount] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState(false);
    const [customerEmail, setCustomerEmail] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [emailSaving, setEmailSaving] = useState(false);
    const [emailSaved, setEmailSaved] = useState(false);
    const hasSetDefaultMethod = useRef(false);

    const t = (key: string) => {
        return (TRANSLATIONS[selectedLanguage] || TRANSLATIONS['English'])[key] || TRANSLATIONS['English'][key];
    };

    useEffect(() => {
        if (!invoiceId) return;
        fetchInvoice();
        const interval = setInterval(fetchInvoice, 3000);
        return () => clearInterval(interval);
    }, [invoiceId]);

    useEffect(() => {
        if (status === 'WAITING' || status === 'SELECT_CRYPTO' || status === 'BINANCE_WAITING') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        if (status !== 'SELECT_CRYPTO') setStatus('EXPIRED');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [status]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/checkout/${invoiceId}?t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setInvoice(data.data);

                // Calculate time left based on expiresAt from server
                const expiresAt = new Date(data.data.expiresAt).getTime();
                const now = Date.now();
                const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
                setTimeLeft(remaining);
                setIsInitialLoad(false);

                if (data.data.status === 'COMPLETED' || data.data.transaction?.status === 'SUCCESS') {
                    setStatus('PAID');
                } else if (remaining <= 0) {
                    setStatus('EXPIRED');
                } else if (data.data.transaction && data.data.transaction.providerTxId?.startsWith('PAY-')) {
                    // Binance Pay transaction — preserve BINANCE_WAITING or restore it on reload
                    const pId = data.data.transaction.payAddress || data.data.merchantBinancePayId || '';
                    setBinancePayId(pId);
                    setBinanceNote(data.data.transaction.providerTxId);
                    setBinanceAmount(Number(data.data.transaction.amount || data.data.amount));
                    // Generate QR with Binance deep link on restore
                    if (pId && !binanceQrUrl) {
                        try {
                            const binanceDeepLink = `https://app.binance.com/en/usercenter/wallet/payment/send?payId=${encodeURIComponent(pId)}&amount=${data.data.transaction.amount || data.data.amount}&coin=USDT&note=${encodeURIComponent(data.data.transaction.providerTxId)}`;
                            const qr = await QRCode.toDataURL(binanceDeepLink, { margin: 1, width: 220, color: { dark: '#1E2026', light: '#ffffff' } });
                            setBinanceQrUrl(qr);
                        } catch (e) { }
                    }
                    setStatus('BINANCE_WAITING');
                } else if (data.data.transaction && data.data.transaction.payAddress) {
                    setPayAddress(data.data.transaction.payAddress);
                    setPayAmount(data.data.transaction.amount);
                    const returnedCurrency = (data.data.transaction.currency || 'USDTTRC20').toUpperCase();
                    setPayCurrency(returnedCurrency);

                    const foundNetwork = CURRENCIES.find(c => c.id.toUpperCase() === returnedCurrency);
                    if (foundNetwork) {
                        setSelectedCoin(foundNetwork.name);
                    }

                    generateQR(data.data.transaction.payAddress);
                    setStatus('WAITING');
                } else {
                    setStatus('SELECT_CRYPTO');
                    // Default to crypto if enabled, or binance if only that is enabled
                    if (!hasSetDefaultMethod.current) {
                        hasSetDefaultMethod.current = true;
                        if (data.data.enabledCryptoWallet === false && data.data.enabledBinancePay !== false) {
                            setPaymentMethod('binance');
                        } else {
                            setPaymentMethod('crypto');
                        }
                    }
                }
            } else {
                setStatus('ERROR');
            }
        } catch (error) {
            setStatus('ERROR');
        } finally {
            setLoading(false);
        }
    };

    const generateQR = async (text: string) => {
        try {
            const url = await QRCode.toDataURL(text, { margin: 1, width: 220, color: { dark: '#000000', light: '#ffffff' } });
            setQrCodeDataUrl(url);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectCrypto = async () => {
        setGenerating(true);
        try {
            const res = await fetch(`/api/checkout/${invoiceId}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payCurrency })
            });
            const data = await res.json();
            if (data.success) {
                setPayAddress(data.data.payAddress);
                setPayAmount(data.data.payAmount);
                generateQR(data.data.payAddress);
                setStatus('WAITING');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Failed to generate payment address');
        } finally {
            setGenerating(false);
        }
    };

    const handleBinancePay = async () => {
        setGenerating(true);
        setVerifyMessage('');
        setVerifyError('');
        try {
            const res = await fetch(`/api/checkout/${invoiceId}/pay-binance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.success) {
                setBinancePayId(data.data.binancePayId);
                setBinanceNote(data.data.note);
                setBinanceAmount(Number(data.data.amount));
                // Generate QR with Binance Pay deep link
                try {
                    const binanceDeepLink = `https://app.binance.com/en/usercenter/wallet/payment/send?payId=${encodeURIComponent(data.data.binancePayId)}&amount=${data.data.amount}&coin=USDT&note=${encodeURIComponent(data.data.note)}`;
                    const qr = await QRCode.toDataURL(binanceDeepLink, { margin: 1, width: 220, color: { dark: '#1E2026', light: '#ffffff' } });
                    setBinanceQrUrl(qr);
                } catch (e) { console.error('QR gen error', e); }
                setStatus('BINANCE_WAITING');
            } else {
                alert('Error: ' + (data.error || 'Failed to init Binance payment'));
            }
        } catch (error) {
            alert('Failed to contact server');
        } finally {
            setGenerating(false);
        }
    };

    const handleBinanceVerify = async () => {
        setVerifying(true);
        setVerifyMessage('');
        setVerifyError('');
        try {
            const res = await fetch('/api/v1/binance/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId }),
            });
            const data = await res.json();
            if (data.success) {
                setVerifyMessage('✅ Payment verified successfully!');
                setTimeout(() => setStatus('PAID'), 1500);
            } else {
                const errorType = data.error || '';
                if (errorType === 'api_keys_missing') {
                    setVerifyError('⚠️ Merchant Binance API keys not configured. Cannot verify automatically.');
                } else if (errorType === 'invalid_api_key') {
                    setVerifyError('🔑 Binance API key is invalid or expired. Contact merchant.');
                } else if (errorType === 'not_found') {
                    setVerifyError(`Payment not found yet. Make sure you sent exactly ${binanceAmount} USDT with note "${binanceNote}". Wait 1-2 min and try again.`);
                } else {
                    setVerifyError(data.message || 'Verification failed. Please try again.');
                }
            }
        } catch (error) {
            setVerifyError('Network error. Please check your connection and try again.');
        } finally {
            setVerifying(false);
        }
    };

    const handleSaveEmail = async () => {
        if (!customerEmail || !customerEmail.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }
        setEmailSaving(true);
        try {
            const res = await fetch(`/api/checkout/${invoiceId}/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: customerEmail })
            });
            if (res.ok) {
                setEmailSaved(true);
                setShowEmailInput(false);
            }
        } catch (error) {
            console.error('Save email error:', error);
        } finally {
            setEmailSaving(false);
        }
    };

    const copyToClipboard = (text: string, type: 'amount' | 'address') => {
        navigator.clipboard.writeText(text);
        if (type === 'amount') {
            setCopiedAmount(true);
            setTimeout(() => setCopiedAmount(false), 2000);
        } else {
            setCopiedAddress(true);
            setTimeout(() => setCopiedAddress(false), 2000);
        }
    };

    // Derived data for Coin selection
    const uniqueCoins = useMemo(() => {
        const coins = Array.from(new Set(CURRENCIES.map(c => c.name))).map(name => {
            return CURRENCIES.find(c => c.name === name)!;
        });

        if (!searchQuery) return coins;

        return coins.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    // Derived data for Network selection
    const availableNetworks = CURRENCIES.filter(c => c.name === selectedCoin);
    const selectedCoinObj = CURRENCIES.find(c => c.name === selectedCoin) || uniqueCoins[0];
    const selectedNetworkObj = CURRENCIES.find(c => c.id === payCurrency) || availableNetworks[0];

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    if (status === 'ERROR' || !invoice) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Invoice not found or expired.</div>;

    return (
        <div style={{ backgroundColor: invoice?.themeBgColor || "#f3f4f6" }} className="min-h-screen flex flex-col items-center py-12 px-4 font-sans text-slate-900 transition-colors duration-500">
            <div className="bg-white rounded-[40px] w-full max-w-lg shadow-[0_30px_60px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100/50">

                {/* Header Section */}
                <div className="p-8 pb-6 bg-[#f9fafc] border-b border-slate-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {invoice?.brandLogoUrl ? (
                            <img src={invoice.brandLogoUrl} alt="Logo" className="h-10 object-contain" />
                        ) : (
                            <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
                                <span className="font-black text-white text-sm">{invoice?.merchantName?.substring(0, 2).toUpperCase() || "SM"}</span>
                            </div>
                        )}
                        <span className="font-black text-xl tracking-tight text-slate-900">{invoice?.merchantName}</span>
                    </div>

                    {invoice?.isTestMode && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse shadow-lg shadow-amber-500/20">
                            <Layers className="w-3 h-3" />
                            Test Mode
                        </div>
                    )}
                </div>

                {/* PAYMENT METHOD SELECTOR - shown on SELECT_CRYPTO only */}
                {status === 'SELECT_CRYPTO' && (invoice?.enabledCryptoWallet !== false || invoice?.enabledBinancePay !== false) && (
                    <div className="px-8 pt-6 pb-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3">Payment Method</p>
                        <div className={`grid gap-3 mb-2 ${invoice?.enabledCryptoWallet !== false && invoice?.enabledBinancePay !== false ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {/* Crypto option */}
                            {invoice?.enabledCryptoWallet !== false && (
                                <button
                                    onClick={() => setPaymentMethod('crypto')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${paymentMethod === 'crypto'
                                        ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                                        }`}
                                >
                                    <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024" className="w-7 h-7" alt="Crypto" />
                                    <div className="text-left">
                                        <p className={`font-black text-sm leading-none mb-0.5 ${paymentMethod === 'crypto' ? 'text-indigo-700' : 'text-slate-800'}`}>Crypto</p>
                                        <p className="text-[10px] text-slate-400 font-medium">BTC, USDT, ETH…</p>
                                    </div>
                                    {paymentMethod === 'crypto' && <div className="ml-auto w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-white stroke-[3px]" /></div>}
                                </button>
                            )}

                            {/* Binance Pay option */}
                            {invoice?.enabledBinancePay !== false && (
                                <button
                                    onClick={() => setPaymentMethod('binance')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${paymentMethod === 'binance'
                                        ? 'border-[#F0B90B] bg-[#FFFBEB] shadow-md shadow-yellow-100'
                                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                                        }`}
                                >
                                    {/* Binance brand logo */}
                                    <div className="w-7 h-7 shrink-0 rounded-lg bg-[#F0B90B] flex items-center justify-center shadow-sm">
                                        <img src="/binance-logo.svg" alt="Binance" className="w-[18px] h-[18px]" />
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-black text-sm leading-none mb-0.5 ${paymentMethod === 'binance' ? 'text-[#B8860B]' : 'text-slate-800'}`}>Binance Pay</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Pay via ID</p>
                                    </div>
                                    {paymentMethod === 'binance' && <div className="ml-auto w-5 h-5 bg-[#F0B90B] rounded-full flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-[#1E2026] stroke-[3px]" /></div>}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {status === 'SELECT_CRYPTO' && invoice?.enabledCryptoWallet === false && invoice?.enabledBinancePay === false && (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Layers className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-black text-lg mb-2">No Payment Methods</h3>
                        <p className="text-slate-500 text-sm">The merchant has not enabled any payment methods for this checkout.</p>
                    </div>
                )}

                {/* SELECT CRYPTO VIEW */}
                {status === 'SELECT_CRYPTO' && paymentMethod === 'crypto' && (
                    <div className="p-8">
                        <div className="mb-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[2px] text-slate-400 ml-1">{t('selectPayment')}</h2>
                        </div>

                        <div className="space-y-6 mb-10">
                            {/* Step 1: Select Coin */}
                            <div className="relative">
                                <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-[2px] ml-1">{t('chooseCurrency')}</label>
                                <button
                                    onClick={() => { setIsCoinDropdownOpen(!isCoinDropdownOpen); setIsNetworkDropdownOpen(false); }}
                                    className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-500 transition-all duration-300 group shadow-sm active:bg-slate-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center p-2 group-hover:bg-indigo-50 transition drop-shadow-sm">
                                            <img src={selectedCoinObj.logo} alt={selectedCoinObj.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-slate-900 text-lg leading-none">{selectedCoinObj.name}</p>
                                        </div>
                                    </div>
                                    <ChevronDown className={`w-6 h-6 text-slate-300 transition-transform duration-300 ${isCoinDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isCoinDropdownOpen && (
                                    <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white border border-slate-200 rounded-[32px] shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-4 border-b border-slate-100">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder={t('searchCoin')}
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-2">
                                            {uniqueCoins.map((coin) => (
                                                <button
                                                    key={coin.name}
                                                    onClick={() => {
                                                        setSelectedCoin(coin.name);
                                                        const firstNet = CURRENCIES.find(c => c.name === coin.name);
                                                        if (firstNet) setPayCurrency(firstNet.id);
                                                        setIsCoinDropdownOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className={`w-full flex items-center gap-3 p-2 hover:bg-slate-50 transition rounded-xl mb-0.5 last:mb-0 ${selectedCoin === coin.name ? 'bg-indigo-50' : ''}`}
                                                >
                                                    <div className="w-7 h-7 flex items-center justify-center p-1 bg-white rounded-lg shadow-sm border border-slate-100">
                                                        <img src={coin.logo} alt={coin.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <p className="font-bold text-slate-900 text-xs">{coin.name}</p>
                                                    </div>
                                                    {selectedCoin === coin.name && <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white stroke-[3px]" /></div>}
                                                </button>
                                            ))}
                                            {uniqueCoins.length === 0 && (
                                                <div className="p-8 text-center">
                                                    <p className="text-slate-400 font-bold text-sm italic">{t('noCoinFound')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Select Network (only show if active coin has multiple nets) */}
                            {availableNetworks.length > 0 && (
                                <div className="relative animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-[2px] ml-1">{t('chooseNetwork')}</label>
                                    <button
                                        onClick={() => { setIsNetworkDropdownOpen(!isNetworkDropdownOpen); setIsCoinDropdownOpen(false); }}
                                        className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-500 transition-all duration-300 group shadow-sm active:bg-slate-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center p-2 group-hover:bg-indigo-50 transition overflow-hidden shadow-inner">
                                                <img src={selectedNetworkObj?.netLogo} alt="Network" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-slate-900 leading-none">{selectedNetworkObj?.network}</p>
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-6 h-6 text-slate-300 transition-transform duration-300 ${isNetworkDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isNetworkDropdownOpen && (
                                        <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white border border-slate-200 rounded-[32px] shadow-2xl z-[90] overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2">
                                            {availableNetworks.map((net) => (
                                                <button
                                                    key={net.id}
                                                    onClick={() => { setPayCurrency(net.id); setIsNetworkDropdownOpen(false); }}
                                                    className={`w-full flex items-center gap-3 p-2 hover:bg-slate-50 transition rounded-xl mb-0.5 last:mb-0 ${payCurrency === net.id ? 'bg-indigo-50' : ''}`}
                                                >
                                                    <div className="w-7 h-7 flex items-center justify-center p-1 bg-white rounded-lg shadow-sm border border-slate-100">
                                                        <img src={net.netLogo} alt={net.network} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <p className="font-bold text-slate-900 text-xs">{net.network}</p>
                                                    </div>
                                                    {payCurrency === net.id && <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white stroke-[3px]" /></div>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* TOTAL AMOUNT CARD - Positioned above Proceed button */}
                        <div className="bg-[#0c0e12] rounded-[36px] p-7 mb-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/10 border border-white/5">
                            <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-600/20 rounded-full blur-[80px]" />
                            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-emerald-600/10 rounded-full blur-[80px]" />

                            <div className="relative z-10">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[3px] mb-4 opacity-80">{t('totalToPay')}</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black tracking-tighter leading-none">{invoice.amount}</span>
                                    <span className="text-slate-400 font-black text-2xl tracking-tight">{invoice.currency}</span>
                                </div>
                                <div className="mt-8 flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#0c0e12] shadow-xl">
                                            <Check className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-[#0c0e12] shadow-xl">
                                            <Clock className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GLOBAL SECURE PROTOCOL</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSelectCrypto}
                            disabled={generating}
                            className="w-full bg-indigo-600 text-white font-black text-base py-3 px-8 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-indigo-600/20 transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                        >
                            {generating ? (
                                <><Loader2 className="w-6 h-6 animate-spin" /> {t('generating')}</>
                            ) : (
                                t('proceedToPayment')
                            )}
                        </button>
                    </div>
                )}

                {/* BINANCE PAY SELECT VIEW */}
                {status === 'SELECT_CRYPTO' && paymentMethod === 'binance' && (
                    <div className="p-8 pt-4 animate-in fade-in duration-300">
                        {/* Binance Brand Hero Card */}
                        <div className="bg-[#1E2026] rounded-[28px] p-6 mb-5 relative overflow-hidden shadow-2xl shadow-black/20">
                            {/* Gold glow */}
                            <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#F0B90B]/20 rounded-full blur-2xl" />
                            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-[#F0B90B]/10 rounded-full blur-xl" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    {/* Binance brand logo */}
                                    <div className="w-12 h-12 rounded-2xl bg-[#F0B90B] flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                        <img src="/binance-logo.svg" alt="Binance" className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-lg leading-none tracking-tight">Binance Pay</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                            <p className="text-emerald-400 text-[11px] font-bold">Individual Gateway</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Send the exact amount to the merchant's Binance Pay ID. Include the unique Note in your transfer for automatic verification.
                                </p>
                            </div>
                        </div>

                        {/* Amount Card */}
                        <div className="flex items-center justify-between p-5 bg-[#F0B90B]/10 border-2 border-[#F0B90B]/30 rounded-2xl mb-5">
                            <div>
                                <p className="text-[10px] text-[#B8860B] font-black uppercase tracking-[3px] mb-1">{t('totalToPay')}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tighter text-slate-900">{invoice.amount}</span>
                                    <span className="text-slate-500 font-black text-lg">{invoice.currency}</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-[#F0B90B] flex items-center justify-center shadow-lg shadow-yellow-400/30">
                                <img src="/binance-logo.svg" alt="Binance" className="w-9 h-9" />
                            </div>
                        </div>

                        <button
                            onClick={handleBinancePay}
                            disabled={generating}
                            className="w-full bg-[#F0B90B] hover:bg-[#e6b000] active:bg-[#d4a000] text-[#1E2026] font-black text-base py-4 px-8 rounded-2xl disabled:opacity-50 transition-all duration-200 shadow-xl shadow-yellow-400/20 flex items-center justify-center gap-3 tracking-wide"
                        >
                            {generating ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Getting Pay Details…</>
                            ) : (
                                <>
                                    <img src="/binance-logo.svg" alt="Binance" className="w-5 h-5" />
                                    Continue with Binance Pay
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* BINANCE WAITING VIEW - Premium Design */}
                {status === 'BINANCE_WAITING' && (
                    <div className="animate-in fade-in duration-500">
                        {/* Amount Header */}
                        <div className="px-6 pt-6 pb-2 bg-white z-30 relative">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h1 className="text-3xl font-black tracking-tight text-slate-900 tabular-nums">{binanceAmount}</h1>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-lg font-black text-slate-900 underline decoration-[#F0B90B]/40 decoration-3 underline-offset-4">USDT</span>
                                            <button onClick={() => { navigator.clipboard.writeText(String(binanceAmount)); setCopiedAmount(true); setTimeout(() => setCopiedAmount(false), 2000); }} className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition active:scale-90">
                                                {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mb-3">{invoice?.amount} {invoice?.currency}</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gateway •</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3.5 h-3.5 rounded bg-[#F0B90B] flex items-center justify-center">
                                                <img src="/binance-logo.svg" alt="" className="w-2.5 h-2.5" />
                                            </div>
                                            <span className="text-[10px] font-black text-[#B8860B] uppercase tracking-widest">Binance Pay</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Card */}
                        <div className="px-6 pb-6 z-20 relative">
                            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_32px_rgba(0,0,0,0.04)] overflow-hidden">
                                {/* QR + Pay ID Row */}
                                <div className="p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-b border-slate-100/60">
                                    {/* Binance Pay Amount Card (QR not supported by Binance for external generation) */}
                                    <div className="shrink-0 w-[120px] h-[120px] rounded-2xl bg-[#1E2026] flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#F0B90B]/15 rounded-full blur-xl" />
                                        <div className="absolute -left-3 -bottom-3 w-12 h-12 bg-[#F0B90B]/10 rounded-full blur-lg" />
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="w-10 h-10 rounded-xl bg-[#F0B90B] flex items-center justify-center mb-2 shadow-md shadow-yellow-500/20">
                                                <img src="/binance-logo.svg" alt="Binance" className="w-6 h-6" />
                                            </div>
                                            <p className="text-white font-black text-lg tabular-nums leading-none">{binanceAmount}</p>
                                            <p className="text-[#F0B90B] text-[10px] font-bold mt-0.5">USDT</p>
                                        </div>
                                    </div>

                                    {/* Pay ID Details */}
                                    <div className="flex-1 text-center sm:text-left flex flex-col justify-center w-full mt-1 sm:mt-0 overflow-hidden">
                                        <p className="text-xs font-medium text-slate-500 mb-1">Binance Pay ID</p>
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-3 max-w-full">
                                            <p className="font-mono text-sm font-semibold text-slate-800 truncate">{binancePayId}</p>
                                            <button onClick={() => { navigator.clipboard.writeText(binancePayId); setCopiedBinanceId(true); setTimeout(() => setCopiedBinanceId(false), 2000); }} className="shrink-0 text-slate-400 hover:text-[#F0B90B] transition-colors active:scale-90 p-0.5">
                                                {copiedBinanceId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {/* Note / Reference - Important! */}
                                        <div className="bg-[#FFFBEB] border-2 border-[#F0B90B]/30 rounded-xl p-2.5 mb-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[9px] text-[#B8860B] font-black uppercase tracking-widest mb-0.5">⚠ Note (Required!)</p>
                                                    <p className="font-black text-slate-900 text-base font-mono leading-none">{binanceNote}</p>
                                                </div>
                                                <button onClick={() => { navigator.clipboard.writeText(binanceNote); setCopiedNote(true); setTimeout(() => setCopiedNote(false), 2000); }} className="shrink-0 w-7 h-7 bg-white border border-[#F0B90B]/40 rounded-lg flex items-center justify-center hover:bg-[#FFFBEB] transition active:scale-90">
                                                    {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[#B8860B]" />}
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-slate-400 leading-relaxed">Include the Note when sending via Binance Pay.</p>
                                    </div>
                                </div>

                                {/* Status Grid */}
                                <div className="grid grid-cols-2 divide-x divide-slate-100/60 bg-[#fbfcff]/50">
                                    {/* Timer */}
                                    <div className="p-4 flex items-center gap-3">
                                        <div className="relative w-9 h-9 shrink-0">
                                            {isInitialLoad ? (
                                                <div className="w-full h-full rounded-full bg-slate-100 animate-pulse" />
                                            ) : (
                                                <div className="w-full h-full animate-[spin_8s_linear_infinite]">
                                                    <svg className="w-full h-full -rotate-90">
                                                        <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="2" />
                                                        <circle cx="18" cy="18" r="16" fill="transparent" stroke="#F0B90B" strokeWidth="2" strokeDasharray="100.5" strokeDashoffset={100.5 - (100.5 * Math.max(0, timeLeft) / (status === 'BINANCE_WAITING' ? 7200 : 10800))} strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[11px] font-medium text-slate-500">Time Left</p>
                                            <p className="text-[#B8860B] font-bold text-xs tabular-nums">
                                                {isInitialLoad ? "--:--:--" : formatTime(timeLeft)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Animation */}
                                    <div className="p-4 flex items-center gap-3">
                                        <div className="relative w-9 h-9 shrink-0 flex items-center justify-center animate-[spin_3s_linear_infinite]">
                                            <div className="relative w-6 h-6">
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#F0B90B] rounded-full shadow-[0_0_6px_rgba(240,185,11,0.6)]" />
                                                <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-[#d4a000] rounded-full shadow-[0_0_6px_rgba(212,160,0,0.6)]" />
                                                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#B8860B] rounded-full shadow-[0_0_6px_rgba(184,134,11,0.6)]" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[11px] font-medium text-slate-500">Status</p>
                                            <p className="text-[#B8860B] font-bold text-xs">Awaiting</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verify Section */}
                            <div className="mt-4">
                                {verifyMessage && (
                                    <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 animate-in fade-in duration-300">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <p className="text-emerald-700 font-bold text-xs">{verifyMessage}</p>
                                    </div>
                                )}
                                {verifyError && (
                                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-2xl animate-in fade-in duration-300">
                                        <p className="text-red-700 font-bold text-xs leading-relaxed">{verifyError}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleBinanceVerify}
                                    disabled={verifying}
                                    className="w-full bg-[#F0B90B] hover:bg-[#e6b000] text-[#1E2026] font-black text-xs py-3.5 px-6 rounded-2xl disabled:opacity-60 transition-all duration-200 shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95"
                                >
                                    {verifying ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Checking Binance…</>
                                    ) : (
                                        <><CheckCircle2 className="w-4 h-4" /> I've Paid – Verify Now</>
                                    )}
                                </button>
                                <p className="text-center text-[9px] text-slate-400 font-medium mt-2">Reads your Binance Pay history to confirm payment. May take 1–2 min after sending.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* WAITING VIEW - Premium Layout */}
                {status === 'WAITING' && (
                    <div className="animate-in fade-in duration-500">
                        {/* Summary Header */}
                        <div className="px-8 pt-8 pb-4 bg-white z-30 relative">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-4xl font-black tracking-tight text-slate-900 tabular-nums">{payAmount}</h1>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-black text-slate-900 underline decoration-indigo-500/30 decoration-4 underline-offset-4">{selectedCoin}</span>
                                            <button onClick={() => copyToClipboard(payAmount?.toString() || '', 'amount')} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition active:scale-90 shadow-sm">
                                                {copiedAmount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 mb-6">{invoice.amount} {invoice.currency}</p>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('networkFix')} •</span>
                                            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">{selectedNetworkObj?.network}</span>
                                            {selectedNetworkObj?.netLogo && <img src={selectedNetworkObj.netLogo} alt="net" className="w-3.5 h-3.5 ml-0.5 object-contain" />}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <HelpCircle className="w-3.5 h-3.5 opacity-50" />
                                            <span className="text-[11px] font-bold">{t('youPayNetFee')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition shadow-sm"><HelpCircle className="w-[22px] h-[22px] text-slate-800" /></button>
                                    <div className="relative">
                                        <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition shadow-sm ${isSettingsOpen ? 'bg-slate-50' : ''}`}>
                                            <Settings className="w-[22px] h-[22px] text-slate-800" />
                                        </button>

                                        {isSettingsOpen && (
                                            <div className="absolute right-0 top-[calc(100%+8px)] w-[280px] sm:w-[320px] bg-white rounded-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200 mt-1">
                                                {!showLanguageMenu ? (
                                                    <div className="flex flex-col">
                                                        <button
                                                            onClick={() => setShowLanguageMenu(true)}
                                                            className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 text-left cursor-pointer group"
                                                        >
                                                            <Globe className="w-[22px] h-[22px] text-slate-900 shrink-0" />
                                                            <div className="flex-1">
                                                                <div className="text-slate-900 font-medium text-[15px]">{t('languageTitle')}</div>
                                                                <div className="text-slate-500 text-[13px] mt-0.5">{selectedLanguage}</div>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-slate-900 shrink-0 transition-transform group-hover:translate-x-0.5" />
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setIsSettingsOpen(false);
                                                                setShowEmailInput(true);
                                                            }}
                                                            className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                                                        >
                                                            <Bell className="w-[22px] h-[22px] text-slate-900 shrink-0" />
                                                            <div className="flex-1">
                                                                <div className="text-slate-900 font-medium text-[15px]">{t('notifyTitle')}</div>
                                                                <div className="text-slate-500 text-[13px] leading-[1.3] mt-0.5">{t('whenPaymentStatus')}</div>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-slate-900 shrink-0 transition-transform group-hover:translate-x-0.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
                                                            <button
                                                                onClick={() => setShowLanguageMenu(false)}
                                                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors group hover:bg-slate-100"
                                                            >
                                                                <ChevronLeft className="w-5 h-5 text-slate-800 transition-transform group-hover:-translate-x-0.5" />
                                                            </button>
                                                            <span className="font-extrabold text-slate-900 text-[16px]">{t('selectLangHeading')}</span>
                                                        </div>
                                                        <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-3 bg-white">
                                                            {['English', 'Spanish (Español)', 'French (Français)', 'German (Deutsch)', 'Russian (Русский)', 'Chinese (中文)', 'Japanese (日本語)', 'Korean (한국어)', 'Arabic (العربية)', 'Portuguese (Português)', 'Hindi (हिन्दी)'].map((lang) => (
                                                                <button
                                                                    key={lang}
                                                                    onClick={() => {
                                                                        setSelectedLanguage(lang);
                                                                        setShowLanguageMenu(false);
                                                                        setIsSettingsOpen(false);
                                                                    }}
                                                                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all mb-1 last:mb-0 text-left ${selectedLanguage === lang ? 'bg-[#f4f6fc] text-[#4f39f6] font-bold' : 'hover:bg-slate-50 text-slate-600 font-medium'}`}
                                                                >
                                                                    <span className="text-[14px]">{lang}</span>
                                                                    {selectedLanguage === lang && <Check className="w-5 h-5 text-[#4f39f6] stroke-[3px]" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Payment Card Wrapper */}
                        <div className="px-8 pb-8 z-20 relative">
                            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
                                {/* QR + Address Row */}
                                <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 border-b border-slate-100/60">
                                    {/* QR Code */}
                                    <div className="shrink-0 bg-white p-2 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-center">
                                        {qrCodeDataUrl ? (
                                            <img src={qrCodeDataUrl} alt="QR Code" className="w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] rounded-xl" />
                                        ) : (
                                            <div className="w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] bg-slate-50 animate-pulse rounded-xl" />
                                        )}
                                    </div>

                                    {/* Address Details */}
                                    <div className="flex-1 text-center sm:text-left flex flex-col justify-center sm:pt-2 w-full mt-2 sm:mt-0 overflow-hidden">
                                        <p className="text-sm font-medium text-slate-500 mb-1.5">{t('recipientAddress')}</p>
                                        <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-4 max-w-full">
                                            <p className="font-mono text-base font-semibold text-slate-800 truncate">{payAddress}</p>
                                            <button onClick={() => copyToClipboard(payAddress, 'address')} className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors active:scale-90 p-1">
                                                {copiedAddress ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>

                                        <p className="text-[13px] text-slate-500 leading-relaxed sm:max-w-[90%]">
                                            {t('whenPaymentStatus')} {" "}
                                            {!emailSaved ? (
                                                <button onClick={() => setShowEmailInput(true)} className="text-indigo-600 font-medium hover:underline">{t('leaveEmail')}</button>
                                            ) : (
                                                <span className="text-emerald-600 font-medium">{t('active')}</span>
                                            )}
                                        </p>

                                        {showEmailInput && !emailSaved && (
                                            <div className="mt-4 flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-300 w-full sm:max-w-xs mx-auto sm:mx-0">
                                                <input
                                                    type="email"
                                                    value={customerEmail}
                                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                                    placeholder="email@example.com"
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm"
                                                    autoFocus
                                                />
                                                <button onClick={handleSaveEmail} className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-black shadow-lg shadow-slate-900/10 active:scale-95 transition hover:bg-black">{t('save')}</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status Grid - Horizontal Layout */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100/60 bg-[#fbfcff]/50">

                                    <div className="p-6 flex items-center justify-center sm:justify-start gap-4">
                                        <div className="relative w-10 h-10 shrink-0">
                                            <div className="w-full h-full animate-[spin_8s_linear_infinite]">
                                                <svg className="w-full h-full -rotate-90">
                                                    <circle cx="20" cy="20" r="18" fill="transparent" stroke="#f1f5f9" strokeWidth="2.5" />
                                                    <circle cx="20" cy="20" r="18" fill="transparent" stroke="#10b981" strokeWidth="2.5" strokeDasharray="113.1" strokeDashoffset={113.1 - (113.1 * Math.max(0, timeLeft) / 10800)} strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <p className="text-[13px] font-medium text-slate-600 mb-0.5">{t('expirationTime')}</p>
                                            <p className="text-emerald-500 font-bold text-sm tabular-nums">{formatTime(timeLeft)}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 flex items-center justify-center sm:justify-start gap-4">
                                        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center animate-[spin_3s_linear_infinite]">
                                            <div className="relative w-7 h-7">
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                                <div className="absolute bottom-0.5 left-0 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                                <div className="absolute bottom-0.5 right-0 w-2 h-2 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <p className="text-[13px] font-medium text-slate-600">{t('confirmations')}</p>
                                                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                                            </div>
                                            <p className="text-emerald-500 font-bold text-sm tabular-nums">0 {t('from')} 3</p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Test Mode Simulation Button */}
                            {invoice?.isTestMode && status === 'WAITING' && (
                                <div className="mt-6 px-8 animate-in slide-in-from-bottom-4 duration-500">
                                    <button
                                        onClick={async () => {
                                            if (confirm("Simulate successful payment for this test transaction?")) {
                                                try {
                                                    const res = await fetch(`/api/checkout/${invoiceId}/simulate-success`, { method: 'POST' });
                                                    if (res.ok) {
                                                        fetchInvoice();
                                                    }
                                                } catch (e) {
                                                    alert("Simulation failed");
                                                }
                                            }
                                        }}
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest active:scale-95"
                                    >
                                        <CheckCircle2 className="w-5 h-5" /> Simulate Success
                                    </button>
                                    <p className="text-[10px] text-amber-600 font-bold text-center mt-3 uppercase tracking-widest opacity-70">
                                        Sandbox Mode: This button is only for testing
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {/* PAID STATUS VIEW */}
                {status === 'PAID' && (
                    <div className="p-20 text-center animate-in zoom-in-95 fade-in duration-700">
                        <div className="relative w-40 h-40 mx-auto mb-12">
                            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse blur-3xl scale-150 opacity-50" />
                            <div className="relative w-40 h-40 bg-emerald-500 rounded-[48px] flex items-center justify-center shadow-[0_25px_60px_rgba(16,185,129,0.5)] animate-[bounce_2s_ease-in-out_infinite_alternate] transform rotate-12">
                                <Check className="w-20 h-20 text-white stroke-[6]" />
                            </div>
                        </div>
                        <h3 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">{t('paid')}</h3>
                        <p className="text-slate-500 text-xl mb-14 max-w-[320px] mx-auto font-bold leading-snug">{t('successMessage')}</p>

                        <button className="w-full max-w-xs bg-slate-900 text-white font-black py-6 px-10 rounded-3xl hover:bg-black transform hover:scale-[1.05] active:scale-[0.95] transition-all shadow-2xl shadow-slate-900/40 text-lg uppercase tracking-[4px]">
                            {t('continueBtn')}
                        </button>
                    </div>
                )}

            </div>

            {/* Bottom Footer */}
            <div className="mt-12 flex flex-col items-center gap-8">
                <div className="flex items-center gap-10 opacity-30 hover:opacity-100 transition-opacity duration-700">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] cursor-pointer hover:text-slate-900">AML/KYC</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] cursor-pointer hover:text-slate-900">Terms</span>
                </div>

                <div className="flex flex-col items-center group cursor-default">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[6px] mb-4 group-hover:text-slate-400 transition-colors">Infrastructure by</p>
                    <div className="flex items-center gap-2.5 opacity-20 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-110">
                        <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center">
                            < Globe className="w-3.5 h-3.5 text-white stroke-[3px]" />
                        </div>
                        <span className="text-base font-black tracking-[-1px] text-slate-900">ORIYOTO GATEWAY</span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
