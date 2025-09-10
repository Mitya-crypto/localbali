export type Lang = 'ru'|'en'|'id'|'es'|'de';

export const LANG_LABEL: Record<Lang,string> = {
  ru:'Русский', en:'English', id:'Bahasa Indonesia', es:'Español', de:'Deutsch'
};
export const FLAGS: Record<Lang,string> = {
  ru:'🇷🇺', en:'🇬🇧', id:'🇮🇩', es:'🇪🇸', de:'🇩🇪'
};

const D = {
  ru: {
    'tab.home':'Главная','tab.history':'История','tab.scan':'QR','tab.invest':'Инвестиции','tab.profile':'Профиль',
    'profile.kyc':'KYC верификация','profile.email':'Email','profile.add':'Добавить',
    'profile.ref':'Реферальная программа','profile.promos':'Акции и промокоды',
    'profile.parameters':'Параметры','profile.security':'Безопасность','profile.language':'Язык','profile.devices':'Устройства',
    'profile.about':'О нас','profile.official':'Официальные аккаунты','profile.faq':'Часто задаваемые вопросы',
    'profile.info':'Информация','profile.support':'Обратиться в поддержку',
    'home.total':'Итоговый баланс','home.invite':'Пригласить',
    'home.promo.title':'До 30% комиссии','home.promo.sub':'с каждого платежа друга',
    'soon':'Скоро','pin.success':'Успех  PIN установлен',
    'lang.title':'Язык','lang.back':'Назад','lang.current':'Текущий','lang.saved':'Сохранено',
    'settings.security.title':'Безопасность','settings.security.email':'Email','settings.security.add':'Добавить',
    'settings.security.telegram':'Telegram','settings.security.pin':'Код-пароль','settings.security.hideBalance':'Скрывать баланс'
  },
  en: {
    'tab.home':'Home','tab.history':'History','tab.scan':'QR','tab.invest':'Invest','tab.profile':'Profile',
    'profile.kyc':'KYC verification','profile.email':'Email','profile.add':'Add',
    'profile.ref':'Referral program','profile.promos':'Promotions and promo codes',
    'profile.parameters':'Parameters','profile.security':'Security','profile.language':'Language','profile.devices':'Devices',
    'profile.about':'About us','profile.official':'Official accounts','profile.faq':'FAQ',
    'profile.info':'Information','profile.support':'Contact support',
    'home.total':'Total balance','home.invite':'Invite',
    'home.promo.title':'Up to 30% commission','home.promo.sub':"from each friend's payment",
    'soon':'Soon','pin.success':'Success  PIN code set',
    'lang.title':'Language','lang.back':'Back','lang.current':'Current','lang.saved':'Saved',
    'settings.security.title':'Security','settings.security.email':'Email','settings.security.add':'Add',
    'settings.security.telegram':'Telegram','settings.security.pin':'PIN code','settings.security.hideBalance':'Hide balance'
  },
  id: {
    'tab.home':'Beranda','tab.history':'Riwayat','tab.scan':'QR','tab.invest':'Investasi','tab.profile':'Profil',
    'profile.kyc':'Verifikasi KYC','profile.email':'Email','profile.add':'Tambah',
    'profile.ref':'Program rujukan','profile.promos':'Promosi & kode',
    'profile.parameters':'Parameter','profile.security':'Keamanan','profile.language':'Bahasa','profile.devices':'Perangkat',
    'profile.about':'Tentang kami','profile.official':'Akun resmi','profile.faq':'FAQ',
    'profile.info':'Informasi','profile.support':'Dukungan',
    'home.total':'Saldo total','home.invite':'Undang',
    'home.promo.title':'Hingga 30% komisi','home.promo.sub':'dari setiap pembayaran teman',
    'soon':'Segera','pin.success':'Sukses  PIN diatur',
    'lang.title':'Bahasa','lang.back':'Kembali','lang.current':'Saat ini','lang.saved':'Tersimpan',
    'settings.security.title':'Keamanan','settings.security.email':'Email','settings.security.add':'Tambah',
    'settings.security.telegram':'Telegram','settings.security.pin':'Kode PIN','settings.security.hideBalance':'Sembunyikan saldo'
  },
  es: {
    'tab.home':'Inicio','tab.history':'Historial','tab.scan':'QR','tab.invest':'Inversión','tab.profile':'Perfil',
    'profile.kyc':'Verificación KYC','profile.email':'Email','profile.add':'Añadir',
    'profile.ref':'Programa de referidos','profile.promos':'Promociones y cupones',
    'profile.parameters':'Parámetros','profile.security':'Seguridad','profile.language':'Idioma','profile.devices':'Dispositivos',
    'profile.about':'Sobre nosotros','profile.official':'Cuentas oficiales','profile.faq':'Preguntas frecuentes',
    'profile.info':'Información','profile.support':'Soporte',
    'home.total':'Saldo total','home.invite':'Invitar',
    'home.promo.title':'Hasta 30% de comisión','home.promo.sub':'de cada pago de un amigo',
    'soon':'Pronto','pin.success':'Éxito  PIN establecido',
    'lang.title':'Idioma','lang.back':'Atrás','lang.current':'Actual','lang.saved':'Guardado',
    'settings.security.title':'Seguridad','settings.security.email':'Email','settings.security.add':'Añadir',
    'settings.security.telegram':'Telegram','settings.security.pin':'Código PIN','settings.security.hideBalance':'Ocultar saldo'
  },
  de: {
    'tab.home':'Start','tab.history':'Verlauf','tab.scan':'QR','tab.invest':'Invest','tab.profile':'Profil',
    'profile.kyc':'KYC-Verifizierung','profile.email':'E-Mail','profile.add':'Hinzufügen',
    'profile.ref':'Empfehlungsprogramm','profile.promos':'Aktionen & Codes',
    'profile.parameters':'Parameter','profile.security':'Sicherheit','profile.language':'Sprache','profile.devices':'Geräte',
    'profile.about':'Über uns','profile.official':'Offizielle Accounts','profile.faq':'FAQ',
    'profile.info':'Information','profile.support':'Support kontaktieren',
    'home.total':'Gesamtsaldo','home.invite':'Einladen',
    'home.promo.title':'Bis zu 30% Provision','home.promo.sub':'von jeder Zahlung eines Freundes',
    'soon':'Bald','pin.success':'Erfolg  PIN gesetzt',
    'lang.title':'Sprache','lang.back':'Zurück','lang.current':'Aktuell','lang.saved':'Gespeichert',
    'settings.security.title':'Sicherheit','settings.security.email':'E-Mail','settings.security.add':'Hinzufügen',
    'settings.security.telegram':'Telegram','settings.security.pin':'PIN-Code','settings.security.hideBalance':'Saldo verbergen'
  }
} as const;

export function translate(lang: Lang, key: string): string {
  const dict = (D as any)[lang] || (D as any).en;
  return dict[key] ?? key;
}
