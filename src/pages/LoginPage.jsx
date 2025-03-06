import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const LoginFormPage = () => {
    const { login } = useAuth(); // Get the login function from AuthContext

    const validationSchema = Yup.object({
        username: Yup.string()
            .required('Username is required'),
        email: Yup.string()
            .email('Invalid email')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
    });

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                // Sending username, email, and password in the request
                const response = await axios.post('http://109.87.215.193:8000/auth/login/', values);
                console.log('Login successful:', response.data);

                // Save the token and set the user in context
                login( response.data.key);
                
                // Redirect to homepage after login
                window.location.href = '/';
            } catch (error) {
                console.error('Login failed:', error.response?.data);
                setErrors({ password: 'Invalid credentials' });
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <div className="container mt-5">
            <h2 className="text-center">Login</h2>
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
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className={`form-control ${formik.errors.password && formik.touched.password ? 'is-invalid' : ''}`}
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.errors.password && formik.touched.password && (
                        <div className="invalid-feedback">{formik.errors.password}</div>
                    )}
                </div>

                <div className="text-center">
                    <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginFormPage;
