import { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { BoxArrowInRight, PersonPlus } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router';
import { SignupForm } from './SignupForm';

interface AuthPromptModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function AuthPromptModal({
  show,
  onClose,
  title = 'Authentication Required',
  message = 'Please sign in or create an account to add items to your cart.',
}: AuthPromptModalProps) {
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();

  function handleGoToLogin() {
    onClose();
    navigate('/login?redirectTo=/products');
  }

  return (
    <>
      <Modal show={show && !showSignup} onHide={onClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-semibold">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            {message}
          </Alert>
          <div className="d-grid gap-2">
            <Button variant="primary" onClick={handleGoToLogin} className="d-flex align-items-center justify-content-center gap-2">
              <BoxArrowInRight />
              Sign In
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setShowSignup(true)}
              className="d-flex align-items-center justify-content-center gap-2"
            >
              <PersonPlus />
              Create an Account
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <SignupForm
        show={showSignup}
        onClose={() => {
          setShowSignup(false);
          onClose();
        }}
      />
    </>
  );
}