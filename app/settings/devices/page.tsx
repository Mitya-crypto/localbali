'use client';

export default function DevicesSettingsPage() {
  return (
    <main style={{ minHeight: '100svh', background: '#f7f8fa', padding: 24, fontFamily: 'system-ui' }}>
      <section style={{ maxWidth: 480, margin: '0 auto', background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Devices</h1>
        <p style={{ marginTop: 12, color: '#64748b', lineHeight: 1.5 }}>
          Manage the devices authorized to access your account. Device management features will be available soon.
        </p>
      </section>
    </main>
  );
}
