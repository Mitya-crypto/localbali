import { NextRequest, NextResponse } from 'next/server';
import { validateEmailFormat } from '../../../../lib/email-util';
import { sendVerificationEmail, EmailConfigError } from '../../../../lib/server/email-sender';

export const runtime = 'nodejs';

export async function POST(request: NextRequest){
  try {
    const body = await request.json().catch(()=>null) as { email?: string; code?: string; locale?: string } | null;
    const email = body?.email?.trim();
    const code = body?.code?.trim();
    const locale = body?.locale;

    if(!email || !code){
      return NextResponse.json({ error: 'E-mail и код обязательны' }, { status: 400 });
    }
    if(!validateEmailFormat(email)){
      return NextResponse.json({ error: 'Некорректный e-mail' }, { status: 400 });
    }
    if(!/^\d{6}$/.test(code)){
      return NextResponse.json({ error: 'Некорректный код подтверждения' }, { status: 400 });
    }

    await sendVerificationEmail({ email, code, locale });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('[email:send-code]', err);
    const status = err instanceof EmailConfigError ? 500 : 502;
    const fallback = status === 500
      ? 'Почтовый сервис не настроен. Обратитесь к администратору.'
      : 'Не удалось отправить письмо. Попробуйте позже.';
    const message = err instanceof EmailConfigError
      ? fallback
      : err instanceof Error && err.message ? err.message : fallback;
    return NextResponse.json({ error: message }, { status });
  }
}
