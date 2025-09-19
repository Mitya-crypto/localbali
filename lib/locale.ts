export type Lang = 'ru' | 'en' | 'id';

const dict: Record<Lang, Record<string, Record<string, string>>> = {
  ru: {
    quick: { topup:'Пополнить', send:'Отправить', exchange:'Обмен валют', pay:'Оплата', aria:'Быстрые действия' },
    home: { total_balance:'Общий баланс', toggle_balance:'Показать/скрыть баланс', hidden_amount:'• • • ₽', quick_actions:'Быстрые действия', action_topup:'Пополнить', action_send:'Отправить', action_sell:'Обмен', action_pay:'Оплата', promo_title:'До 30% комиссии', promo_sub:'за платежи друзей по вашей ссылке', promo_cta:'Пригласить', soon:'Скоро', asset_badge_new:'NEW' },
    profile:{ title:'Профиль', ref:'Реферальная программа', settings:'Параметры', about:'О нас', kyc:'KYC верификация', email:'E-mail', email_add:'Добавить', email_verify:'Подтвердить', email_ok:'Подтверждён', wallets:'Кошельки', devices:'Устройства', language:'Язык', logout:'Выйти из аккаунта' },
    security:{ title:'Безопасность', subtitle:'E-mail, PIN, приватность', pin_on:'PIN: включён', pin_off:'PIN: выключен', hide_on:'Скрывать баланс: да', hide_off:'Скрывать баланс: нет', toggle_pin:'Переключить PIN', toggle_hide:'Скрывать баланс' },
    lang:{ title:'Язык', ru:'Русский', en:'English', id:'Bahasa Indonesia' }
  },
  en: {
    quick: { topup:'Top up', send:'Send', exchange:'Exchange', pay:'Pay', aria:'Quick actions' },
    home: { total_balance:'Total balance', toggle_balance:'Show/Hide balance', hidden_amount:'• • •', quick_actions:'Quick actions', action_topup:'Top up', action_send:'Send', action_sell:'Exchange', action_pay:'Pay', promo_title:'Up to 30% commission', promo_sub:"from each friend's payment", promo_cta:'Invite', soon:'Soon', asset_badge_new:'NEW' },
    profile:{ title:'Profile', ref:'Referral program', settings:'Settings', about:'About', kyc:'KYC verification', email:'E-mail', email_add:'Add', email_verify:'Verify', email_ok:'Verified', wallets:'Wallets', devices:'Devices', language:'Language', logout:'Log out' },
    security:{ title:'Security', subtitle:'E-mail, PIN, privacy', pin_on:'PIN: on', pin_off:'PIN: off', hide_on:'Hide balance: yes', hide_off:'Hide balance: no', toggle_pin:'Toggle PIN', toggle_hide:'Hide balance' },
    lang:{ title:'Language', ru:'Русский', en:'English', id:'Bahasa Indonesia' }
  },
  id: {
    quick: { topup:'Isi ulang', send:'Kirim', exchange:'Tukar', pay:'Bayar', aria:'Aksi cepat' },
    home: { total_balance:'Saldo total', toggle_balance:'Tampil/sembunyi saldo', hidden_amount:'• • •', quick_actions:'Aksi cepat', action_topup:'Isi ulang', action_send:'Kirim', action_sell:'Tukar', action_pay:'Bayar', promo_title:'Hingga 30% komisi', promo_sub:'dari pembayaran teman Anda', promo_cta:'Undang', soon:'Segera', asset_badge_new:'BARU' },
    profile:{ title:'Profil', ref:'Program rujukan', settings:'Pengaturan', about:'Tentang', kyc:'Verifikasi KYC', email:'E-mail', email_add:'Tambah', email_verify:'Verifikasi', email_ok:'Terverifikasi', wallets:'Dompet', devices:'Perangkat', language:'Bahasa', logout:'Keluar' },
    security:{ title:'Keamanan', subtitle:'E-mail, PIN, privasi', pin_on:'PIN: aktif', pin_off:'PIN: nonaktif', hide_on:'Sembunyikan saldo: ya', hide_off:'Sembunyikan saldo: tidak', toggle_pin:'Alihkan PIN', toggle_hide:'Sembunyikan saldo' },
    lang:{ title:'Bahasa', ru:'Русский', en:'English', id:'Bahasa Indonesia' }
  }
};

export function getLang(): Lang {
  try {
    const raw = (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'ru';
    const v = String(raw).toLowerCase();
    return (v === 'en' || v === 'id') ? (v as Lang) : 'ru';
  } catch { return 'ru'; }
}

export function setLang(l: Lang) {
  try {
    localStorage.setItem('lang', l);
    window.dispatchEvent(new CustomEvent('i18n:changed', { detail: l }));
  } catch {}
}

/** t(ns,key): если ключ не найден — возвращаем сам key */
export function t(ns: string, key: string): string {
  const l = getLang();
  return dict[l]?.[ns]?.[key] ?? key;
}
