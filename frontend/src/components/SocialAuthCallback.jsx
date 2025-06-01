import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you might want to use navigate from react-router
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice'; // Import your setCredentials action

const SocialAuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Please wait while we complete your authentication...');
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // For programmatic navigation

  useEffect(() => {
    const processCallback = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');
        const errorParam = urlParams.get('error');
        const messageParam = urlParams.get('message'); // Backend might send a specific message with error

        if (errorParam) {
          const decodedError = decodeURIComponent(messageParam || errorParam);
          setStatus('error');
          setError(decodedError);
          if (window.opener) {
            window.opener.postMessage({ type: 'SOCIAL_AUTH_ERROR', error: decodedError }, '*');
            setTimeout(() => window.close(), 3000);
          }
          return;
        }

        if (token && userParam) {
          const userData = JSON.parse(decodeURIComponent(userParam));
          
          // Dispatch action to set credentials in Redux store and localStorage
          dispatch(setCredentials({ user: userData, token }));

          setStatus('success');
          setMessage('Authentication successful! Redirecting...');

          if (window.opener) {
            window.opener.postMessage({ type: 'SOCIAL_AUTH_SUCCESS', data: { token, user: userData } }, '*');
            setTimeout(() => window.close(), 1000); // Close popup after success
          } else {
            // Fallback: redirect directly if not a popup
            setTimeout(() => {
              // Example: Check if doctor profile completion is needed
              if (userData.role === 'medecin' && !userData.doctor?.is_verified && !userData.doctor?.speciality_id) { // Adjust condition as per your user object structure
                navigate('/doctor/complete-profile');
              } else {
                navigate('/dashboard');
              }
            }, 1500);
          }
        } else {
          throw new Error('Authentication data (token or user info) not found in URL.');
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        const errorMsg = `Authentication processing failed: ${err.message}`;
        setStatus('error');
        setError(errorMsg);
        if (window.opener) {
          window.opener.postMessage({ type: 'SOCIAL_AUTH_ERROR', error: errorMsg }, '*');
          setTimeout(() => window.close(), 3000);
        }
      }
    };

    processCallback();
  }, [dispatch, navigate]);

  const getStatusIcon = () => {
    // ... (same as your original file)
    switch (status) {
      case 'processing':
        return (
          <div className="spinner-border text-primary mb-4" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        );
      case 'success':
        return <i className="fas fa-check-circle text-success mb-4" style={{ fontSize: '3rem' }}></i>;
      case 'error':
        return <i className="fas fa-exclamation-triangle text-danger mb-4" style={{ fontSize: '3rem' }}></i>;
      default:
        return (
          <div className="spinner-border text-primary mb-4" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        );
    }
  };

  const getAlertVariant = () => {
    // ... (same as your original file)
    switch (status) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-danger';
      default:
        return 'alert-info';
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleTryAgain = () => {
    // This might involve redirecting to the social provider again or specific logic
    // For simplicity, navigating to login might be best if 'Try Again' is complex.
    navigate('/login'); 
  };


  return (
    <div className="auth-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card auth-card">
              <div className="card-body text-center p-5">
                <h2 className="mb-4 auth-header">
                  {status === 'processing' && 'Processing Authentication'}
                  {status === 'success' && 'Authentication Successful'}
                  {status === 'error' && 'Authentication Failed'}
                </h2>
                
                <div className="mb-4">
                  {getStatusIcon()}
                </div>

                <div className={`alert ${getAlertVariant()} fade-in`}>
                  <i className={`fas fa-${error ? 'exclamation-triangle' : status === 'success' ? 'check' : 'clock'} me-2`}></i>
                  {error || message}
                </div>

                {status === 'processing' && (
                  <div className="mt-4">
                    <div className="progress" style={{ height: '4px' }}>
                      <div 
                        className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                        role="progressbar" 
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                    <small className="text-muted mt-2 d-block">
                      This may take a few moments...
                    </small>
                  </div>
                )}

                {status === 'success' && (
                  <div className="mt-4">
                    <div className="d-flex justify-content-center">
                      <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                      <span className="text-success">Redirecting...</span>
                    </div>
                  </div>
                )}

                {status === 'error' && !window.opener && (
                  <div className="mt-4">
                    <button 
                      className="btn btn-primary me-2"
                      onClick={handleBackToLogin}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Login
                    </button>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={handleTryAgain}
                    >
                      <i className="fas fa-redo me-2"></i>
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialAuthCallback;