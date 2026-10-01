import { Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router';

export function NotFoundPage() {
  const location = useLocation();

  return (
    <Alert variant="warning">
      <Alert.Heading className="h5">Page not found</Alert.Heading>
      <p>
        Nothing lives at <code>{location.pathname}</code>.
      </p>
      <Link to="/products" className="btn btn-outline-secondary">
        Back to products
      </Link>
    </Alert>
  );
}
