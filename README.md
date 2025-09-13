# 🎯 use-yup-hook-validate

<div align="center">

![npm version](https://img.shields.io/npm/v/use-yup-hook-validate?color=blue&label=npm&style=for-the-badge)
![CI](https://github.com/dougvil/use-yup-hook-validate/actions/workflows/ci.yml/badge.svg?style=for-the-badge)
![Publish](https://github.com/dougvil/use-yup-hook-validate/actions/workflows/publish.yml/badge.svg?style=for-the-badge)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**🚀 Zero-hassle React form validation with Yup**

_The simplest way to validate forms in React. No wrappers, no render props, no complexity._

**Just Yup and You!** ✨

[Installation](#-installation) • [Quick Start](#-quick-start) • [Examples](#-examples) • [API](#-api) • [Contributing](#-contributing)

</div>

---

## 🌟 Why use-yup-hook-validate?

- **🎯 Simple**: Just one hook, one schema, done!
- **⚡ Fast**: Debounced validation with performance optimization
- **🔧 Flexible**: Works with any form structure
- **📦 Lightweight**: Minimal bundle size impact
- **🛡️ Type-safe**: Full TypeScript support
- **🎨 Framework-agnostic**: No UI library dependencies

## � Installation

```bash
# npm
npm install use-yup-hook-validate

# yarn
yarn add use-yup-hook-validate

# pnpm
pnpm add use-yup-hook-validate
```

## ⚡ Quick Start

Transform your form validation from this mess:

```jsx
// ❌ The old way - complex and verbose
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});

const validateField = (name, value) => {
  // 50 lines of validation logic...
};

const handleBlur = (e) => {
  setTouched({ ...touched, [e.target.name]: true });
  validateField(e.target.name, e.target.value);
};
```

To this elegance:

```jsx
// ✅ The use-yup-hook-validate way - clean and simple
import { useYupHookValidate, yup } from 'use-yup-hook-validate';

const schema = yup.object().shape({
  email: yup.string().email().required(),
  name: yup.string().required(),
});

const [validateField, isValid] = useYupHookValidate({
  validationSchema: schema,
  formState,
  updateErrorsCallback: setFormErrors,
});
```

## 📚 Examples

### 🎨 Basic Example

```tsx
import React, { useState } from 'react';
import { useYupHookValidate, yup } from 'use-yup-hook-validate';

const ContactForm = () => {
  // 1️⃣ Define your form state
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // 2️⃣ Create your validation schema with custom methods
  const schema = yup.object().shape({
    name: yup.string().fullname('Please enter your full name').required(),
    email: yup.string().email('Invalid email format').required(),
    phone: yup.string().phone('Invalid phone number').required(),
    message: yup.string().min(10, 'Message too short').required(),
  });

  // 3️⃣ Set up form errors state
  const [formErrors, setFormErrors] = useState({});

  // 4️⃣ Initialize the validation hook
  const [validateField, isFormValid, resetValidation] = useYupHookValidate({
    validationSchema: schema,
    formState,
    updateErrorsCallback: setFormErrors,
    validationTimeout: 300, // Debounce for better UX
  });

  // 5️⃣ Create a reusable input handler
  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log('Form is valid!', formState);
      // Submit your form
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Full Name</label>
        <input
          type="text"
          value={formState.name}
          onChange={handleInputChange('name')}
          onBlur={validateField('name')} // 🎯 Validate on blur
          className={`input ${formErrors.name ? 'border-red-500' : ''}`}
        />
        {formErrors.name && (
          <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={formState.email}
          onChange={handleInputChange('email')}
          onKeyUp={validateField('email')} // 🎯 Validate on keyup
          className={`input ${formErrors.email ? 'border-red-500' : ''}`}
        />
        {formErrors.email && (
          <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isFormValid}
        className="btn-primary disabled:opacity-50"
      >
        {isFormValid ? '✅ Submit' : '❌ Complete Form'}
      </button>
    </form>
  );
};
```

### 🚀 Advanced Usage with Custom Validation

```tsx
// Custom validation methods available out of the box
const advancedSchema = yup.object().shape({
  username: yup.string().min(3).max(20).required(),
  password: yup
    .string()
    .min(8)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase and number'
    )
    .required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required(),
  website: yup.string().url('Must be a valid URL'),
  age: yup.number().min(18, 'Must be 18+').max(120).required(),
  terms: yup.boolean().oneOf([true], 'You must accept terms'),
});
```

### 🎛️ Real-time Validation

```tsx
// Validate as user types with debouncing
const [validateField] = useYupHookValidate({
  validationSchema: schema,
  formState,
  updateErrorsCallback: setFormErrors,
  validationTimeout: 500, // Wait 500ms after user stops typing
});

// Use with onChange for real-time feedback
<input
  onChange={(e) => {
    handleInputChange('email')(e);
    validateField('email')(e); // Real-time validation
  }}
/>;
```

## � API Reference

### `useYupHookValidate(options)`

#### Parameters

| Parameter              | Type        | Required | Default | Description                      |
| ---------------------- | ----------- | -------- | ------- | -------------------------------- |
| `validationSchema`     | `YupSchema` | ✅ Yes   | -       | Your Yup validation schema       |
| `formState`            | `object`    | ✅ Yes   | -       | Your form state object           |
| `updateErrorsCallback` | `function`  | ✅ Yes   | -       | Callback to update form errors   |
| `validationTimeout`    | `number`    | ❌ No    | `300`   | Debounce timeout in milliseconds |

#### Returns

Returns an array with three elements:

```tsx
const [validateField, isFormValid, resetValidation] = useYupHookValidate(options);
```

| Return Value      | Type                                            | Description                                   |
| ----------------- | ----------------------------------------------- | --------------------------------------------- |
| `validateField`   | `(fieldName: string) => (event: Event) => void` | Function to validate specific field           |
| `isFormValid`     | `boolean`                                       | True when all required fields pass validation |
| `resetValidation` | `() => void`                                    | Function to reset all validation states       |

### 🎯 Custom Yup Methods

This package extends Yup with additional validation methods:

```tsx
// Available custom methods
yup.string().phone(); // Validates phone numbers
yup.string().fullname(); // Validates full name (first + last)
// More methods available - check the source!
```

## 🎨 Integration Examples

### With Material-UI

```tsx
import { TextField } from '@mui/material';

<TextField
  label="Email"
  value={formState.email}
  onChange={handleInputChange('email')}
  onBlur={validateField('email')}
  error={!!formErrors.email}
  helperText={formErrors.email}
  fullWidth
/>;
```

### With Chakra UI

```tsx
import { Input, FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/react';

<FormControl isInvalid={!!formErrors.email}>
  <FormLabel>Email</FormLabel>
  <Input
    value={formState.email}
    onChange={handleInputChange('email')}
    onBlur={validateField('email')}
  />
  <FormErrorMessage>{formErrors.email}</FormErrorMessage>
</FormControl>;
```

### With React Hook Form (Migration Helper)

```tsx
// Easy migration from react-hook-form
const { register, formState: { errors } } = useForm();

// Replace with:
const [validateField] = useYupHookValidate({...});
const [formErrors, setFormErrors] = useState({});
```

## 🚀 Performance Tips

1. **Use `validationTimeout`** for better UX during typing
2. **Memoize your schema** to prevent unnecessary re-renders
3. **Use `onBlur`** for less aggressive validation
4. **Batch state updates** when possible

```tsx
// ✅ Good - memoized schema
const schema = useMemo(
  () =>
    yup.object().shape({
      email: yup.string().email().required(),
    }),
  []
);

// ❌ Avoid - recreating schema on every render
const schema = yup.object().shape({
  email: yup.string().email().required(),
});
```

## 🆚 Comparison

| Feature           | use-yup-hook-validate | Formik          | React Hook Form |
| ----------------- | --------------------- | --------------- | --------------- |
| Bundle Size       | 🟢 Small              | 🟡 Medium       | 🟢 Small        |
| Learning Curve    | 🟢 Easy               | 🟡 Medium       | 🔴 Hard         |
| TypeScript        | 🟢 Full Support       | 🟢 Full Support | 🟢 Full Support |
| Render Props      | 🟢 None               | 🔴 Required     | 🟢 None         |
| Custom Validation | 🟢 Yup Schema         | 🟢 Yup Schema   | 🟡 Custom Logic |
| Performance       | 🟢 Optimized          | 🟡 Good         | 🟢 Optimized    |

## 🎯 Migration Guide

### From Formik

```tsx
// Before (Formik)
<Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
  {({ values, errors, handleChange, handleBlur }) => (
    <Form>
      <Field name="email" onChange={handleChange} onBlur={handleBlur} />
      <ErrorMessage name="email" />
    </Form>
  )}
</Formik>;

// After (use-yup-hook-validate)
const [formState, setFormState] = useState(initialValues);
const [formErrors, setFormErrors] = useState({});
const [validateField, isValid] = useYupHookValidate({
  validationSchema: schema,
  formState,
  updateErrorsCallback: setFormErrors,
});

<form onSubmit={handleSubmit}>
  <input
    value={formState.email}
    onChange={handleInputChange('email')}
    onBlur={validateField('email')}
  />
  {formErrors.email && <span>{formErrors.email}</span>}
</form>;
```

## 🤝 Contributing

We love contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌟 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. ✅ Add tests for your changes
4. 💚 Make sure all tests pass (`npm test`)
5. 📝 Commit your changes (`git commit -m 'Add amazing feature'`)
6. 🚀 Push to the branch (`git push origin feature/amazing-feature`)
7. 🎉 Open a Pull Request

### Development Setup

```bash
git clone https://github.com/dougvil/use-yup-hook-validate.git
cd use-yup-hook-validate
npm install
npm run build
npm run watch  # For development
```

## 📄 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed release notes.

## 🙏 Acknowledgments

- Built with ❤️ by [Douglas Viliano](https://github.com/dougvil)
- Powered by [Yup](https://github.com/jquense/yup) validation library
- Inspired by the React community's need for simpler form validation

---

<div align="center">

**⭐ Star this repo if it helped you! ⭐**

[Report Bug](https://github.com/dougvil/use-yup-hook-validate/issues) • [Request Feature](https://github.com/dougvil/use-yup-hook-validate/issues) • [Contribute](https://github.com/dougvil/use-yup-hook-validate/pulls)

Made with 💻 and ☕ by developers, for developers.

**Just Yup and You!** ✨

</div>
