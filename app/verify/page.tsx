'use client';

const features = [
  {
    icon: '⚡️',
    title: 'Мгновенные крипто-платежи',
    description: 'Переводы в TON и USDT между кошельками за секунды прямо в Telegram.',
  },
  {
    icon: '🤝',
    title: 'P2P-обмен с гарантией',
    description: 'Безопасные сделки с проверенными партнёрами и поддержкой арбитража.',
  },
  {
    icon: '🎁',
    title: 'Кэшбэк и автоматизация',
    description: 'Награды за активность, напоминания и шаблоны операций для бизнеса.',
  },
];

export default function Verify() {
  return (
    <main
      data-testid="welcome-screen"
      style={{
        minHeight: '100svh',
        width: '100%',
        background: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'calc(env(safe-area-inset-top, 0px) + 32px) 24px calc(env(safe-area-inset-bottom, 0px) + 32px)',
        gap: 32,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          maxWidth: 440,
        }}
      >
        <span
          style={{
            fontSize: 12,
            letterSpacing: '.24em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          CryptoBali бот
        </span>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            lineHeight: 1.15,
          }}
        >
          Добро пожаловать в CryptoBali
        </h1>
        <p
          style={{
            margin: 0,
            color: 'var(--muted)',
            fontSize: 16,
            lineHeight: 1.5,
          }}
        >
          Управляйте криптовалютой, обменом и платежами в одном мини-приложении Telegram. Здесь всё, что нужно трейдерам и бизнесу, чтобы работать без лишних приложений.
        </p>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 28,
          padding: '28px 24px',
          boxShadow: 'var(--shadow)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div
          aria-hidden
          style={{
            alignSelf: 'center',
            width: '72%',
            maxWidth: 260,
            aspectRatio: '1 / 1',
            borderRadius: 32,
            background:
              'radial-gradient(circle at 30% 20%, rgba(74,209,255,.45), transparent 60%), linear-gradient(135deg, rgba(6,182,212,.25), rgba(14,165,233,.15))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 32px 60px rgba(14,165,233,.25)',
          }}
        >
          <span style={{ fontSize: 64, transform: 'translateY(-6px)' }}>🤖</span>
        </div>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            textAlign: 'left',
          }}
        >
          {features.map(({ icon, title, description }) => (
            <li
              key={title}
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <span
                aria-hidden
                style={{
                  flex: '0 0 auto',
                  width: 36,
                  height: 36,
                  borderRadius: 14,
                  background: 'var(--accent-weak)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                }}
              >
                {icon}
              </span>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <span style={{ fontWeight: 600 }}>{title}</span>
                <span
                  style={{
                    fontSize: 14,
                    color: 'var(--muted)',
                    lineHeight: 1.4,
                  }}
                >
                  {description}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <a
          data-testid="welcome-primary-cta"
          href="/home"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '14px 18px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, #4ad1ff, #7af0ff)',
            color: '#02202d',
            fontWeight: 700,
            fontSize: 16,
            textDecoration: 'none',
            boxShadow: '0 18px 38px rgba(74,209,255,.35)',
          }}
        >
          Продолжить в приложение
        </a>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: 'var(--muted)',
            lineHeight: 1.5,
          }}
        >
          Нужен доступ с другого устройства?{' '}
          <a
            href="/support"
            style={{
              color: 'var(--accent)',
              textDecoration: 'underline',
            }}
          >
            Напишите в поддержку
          </a>{' '}
          — мы поможем подключить CryptoBali бот.
        </p>
      </div>
    </main>
  );
}
