# use-yup-hook-validate

The `use-yup-hook-validate` is a custom hook for react to help you validate form fields with no headache.
**Just Yup and You!**

## 🚀 Getting Started

```
yarn add use-yup-hook-validate
```

## Usage

### Import both **yup** and **useYupHookValidate** from this package (for custom validations that only exists in this project)

```javascript
...
import { useYupHookValidate, yup } from 'use-yup-hook-validate';
```

### Create a validation schema

```javascript
const yupSchema = yup.object().shape({
  name: yup.string().fullname('Type first and last name').required(),
  email: yup.string().email().required(),
  phone: yup.string().phone().required(),
  about: yup.string().min(100).required(),
});
```

### Create your Form component and prepare some things. Please, read the comments below for further explanations:

```javascript
const Form = () => {
    // Create a form state object
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        phone: '',
        about: ''
    })
    // You'd rather create a handle for state object update (optional)
    const handleSetFormState = (path) => ({target}) => {
        setFormState(prev => ({...prev, [path]: target.value}))
    }

    // Create a state to store form validation errors
    const [formErrors, setFormErrors] = useState({})

    /**
     * @return validateField
     * The handler for the job
     * @return isValid
     * Return true only after all required fields were validated
     * @return reset
     * A helper to reset all validations, use only if you think you need.
     * */
    const [validateField, isValid, reset] = useYupHookValidate({
      validationSchema: yupSchema, // A valid Yup validation schema
      formState, // Your form state
      updateErrorsCallback: setFormErrors, // It's need for performance improvement for large form components
      validationTimeout: 500, // Debounce time in ms for trigger validateField (default: 300)
    })
```

### You can use validateField with onBlur, onKeyUp, or any other callback you'd want. Feel free to adapt it to your project needs.

```javascript
    return (
        <form>
          <div className="input-group">
            <label>Full Name</label>
            <input
              value={formState.name}
              onKeyUp={validateField('name')}
              onChange={handleSetState('name')}
            />
            <small>{formErrors['name']}</small>
          </div>
          <div className="input-group">
            <label>E-mail</label>
            <input
              value={formState.name}
              onKeyUp={validateField('email')}
              onChange={handleSetState('email')}
            />
            <small>{formErrors['email']}</small>
          </div>
          <div className="input-group">
            <label>Phone</label>
            <input
              value={formState.name}
              onKeyUp={validateField('phone')}
              onChange={handleSetState('phone')}
            />
            <small>{formErrors['phone']}</small>
          </div>
        </form>
    )

}
```

### No **Formik Wrapper**, **React-hook-form Register**, nor any **Render Props** needed. **Just Yup and You!** (and React, of course!)

## 📝 License

[MIT](https://choosealicense.com/licenses/mit/)
