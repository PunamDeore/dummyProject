import { useEffect, useState } from 'react';
import { Button, Container, Modal, ProgressBar } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';
import { Outlet, ScrollRestoration, useLoaderData, useNavigate, useNavigation, useRevalidator } from 'react-router';
import { logout } from '../api/services/auth';
import { AUTH_CHANGED, AUTH_UNAUTHORIZED, tokenStore } from '../lib/tokenStore';
import { SiteHeader } from '../components/SiteHeader';
import { CartDrawer } from '../components/CartDrawer';
import { ChatAgentWidget } from '../components/ChatAgentWidget';
import { SignupForm } from '../components/SignupForm';

export function rootLoader() {
  return { user: tokenStore.getUser() };
}

export function RootLayout() {
  const { user } = useLoaderData<typeof rootLoader>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const busy = navigation.state !== 'idle';
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  useEffect(() => {
    const onAuthChanged = () => revalidator.revalidate();
    const onUnauthorized = () => {
      logout();
      setShowUnauthorizedModal(true);
      navigate('/products', { replace: true });
    };

    window.addEventListener(AUTH_CHANGED, onAuthChanged);
    window.addEventListener(AUTH_UNAUTHORIZED, onUnauthorized);
    return () => {
      window.removeEventListener(AUTH_CHANGED, onAuthChanged);
      window.removeEventListener(AUTH_UNAUTHORIZED, onUnauthorized);
    };
  }, [revalidator, navigate]);

  function handleSignOut() {
    logout();
    navigate('/products', { replace: true });
  }

  function handleGoToSignIn() {
    setShowUnauthorizedModal(false);
    navigate('/login?expired=1');
  }

  function handleOpenRegister() {
    setShowUnauthorizedModal(false);
    setShowSignupModal(true);
  }

  return (
    <>
      <SiteHeader user={user} onSignOut={handleSignOut} />
      <div style={{ height: 3 }} aria-hidden={!busy}>
        {busy && <ProgressBar now={100} animated striped style={{ height: 3, borderRadius: 0 }} aria-label="Loading..." />}
      </div>
      <Container className="py-4">
        <div className={busy ? 'opacity-50' : ''} style={{ transition: 'opacity .15s' }}>
          <Outlet />
        </div>
      </Container>


      <CartDrawer />
      <ChatAgentWidget />
      <ScrollRestoration />

 
      <Modal
        show={showUnauthorizedModal}
        onHide={() => setShowUnauthorizedModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-warning-subtle text-warning-emphasis">
          <Modal.Title className="h6 d-flex align-items-center gap-2">
            <ExclamationTriangleFill />
            Session Expired
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            Your login session has expired. You have been signed out to default guest browsing.
          </p>
          <p className="small text-muted mb-0">
            Please sign in or register if you would like to manage your account and cart.
          </p>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="outline-secondary" size="sm" onClick={() => setShowUnauthorizedModal(false)}>
            Continue Browsing
          </Button>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm" onClick={handleOpenRegister}>
              Register
            </Button>
            <Button variant="primary" size="sm" onClick={handleGoToSignIn}>
              Sign In
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <SignupForm show={showSignupModal} onClose={() => setShowSignupModal(false)} />
    </>
  );
}