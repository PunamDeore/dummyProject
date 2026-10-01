import { Badge, ButtonGroup, Button, Card, Col, Image, Row, Stack } from 'react-bootstrap';
import { BoxSeam, CalendarCheck, CheckCircleFill, ExclamationOctagonFill, Truck } from 'react-bootstrap-icons';
import { useLoaderData, useSearchParams, type LoaderFunctionArgs } from 'react-router';
import { listOrdersForUser } from '../../api/services/orders';
import { formatPrice } from '../../lib/format';
import { userContext } from '../middleware';
import type { Order } from '../../types';

export async function ordersLoader({ context, request }: LoaderFunctionArgs) {
  const user = context.get(userContext);
  if (!user) throw new Error('ordersLoader ran without authMiddleware');

  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? '';

  const orders = await listOrdersForUser(user.id, status, { signal: request.signal });
  return { orders };
}

export function OrdersPage() {
  const { orders } = useLoaderData<typeof ordersLoader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') ?? 'ALL';

  function setFilter(status: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (status === 'ALL') {
          next.delete('status');
        } else {
          next.set('status', status);
        }
        return next;
      },
      { replace: true },
    );
  }

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Stack gap={4}>
      <Card>
        <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="fw-semibold">Your Orders</div>
          <ButtonGroup size="sm">
            <Button
              variant={currentStatus === 'ALL' ? 'primary' : 'outline-secondary'}
              onClick={() => setFilter('ALL')}
            >
              All Orders
            </Button>
            <Button
              variant={currentStatus === 'PLACED' ? 'success' : 'outline-secondary'}
              onClick={() => setFilter('PLACED')}
            >
              Placed
            </Button>
            <Button
              variant={currentStatus === 'FAILED' ? 'danger' : 'outline-secondary'}
              onClick={() => setFilter('FAILED')}
            >
              Failed
            </Button>
          </ButtonGroup>
        </Card.Header>
        <Card.Body>
          {orders.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <BoxSeam size={40} className="mb-2" />
              <p className="mb-0">No orders found matching the filter.</p>
            </div>
          ) : (
            <Stack gap={3}>
              {orders.map((order: Order) => (
                <Card key={order.id} className="border shadow-sm">
                  <Card.Header className="bg-body-tertiary">
                    <Row className="align-items-center gy-2">
                      <Col sm={6} md={3}>
                        <div className="text-muted small">ORDER PLACED</div>
                        <div className="small fw-semibold">
                          <CalendarCheck className="me-1" />
                          {formatDate(order.orderPlacedDate)}
                        </div>
                      </Col>
                      <Col sm={6} md={3}>
                        <div className="text-muted small">TOTAL</div>
                        <div className="small fw-semibold">{formatPrice(order.discountedTotal)}</div>
                      </Col>
                      <Col sm={6} md={3}>
                        <div className="text-muted small">STATUS</div>
                        <div>
                          {order.status === 'PLACED' ? (
                            <Badge bg="success" className="d-inline-flex align-items-center gap-1">
                              <CheckCircleFill /> Placed
                            </Badge>
                          ) : (
                            <Badge bg="danger" className="d-inline-flex align-items-center gap-1">
                              <ExclamationOctagonFill /> Failed
                            </Badge>
                          )}
                        </div>
                      </Col>
                      <Col sm={6} md={3} className="text-md-end">
                        <div className="text-muted small">ORDER #{order.id}</div>
                        <div className="small text-muted">Card ending {order.lastFourDigits}</div>
                      </Col>
                    </Row>
                  </Card.Header>
                  <Card.Body>
                    {order.status === 'PLACED' && (
                      <div className="d-flex align-items-center gap-2 mb-3 text-success fw-medium">
                        <Truck size={20} />
                        <span>Arriving on {formatDate(order.arrivingDate)} (4 days delivery)</span>
                      </div>
                    )}
                    {order.status === 'FAILED' && (
                      <div className="alert alert-danger py-2 mb-3 small">
                        <strong>Payment Failure:</strong> {order.failureReason ?? 'Transaction declined.'}
                      </div>
                    )}

                    <Stack gap={2}>
                      {order.items.map((item) => (
                        <div key={item.id} className="d-flex align-items-center gap-3 py-1">
                          <Image
                            src={item.thumbnail}
                            width={54}
                            height={54}
                            className="object-fit-contain bg-body-secondary rounded border"
                            alt={item.title}
                          />
                          <div className="flex-grow-1 min-w-0">
                            <div className="fw-semibold small text-truncate">{item.title}</div>
                            <div className="text-muted small">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </div>
                          </div>
                          <div className="fw-semibold text-end small">
                            {formatPrice(item.discountedTotal)}
                          </div>
                        </div>
                      ))}
                    </Stack>
                  </Card.Body>
                </Card>
              ))}
            </Stack>
          )}
        </Card.Body>
      </Card>
    </Stack>
  );
}