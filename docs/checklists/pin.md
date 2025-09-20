# PIN checklist

- Confirm the PIN keypad unlock flow sets `localStorage.pin_ok = '1'` and immediately redirects to the `ref` route (or `/home` when no ref is provided).
- Verify biometric unlock mirrors the manual flow by setting `pin_ok` and performing the same redirect on success.
- After unlocking, the standalone `/pin` screen should close and leave the user on the protected destination.
