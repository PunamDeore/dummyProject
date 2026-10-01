import { Button, ButtonGroup, Card, Image, Table } from 'react-bootstrap';
import { Dash, Plus, Trash, Cart3, ArrowRight } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router';
import { formatPrice } from '../../lib/format';
import { useAppDispatch, useAppSelector, selectCartLines, selectCartSubtotal } from '../../store';
import { setQuantity, removeFromCart, clearCart } from '../../store/cartSlice';

export async function cartsLoader() {
  return null;
}

export function CartsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const activeLines = useAppSelector(selectCartLines);
  const activeSubtotal = useAppSelector(selectCartSubtotal);

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="fw-semibold d-flex align-items-center gap-2">
          <Cart3 className="text-primary" />
          Cart Items ({activeLines.reduce((acc, l) => acc + (l.qty || 0), 0)})
        </div>
        {activeLines.length > 0 && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => dispatch(clearCart())}
          >
            Clear Cart
          </Button>
        )}
      </Card.Header>

      {activeLines.length === 0 ? (
        <Card.Body className="text-center py-5">
          <Cart3 size={40} className="text-muted mb-2" />
          <p className="text-muted mb-3">Your cart is empty.</p>
          <Link to="/products" className="btn btn-outline-primary btn-sm">
            Browse Products
          </Link>
        </Card.Body>
      ) : (
        <>
          <Table hover responsive className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '80px' }}>Item</th>
                <th>Title</th>
                <th>Price</th>
                <th style={{ width: '150px' }}>Quantity</th>
                <th className="text-end">Total</th>
                <th style={{ width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {activeLines.map((line) => (
                <tr key={line.productId}>
                  <td>
                    <Image
                      src={line.thumbnail}
                      width={48}
                      height={48}
                      className="object-fit-contain bg-body-secondary rounded border"
                      alt={line.title}
                    />
                  </td>
                  <td>
                    <Link
                      to={`/products/${line.productId}`}
                      className="text-decoration-none fw-semibold text-reset"
                    >
                      {line.title}
                    </Link>
                  </td>
                  <td>{formatPrice(line.price)}</td>
                  <td>
                    <ButtonGroup size="sm">
                      <Button
                        variant="outline-secondary"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          dispatch(setQuantity({ productId: line.productId, qty: line.qty - 1 }))
                        }
                      >
                        <Dash />
                      </Button>
                      <Button variant="outline-secondary" disabled className="px-3">
                        {line.qty}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        aria-label="Increase quantity"
                        onClick={() =>
                          dispatch(setQuantity({ productId: line.productId, qty: line.qty + 1 }))
                        }
                      >
                        <Plus />
                      </Button>
                    </ButtonGroup>
                  </td>
                  <td className="text-end fw-semibold">
                    {formatPrice(line.price * line.qty)}
                  </td>
                  <td className="text-center">
                    <Button
                      size="sm"
                      variant="outline-danger"
                      aria-label={`Remove ${line.title}`}
                      onClick={() => dispatch(removeFromCart(line.productId))}
                    >
                      <Trash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Card.Footer className="d-flex flex-wrap justify-content-between align-items-center bg-body-tertiary">
            <div className="fs-5 fw-bold">
              Subtotal: <span className="text-primary">{formatPrice(activeSubtotal)}</span>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/account/checkout')}
              className="d-flex align-items-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight />
            </Button>
          </Card.Footer>
        </>
      )}
    </Card>
  );
}