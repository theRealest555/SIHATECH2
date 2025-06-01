import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDoctorSpecialities, 
  selectDoctorSpecialities, 
  selectDoctorStatus,
  completeDoctorProfile // Thunk to complete profile
} from '../../redux/slices/doctorSlice';
import { selectCurrentUser, selectAuthStatus, selectAuthError, checkAuth } from '../../redux/slices/authSlice'; // For user info
import { toast } from 'react-toastify';

const DoctorCompleteProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Selectors
  const currentUser = useSelector(selectCurrentUser);
  const specialities = useSelector(selectDoctorSpecialities); // Expects array of {id, nom, ...}
  const doctorOpStatus = useSelector(selectDoctorStatus); // For doctor slice operations like completeProfile
  const authOpStatus = useSelector(selectAuthStatus); // For auth slice operations
  const authErr = useSelector(selectAuthError);

  // Local state
  const [formData, setFormData] = useState({
    speciality_id: '',
    telephone: currentUser?.telephone || '', // Pre-fill if available
    adresse: currentUser?.adresse || '',
    sexe: currentUser?.sexe || '',
    date_de_naissance: currentUser?.date_de_naissance || '',
  });
  const [errors, setErrors] = useState({}); // For validation errors

  // Fetch specialities on mount
  useEffect(() => {
    dispatch(fetchDoctorSpecialities());
  }, [dispatch]);

  // Pre-fill form if currentUser data updates (e.g., after social auth)
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        telephone: currentUser.telephone || prev.telephone,
        adresse: currentUser.adresse || prev.adresse,
        sexe: currentUser.sexe || prev.sexe,
        date_de_naissance: currentUser.date_de_naissance || prev.date_de_naissance,
      }));
    }
  }, [currentUser]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    // Basic client-side validation
    if (!formData.speciality_id) {
      setErrors(prev => ({...prev, speciality_id: 'Speciality is required.'}));
      toast.error('Please select your medical speciality.');
      return;
    }
    // Add more client-side checks if needed, though backend will also validate

    dispatch(completeDoctorProfile(formData))
      .unwrap()
      .then((response) => { // Backend returns { message, user (with updated doctor info) }
        toast.success(response.message || 'Profile completed successfully!');
        // Optionally update local auth state if backend returns full user object
        // For now, just refetch auth state to ensure user object is up-to-date
        dispatch(checkAuth()); 
        navigate('/dashboard');
      })
      .catch((error) => {
        if (error.errors) {
          setErrors(error.errors);
          const firstErrorKey = Object.keys(error.errors)[0];
          toast.error(error.errors[firstErrorKey][0] || 'Failed to complete profile. Please check the form.');
        } else {
          toast.error(error.message || 'An unexpected error occurred.');
        }
      });
  };
  
  const isLoading = doctorOpStatus === 'loading' || authOpStatus === 'loading';
  const isLoadingSpecialities = doctorOpStatus === 'loading' && specialities.length === 0;


  // Redirect if not a doctor or profile seems complete (basic check)
  useEffect(() => {
    if (currentUser && currentUser.role !== 'medecin') {
      navigate('/dashboard'); // Or to login if not authenticated
    }
    // More robust check: if doctor profile exists and has speciality_id, redirect
    if (currentUser?.doctor?.speciality_id) {
      // navigate('/dashboard'); // Commented out to allow re-completion if needed, or make this check stricter
    }
  }, [currentUser, navigate]);


  return (
    <div className="auth-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={7}>
            <Card className="auth-card">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <i className="fas fa-user-md fa-3x text-primary mb-3"></i>
                  <h2 className="auth-header">Complete Your Profile</h2>
                  <p className="text-muted">Please provide your professional information to continue.</p>
                </div>

                {authErr && ( // Display general auth error
                  <Alert variant="danger" className="fade-in">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {typeof authErr === 'string' ? authErr : 'An error occurred.'}
                  </Alert>
                )}
                {errors.general && ( // Display general form error from backend
                  <Alert variant="danger" className="fade-in">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errors.general}
                  </Alert>
                )}


                <Form onSubmit={handleSubmit} noValidate>
                  <div className="bg-light p-4 rounded mb-4">
                    <h5 className="text-primary mb-3">
                      <i className="fas fa-stethoscope me-2"></i>
                      Professional Information
                    </h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Medical Speciality *</Form.Label>
                      <Form.Select
                        name="speciality_id"
                        value={formData.speciality_id}
                        onChange={handleChange}
                        isInvalid={!!errors.speciality_id}
                        disabled={isLoading || isLoadingSpecialities}
                      >
                        <option value="">{isLoadingSpecialities ? "Loading specialities..." : "Select your speciality..."}</option>
                        {Array.isArray(specialities) && specialities.map((spec) => (
                          <option key={spec.id} value={spec.id}>
                            {spec.nom}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.speciality_id}</Form.Control.Feedback>
                    </Form.Group>
                  </div>

                  <h5 className="text-primary mb-3">
                    <i className="fas fa-user-circle me-2"></i>
                    Personal Information
                  </h5>

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

                  <Form.Group className="mb-3">
                    <Form.Label>Practice Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      placeholder="Enter your practice address"
                      isInvalid={!!errors.adresse}
                      disabled={isLoading}
                    />
                    <Form.Control.Feedback type="invalid">{errors.adresse}</Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          name="sexe"
                          value={formData.sexe}
                          onChange={handleChange}
                          isInvalid={!!errors.sexe}
                          disabled={isLoading}
                        >
                          <option value="">Select...</option>
                          <option value="homme">Male</option>
                          <option value="femme">Female</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.sexe}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                          type="date"
                          name="date_de_naissance"
                          value={formData.date_de_naissance}
                          onChange={handleChange}
                          isInvalid={!!errors.date_de_naissance}
                          disabled={isLoading}
                          max={new Date().toISOString().split('T')[0]} // Prevent future dates
                        />
                        <Form.Control.Feedback type="invalid">{errors.date_de_naissance}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Alert variant="info" className="mb-4">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Next Steps:</strong> After completing your profile, you'll need to upload 
                    your professional documents for verification before you can start accepting appointments.
                  </Alert>

                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg" 
                    className="w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Completing Profile...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Complete Profile
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DoctorCompleteProfile;