# use-yup-hook-validate

<div align="center">

![npm version](https://img.shields.io/npm/v/use-yup-hook-validate?color=blue&label=npm&style=for-the-badge)
![CI](https://github.com/dougvil/use-yup-hook-validate/actions/workflows/ci.yml/badge.svg?style=for-the-badge)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**React form validation with Yup — without a form library.**

You keep your own state. You keep your own UI. The hook handles field validation, error sync, and form-level validity.

[Installation](#installation) · [Quick Start](#quick-start) · [How It Works](#how-it-works) · [API](#api) · [Custom Validators](#custom-yup-methods) · [Locale](#portuguese-locale)

</div>

---

## Why this package?

Most form libraries (Formik, React Hook Form, Final Form) ask you to adopt their state model, field registration, and component patterns. **use-yup-hook-validate** takes a different path:

| You already have | This hook adds |
| --- | --- |
| `useState` for form values | Per-field validation via `validateAt` |
| A Yup schema | Debounced full-form validity check |
| Your own inputs / UI library | Error sync through a callback |

**Good fit when you want:**

- Yup schemas without adopting a full form framework
- Validation on `onBlur`, `onChange`, or any trigger you choose
- Integration with Material UI, Chakra, plain HTML, or anything else
- Built-in Brazilian validators (CPF, CNPJ, phone) and pt-BR messages
- A small API surface: one hook, three return values

**Not a replacement for** form libraries that manage submission, field arrays, or complex wizard flows — it focuses on validation only.

---

## Installation

```bash
npm install use-yup-hook-validate
# peer dependency: react >= 16.8
```

```bash
yarn add use-yup-hook-validate
pnpm add use-yup-hook-validate
```

---

## Quick Start

```tsx
import { useState } from 'react';
import { useYupHookValidate, yup } from 'use-yup-hook-validate';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Required'),
  name: yup.string().required('Required'),
});

function SignUpForm() {
  const [formState, setFormState] = useState({ email: '', name: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [validateField, isFormValid, resetValidation] = useYupHookValidate({
    validationSchema: schema,
    formState,
    updateErrorsCallback: setFormErrors,
  });

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input
        value={formState.name}
        onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
        onBlur={validateField('name')}
      />
      {formErrors.name && <span>{formErrors.name}</span>}

      <input
        value={formState.email}
        onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
        onBlur={validateField('email')}
      />
      {formErrors.email && <span>{formErrors.email}</span>}

      <button type="submit" disabled={!isFormValid}>
        Submit
      </button>
    </form>
  );
}
```

---

## How It Works

```
┌─────────────┐     validateField('email')()     ┌──────────────────┐
│  Your input │ ───────────────────────────────► │  Yup validateAt  │
│  + state    │                                  │  (single field)  │
└─────────────┘                                  └────────┬─────────┘
                                                          │
                                                          ▼
┌─────────────┐     updateErrorsCallback(errors)  ┌──────────────────┐
│ formErrors  │ ◄──────────────────────────────── │  errors state    │
└─────────────┘                                   └──────────────────┘

┌─────────────┐     debounced (validationTimeout) ┌──────────────────┐
│ isFormValid │ ◄──────────────────────────────── │  Yup validate    │
└─────────────┘                                   │  (full schema)   │
                                                  └──────────────────┘
```

1. **`validateField(path)`** returns a handler you attach to `onBlur`, `onChange`, etc. When called, it validates that field against the current `formState`.
2. **`updateErrorsCallback`** receives the accumulated field errors object whenever errors change.
3. **`isFormValid`** reflects whether the **entire schema** passes — updated on a debounced schedule (default 300 ms) to avoid validating the full form on every keystroke.

---

## API

### `useYupHookValidate(options)`

#### Options

| Option | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `validationSchema` | `Yup.ObjectSchema` | Yes | — | Yup schema for the form |
| `formState` | `object` | Yes | — | Current form values (must stay in sync with inputs) |
| `updateErrorsCallback` | `(errors) => void` | No | noop | Called when field errors change |
| `validationTimeout` | `number` | No | `300` | Debounce (ms) for validation runs |

#### Returns

```tsx
const [validateField, isFormValid, resetValidation] = useYupHookValidate(options);
```

| Value | Type | Description |
| --- | --- | --- |
| `validateField` | `(fieldPath, onSuccess?) => () => void` | Factory that returns an event handler |
| `isFormValid` | `boolean` | `true` when the full schema validates |
| `resetValidation` | `() => void` | Clears errors and resets validity |

#### `validateField(fieldPath, onSuccess?)`

- **`fieldPath`** — field name or dot-notation path for nested objects (e.g. `'address.city'`).
- **`onSuccess`** — optional callback when the field passes validation.
- Returns a **zero-argument function** — no event parameter needed:

```tsx
// attach directly
<input onBlur={validateField('email')} />

// with success callback
<input onBlur={validateField('email', () => console.log('valid!'))} />

// nested field
<input onBlur={validateField('address.zipCode')} />
```

#### `resetValidation()`

Clears internal error and validity state and invokes `updateErrorsCallback({})`.

---

## Custom Yup Methods

Importing `yup` from this package registers extra string methods automatically:

| Method | Description |
| --- | --- |
| `.fullname(msg?)` | At least two non-empty name parts (e.g. first + last) |
| `.phone()` | Brazilian phone pattern `(XX) XXXXX-XXXX` |
| `.cpf(msg?)` | Brazilian CPF checksum |
| `.cnpj(msg?)` | Brazilian CNPJ checksum |
| `.cnpjOrCpf(msg?)` | Accepts either CPF or CNPJ |

```tsx
const schema = yup.object({
  name: yup.string().fullname('Enter your full name').required(),
  document: yup.string().cnpjOrCpf().required(),
  phone: yup.string().phone().required(),
});
```

Standalone helpers are also exported:

```tsx
import { isCpf, isCnpj } from 'use-yup-hook-validate';

isCpf('529.982.247-25'); // true / false
isCnpj('11.222.333/0001-81'); // true / false
```

---

## Portuguese Locale

Use the bundled pt-BR message map with Yup's `setLocale`:

```tsx
import { yup, ptBr } from 'use-yup-hook-validate';

yup.setLocale(ptBr);

const schema = yup.object({
  email: yup.string().email().required(), // "Formato de e-mail inválido", "Campo obrigatório"
});
```

---

## Examples

### Real-time validation while typing

Use a higher `validationTimeout` to debounce keystrokes:

```tsx
const [validateField] = useYupHookValidate({
  validationSchema: schema,
  formState,
  updateErrorsCallback: setFormErrors,
  validationTimeout: 500,
});

<input
  value={formState.email}
  onChange={(e) => {
    setFormState((s) => ({ ...s, email: e.target.value }));
    validateField('email')(); // debounced — safe on every change
  }}
/>
```

### Material UI

```tsx
<TextField
  value={formState.email}
  onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
  onBlur={validateField('email')}
  error={!!formErrors.email}
  helperText={formErrors.email}
/>
```

### Memoize your schema

Define the schema outside the component or wrap it in `useMemo` so it is not recreated every render:

```tsx
const schema = useMemo(
  () =>
    yup.object({
      email: yup.string().email().required(),
    }),
  []
);
```

---

## Performance Notes

The hook is designed for responsive forms without unnecessary work:

- **Debounced validation** — field and full-form checks share a single debounced scheduler (configurable via `validationTimeout`).
- **Field-only validation** — uses Yup's `validateAt` instead of re-running the full schema for each field.
- **Stable refs** — schema and form state are read from refs inside validation to avoid stale closures without extra effect churn.
- **Skipped re-renders** — error state updates are skipped when the message for a path has not changed.
- **`sideEffects: false`** — safe for tree-shaking in modern bundlers.

**Tips for consumers:**

1. Memoize `validationSchema` (see above).
2. Prefer `onBlur` over `onChange` when immediate feedback is not required.
3. Increase `validationTimeout` for large forms or slow devices.
4. Keep `updateErrorsCallback` stable (`useCallback` or pass `setState` directly).

---

## Exports

```tsx
import {
  useYupHookValidate, // default hook
  yup,                // Yup with custom methods pre-registered
  ptBr,               // Portuguese locale messages
  isCpf,
  isCnpj,
  addCustomMethods,   // register custom methods on another Yup instance
} from 'use-yup-hook-validate';
```

---

## Development

```bash
git clone https://github.com/dougvil/use-yup-hook-validate.git
cd use-yup-hook-validate
npm install
npm run build    # compile to dist/
npm run test     # Vitest
npm run lint     # ESLint
npm run watch    # watch mode
```

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

---

## License

MIT · [Douglas Viliano](https://github.com/dougvil)

<div align="center">

[Report Bug](https://github.com/dougvil/use-yup-hook-validate/issues) · [Request Feature](https://github.com/dougvil/use-yup-hook-validate/issues) · [Contribute](https://github.com/dougvil/use-yup-hook-validate/pulls)

</div>
