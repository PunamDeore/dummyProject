import { Alert, Button, Container } from 'react-bootstrap';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router';
import { env } from '../config/env';
import { ApiError } from '../lib/ApiError';

export function RootErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 403) {
    const body = error.data as { message?: unknown } | null;
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Not allowed</Alert.Heading>
          <p>{typeof body?.message === 'string' ? body.message : "You don't have access to this area."}</p>
          <Link to="/account" className="btn btn-outline-secondary">
            Back to your account
          </Link>
        </Alert>
      </Container>
    );
  }

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try again.';
  let status: number | undefined;
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
      status = error.status;
    title = status === 404 ? 'Page not found' : `${status} ${error.statusText}`;
    const body = error.data as { message?: unknown } | null;
    if (typeof body?.message === 'string') message = body.message;
  } else if (error instanceof Error) {
     message = error.message;
    stack = error.stack;
    if (error instanceof ApiError) status = error.status;
  }
 
  return (
    <Container className="py-5">
      <Alert variant="danger">
        <Alert.Heading>{title}</Alert.Heading>
        <p>{message}</p>

        {env.isDev && stack && (
          <pre className="small bg-body-secondary p-2 rounded mt-3 mb-0" style={{ maxHeight: 240 }}>
            {stack}
          </pre>
        )}

        <hr />
        <div className="d-flex gap-2">
          <Link to="/products" className="btn btn-outline-danger">
            Back to products
          </Link>
          {(status === undefined || status >= 500) && (
            <Button variant="danger" onClick={() => window.location.reload()}>
              Reload
            </Button>
          )}
        </div>
      </Alert>
    </Container>
  );
}
