import nodemailer from 'nodemailer';

type Locale = 'ru' | 'en' | 'id';

type VerificationEmailOptions = {
  email: string;
  code: string;
  locale?: string;
};

export class EmailConfigError extends Error {
  constructor(message: string){
    super(message);
    this.name = 'EmailConfigError';
  }
}

let cachedTransporter: nodemailer.Transporter | null = null;

function resolveLocale(locale?: string): Locale {
  if (!locale) return 'ru';
  const normalized = locale.toLowerCase().split('-')[0] as Locale;
  return normalized === 'en' || normalized === 'id' ? normalized : 'ru';
}

function ensureTransporter(): nodemailer.Transporter {
  if (cachedTransporter) return cachedTransporter;

  const transportUrl = process.env.EMAIL_TRANSPORT_URL;
  if (transportUrl){
    cachedTransporter = nodemailer.createTransport(transportUrl);
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  if (!host){
    throw new EmailConfigError('SMTP_HOST is not configured');
  }
  const parsedPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = typeof process.env.SMTP_SECURE === 'string'
    ? ['1', 'true', 'yes'].includes(process.env.SMTP_SECURE.toLowerCase())
    : port === 465;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  return cachedTransporter;
}

function getCopy(code: string, locale?: string): { subject: string; text: string; html: string } {
  const loc = resolveLocale(locale);
  const map: Record<Locale, { subject: string; intro: string; outro: string }> = {
    ru: {
      subject: 'Код подтверждения LocalBali',
      intro: 'Используйте этот код, чтобы подтвердить свой e-mail в LocalBali.',
      outro: 'Код действует 10 минут. Если вы не запрашивали его, просто игнорируйте письмо.',
    },
    en: {
      subject: 'LocalBali verification code',
      intro: 'Use this code to confirm your e-mail address in LocalBali.',
      outro: 'The code is valid for 10 minutes. If you did not request it, you can ignore this email.',
    },
    id: {
      subject: 'Kode verifikasi LocalBali',
      intro: 'Gunakan kode ini untuk mengonfirmasi e-mail Anda di LocalBali.',
      outro: 'Kode berlaku selama 10 menit. Jika Anda tidak memintanya, abaikan email ini.',
    },
  };

  const { subject, intro, outro } = map[loc];
  const text = `${intro}\n\n${code}\n\n${outro}`;
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.4;color:#111">
      <p>${intro}</p>
      <div style="display:inline-block;padding:12px 18px;margin:12px 0;font-size:22px;font-weight:600;letter-spacing:4px;background:#f4f4f4;border-radius:8px;">${code}</div>
      <p>${outro}</p>
      <p style="margin-top:24px;font-size:12px;color:#666">LocalBali Security</p>
    </div>
  `;

  return { subject, text, html };
}

export async function sendVerificationEmail({ email, code, locale }: VerificationEmailOptions): Promise<void> {
  if (!email) throw new Error('Recipient email is required');
  if (!code) throw new Error('Verification code is required');

  const from = process.env.EMAIL_FROM;
  if (!from){
    throw new EmailConfigError('EMAIL_FROM is not configured');
  }

  const transporter = ensureTransporter();
  const { subject, text, html } = getCopy(code, locale);

  await transporter.sendMail({
    from,
    to: email,
    subject,
    text,
    html,
  });
}

