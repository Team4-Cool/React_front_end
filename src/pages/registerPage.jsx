import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const RegisterForm = () => {
    const validationSchema = Yup.object({
        username: Yup.string()
            .required('Username is required'),
        email: Yup.string()
            .email('Invalid email')
            .required('Email is required'),
        password1: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
        password2: Yup.string()
            .oneOf([Yup.ref('password1'), null], 'Passwords must match')
            .required('Confirm your password')
    });

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password1: '',
            password2: ''
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                // Prepare the data to send to the API
                const userData = {
                    username: values.username,
                    email: values.email,
                    password1: values.password1,
                    password2: values.password2
                };

                // Send the data to the API (replace 'http://your-ip-address/api/endpoint' with your actual backend URL)
                const response = await axios.post('http://127.0.0.1:8000/auth/registration/', userData);

                console.log('Registration successful:', response.data);
                localStorage.setItem('token', response.data.key);
                window.location.href = '/';
            } catch (error) {
                console.error('Registration failed:', error.response?.data);
                setErrors({ email: 'User with this email already exists' });
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <div className="container mt-5">
            <h2 className="text-center">Register</h2>
            <form onSubmit={formik.handleSubmit} className="col-md-6 offset-md-3">
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className={`form-control ${formik.errors.username && formik.touched.username ? 'is-invalid' : ''}`}
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.errors.username && formik.touched.username && (
                        <div className="invalid-feedback">{formik.errors.username}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-control ${formik.errors.email && formik.touched.email ? 'is-invalid' : ''}`}
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.errors.email && formik.touched.email && (
                        <div className="invalid-feedback">{formik.errors.email}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="password1" className="form-label">Password</label>
                    <input
                        type="password"
                        id="password1"
                        name="password1"
                        className={`form-control ${formik.errors.password1 && formik.touched.password1 ? 'is-invalid' : ''}`}
                        value={formik.values.password1}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.errors.password1 && formik.touched.password1 && (
                        <div className="invalid-feedback">{formik.errors.password1}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="password2" className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        id="password2"
                        name="password2"
                        className={`form-control ${formik.errors.password2 && formik.touched.password2 ? 'is-invalid' : ''}`}
                        value={formik.values.password2}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.errors.password2 && formik.touched.password2 && (
                        <div className="invalid-feedback">{formik.errors.password2}</div>
                    )}
                </div>

                <div className="text-center">
                    <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;
