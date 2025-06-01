import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, ButtonGroup, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { register, selectAuthStatus, selectAuthError } from '../../redux/slices/authSlice';
import { fetchDoctorSpecialities, selectDoctorSpecialities, selectDoctorStatus as selectDocStatus } from '../../redux/slices/doctorSlice';
import { registerSchema } from '../../utils/validation'; // Assuming yup schema is correctly defined
import { initializeCSRF } from '../../api/axios'; // Ensure CSRF is initialized
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state selectors
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);
  const specialities = useSelector(selectDoctorSpecialities); // Expects array of {id, nom, ...}
  const doctorDataStatus = useSelector(selectDocStatus);


  // Local component state
  const [userType, setUserType] = useState('patient'); // 'patient' or 'medecin'
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
    telephone: '',
    role: 'patient', // Default role
    speciality_id: '', // For doctors
  });
  const [errors, setErrors] = useState({}); // For client-side validation errors

  // Effect to initialize CSRF and fetch specialities
  useEffect(() => {
    initializeCSRF();
    dispatch(fetchDoctorSpecialities());
  }, [dispatch]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle user type (role) change
  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData((prev) => ({
      ...prev,
      role: type,
      speciality_id: type === 'patient' ? '' : prev.speciality_id, // Reset speciality if switching to patient
    }));
    if (type !== 'medecin' && errors.speciality_id) {
      setErrors((prev) => ({ ...prev, speciality_id: null }));
    }
  };

  // Validate form using Yup schema
  const validateForm = async () => {
    try {
      await registerSchema.validate(formData, { abortEarly: false });
      setErrors({}); // Clear previous errors if validation passes
      return true;
    } catch (validationError) {
      const newErrors = {};
      validationError.inner.forEach((error) => {
        if (error.path) {
          newErrors[error.path] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous backend errors

    const isValid = await validateForm();
    if (!isValid) return;

    dispatch(register(formData))
      .unwrap()
      .then((result) => {
        toast.success(result.message || 'Registration successful! Please check your email.');
        // Backend response includes a 'message' and 'user', 'token'
        // Navigate based on whether email verification is implied by the message
        if (result.message && result.message.toLowerCase().includes('verify')) {
          navigate('/verify-email');
        } else {
          navigate('/dashboard');
        }
      })
      .catch((error) => {
        if (error.errors) { // Backend validation errors
          setErrors(error.errors);
          const firstErrorKey = Object.keys(error.errors)[0];
          toast.error(error.errors[firstErrorKey][0] || 'Registration failed. Please check the form.');
        } else {
          toast.error(error.message || 'An unexpected error occurred during registration.');
        }
      });
  };

  // Handle social authentication redirect
  const handleSocialAuth = (provider) => {
    sessionStorage.setItem('authRole', userType); // Pass role to backend if needed during social auth
    window.location.href = `http://localhost:8000/api/auth/social/${provider}/redirect?role=${userType}`;
  };

  const isLoading = authStatus === 'loading';
  const isLoadingSpecialities = doctorDataStatus === 'loading';

  return (
    <div className="auth-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={7}>
            <Card className="auth-card">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <i className="fas fa-user-plus fa-3x text-primary mb-3"></i>
                  <h2 className="auth-header">Create Account</h2>
                  <p className="text-muted">Join our healthcare platform</p>
                </div>

                {authError && !errors.email && !errors.password && ( // Display general auth error if no specific field errors
                  <Alert variant="danger" className="fade-in">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {typeof authError === 'string' ? authError : 'Registration failed. Please try again.'}
                  </Alert>
                )}

                <div className="mb-4">
                  <Form.Label className="fw-bold mb-3">I want to register as:</Form.Label>
                  <ButtonGroup className="w-100">
                    <Button
                      variant={userType === 'patient' ? 'primary' : 'outline-primary'}
                      onClick={() => handleUserTypeChange('patient')}
                      className="d-flex align-items-center justify-content-center"
                      disabled={isLoading}
                    >
                      <i className="fas fa-user me-2"></i>
                      Patient
                    </Button>
                    <Button
                      variant={userType === 'medecin' ? 'primary' : 'outline-primary'}
                      onClick={() => handleUserTypeChange('medecin')}
                      className="d-flex align-items-center justify-content-center"
                      disabled={isLoading}
                    >
                      <i className="fas fa-user-md me-2"></i>
                      Doctor
                    </Button>
                  </ButtonGroup>
                </div>

                <Form onSubmit={handleSubmit} noValidate>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                          isInvalid={!!errors.prenom}
                          disabled={isLoading}
                        />
                        <Form.Control.Feedback type="invalid">{errors.prenom}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="nom"
                          value={formData.nom}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                          isInvalid={!!errors.nom}
                          disabled={isLoading}
                        />
                        <Form.Control.Feedback type="invalid">{errors.nom}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      isInvalid={!!errors.email}
                      disabled={isLoading}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Password *</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a password"
                          isInvalid={!!errors.password}
                          disabled={isLoading}
                        />
                        <Form.Text className="text-muted">Minimum 8 characters</Form.Text>
                        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm Password *</Form.Label>
                        <Form.Control
                          type="password"
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          isInvalid={!!errors.password_confirmation}
                          disabled={isLoading}
                        />
                        <Form.Control.Feedback type="invalid">{errors.password_confirmation}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      isInvalid={!!errors.telephone}
                      disabled={isLoading}
                    />
                    <Form.Control.Feedback type="invalid">{errors.telephone}</Form.Control.Feedback>
                  </Form.Group>

                  {userType === 'medecin' && (
                    <div className="bg-light p-3 rounded mb-3">
                      <h6 className="text-primary mb-3">
                        <i className="fas fa-stethoscope me-2"></i>
                        Professional Information
                      </h6>
                      <Form.Group className="mb-0">
                        <Form.Label>Medical Speciality *</Form.Label>
                        <Form.Select
                          name="speciality_id"
                          value={formData.speciality_id}
                          onChange={handleChange}
                          isInvalid={!!errors.speciality_id}
                          disabled={isLoading || isLoadingSpecialities}
                        >
                          <option value="">{isLoadingSpecialities ? "Loading..." : "Select a speciality..."}</option>
                          {Array.isArray(specialities) && specialities.map((spec) => (
                            <option key={spec.id} value={spec.id}>
                              {spec.nom}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.speciality_id}</Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg" 
                    className="w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Create {userType === 'patient' ? 'Patient' : 'Doctor'} Account
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <span className="text-muted">Already have an account? </span>
                    <Link to="/login" className="text-decoration-none fw-bold">
                      Sign In
                    </Link>
                  </div>

                  <hr className="my-4" />
                  
                  <div className="text-center mb-2">
                    <small className="text-muted">Or register with</small>
                  </div>

                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-danger"
                      className="social-btn"
                      onClick={() => handleSocialAuth('google')}
                      disabled={isLoading}
                    >
                      <i className="fab fa-google me-2"></i>
                      Continue with Google
                    </Button>
                    <Button
                      variant="outline-primary"
                      className="social-btn"
                      onClick={() => handleSocialAuth('facebook')}
                      disabled={isLoading}
                    >
                      <i className="fab fa-facebook-f me-2"></i>
                      Continue with Facebook
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;