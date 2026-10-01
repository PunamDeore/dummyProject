import { Badge, Button, ButtonGroup, Image, ListGroup, Offcanvas } from 'react-bootstrap';
import { Dash, Plus, Trash } from 'react-bootstrap-icons';
import { Link, useNavigate, useRouteLoaderData } from 'react-router';
import {
  useAppDispatch,
  useAppSelector,
  selectCartLines,
  selectCartIsOpen,
  selectCartCount,
  selectCartSubtotal,
} from '../store';
import { setQuantity, removeFromCart, closeCart } from '../store/cartSlice';
import { formatPrice } from '../lib/format';
import type { rootLoader } from '../routes/RootLayout';

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const lines = useAppSelector(selectCartLines);
  const isOpen = useAppSelector(selectCartIsOpen);
  const count = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);

  const navigate = useNavigate();
  const user = useRouteLoaderData<typeof rootLoader>('root')?.user ?? null;

  function handleGoToCheckout() {
    dispatch(closeCart());
    navigate('/account/checkout');
  }

  return (
    <Offcanvas show={isOpen} onHide={() => dispatch(closeCart())} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="h6">
          Your cart {count > 0 && <Badge bg="primary" pill>{count}</Badge>}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column">
        {lines.length === 0 ? (
          <p className="text-muted">Your cart is empty. Add something from the catalogue.</p>
        ) : (
          <ListGroup variant="flush" className="mb-3">
            {lines.map((line) => (
              <ListGroup.Item key={line.productId} className="d-flex align-items-center gap-3 px-0">
                <Image
                  src={line.thumbnail}
                  width={48}
                  height={48}
                  className="object-fit-contain bg-body-secondary rounded"
                  alt=""
                />
                <div className="flex-grow-1 min-w-0">
                  <Link
                    to={`/products/${line.productId}`}
                    onClick={() => dispatch(closeCart())}
                    className="text-decoration-none text-reset fw-semibold small d-block text-truncate"
                  >
                    {line.title}
                  </Link>
                  <div className="small text-muted">
                    {formatPrice(line.price)} × {line.qty}
                  </div>
                </div>
                <ButtonGroup size="sm" aria-label={`Quantity of ${line.title}`}>
                  <Button
                    variant="outline-secondary"
                    aria-label="Decrease quantity"
                    onClick={() => dispatch(setQuantity({ productId: line.productId, qty: line.qty - 1 }))}
                  >
                    <Dash />
                  </Button>
                  <Button variant="outline-secondary" disabled className="px-3">
                    {line.qty}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    aria-label="Increase quantity"
                    onClick={() => dispatch(setQuantity({ productId: line.productId, qty: line.qty + 1 }))}
                  >
                    <Plus />
                  </Button>
                </ButtonGroup>
                <Button
                  size="sm"
                  variant="outline-danger"
                  aria-label={`Remove ${line.title}`}
                  onClick={() => dispatch(removeFromCart(line.productId))}
                >
                  <Trash />
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        <div className="mt-auto border-top pt-3">
          <div className="d-flex justify-content-between fw-semibold mb-3">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {user ? (
            <Button
              className="w-100"
              disabled={lines.length === 0}
              onClick={handleGoToCheckout}
            >
              Proceed to Checkout
            </Button>
          ) : (
            <Link
              to="/login?redirectTo=/products"
              className="btn btn-primary w-100"
              onClick={() => dispatch(closeCart())}
            >
              Sign in to check out
            </Link>
          )}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}