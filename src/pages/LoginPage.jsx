import { useFormik } from 'formik';
import * as Yup from 'yup';

const LoginFormPage = () => {
    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: (values) => {
            console.log('Login submitted:', values);
        }
    });

    return (
        <div className="container mt-5">
            <h2 className="text-center">Login</h2>
            <form onSubmit={formik.handleSubmit} className="col-md-6 offset-md-3">
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
                    <button type="submit" className="btn btn-primary">Login</button>
                </div>
            </form>
        </div>
    );
};

export default LoginFormPage;