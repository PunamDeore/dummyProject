import { useState } from 'react';
import { Alert, Button, Card, Col, Form, InputGroup, ListGroup, Row, Spinner } from 'react-bootstrap';
import { CreditCard, ShieldCheck } from 'react-bootstrap-icons';
import { Form as RouterForm, useActionData, useNavigation } from 'react-router';
import { useAppSelector, selectCartLines, selectCartSubtotal } from '../../store';
import { formatPrice } from '../../lib/format';
import type { CheckoutResult } from './checkout';

export function PaymentPage() {
  const lines = useAppSelector(selectCartLines);
  const subtotal = useAppSelector(selectCartSubtotal);
  const actionData = useActionData<CheckoutResult>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [cardName, setCardName] = useState('John Doe');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');

  if (lines.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <h5>Your cart is empty</h5>
          <p className="text-muted">Add some products before proceeding to checkout.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Row className="g-4">
      <Col md={7}>
        <Card className="shadow-sm">
          <Card.Header className="fw-semibold d-flex align-items-center">
            <CreditCard className="me-2 text-primary" />
            Payment Details (Test Mode)
          </Card.Header>
          <Card.Body>
            {actionData && !actionData.ok && (
              <Alert variant="danger" className="py-2">
                {actionData.error}
              </Alert>
            )}
            <Alert variant="info" className="small py-2">
              <ShieldCheck className="me-1" /> Dummy card credentials are pre-filled for testing.
            </Alert>
            <RouterForm method="post" action="/account/checkout">
              <Form.Group className="mb-3" controlId="cardName">
                <Form.Label className="small fw-semibold">Cardholder Name</Form.Label>
                <Form.Control
                  name="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="cardNumber">
                <Form.Label className="small fw-semibold">Card Number</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <CreditCard />
                  </InputGroup.Text>
                  <Form.Control
                    name="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                  />
                </InputGroup>
              </Form.Group>
              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3" controlId="cardExpiry">
                    <Form.Label className="small fw-semibold">Expiry (MM/YY)</Form.Label>
                    <Form.Control
                      name="cardExpiry"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mb-3" controlId="cvv">
                    <Form.Label className="small fw-semibold">CVV</Form.Label>
                    <Form.Control
                      name="cvv"
                      type="password"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button type="submit" variant="primary" className="w-100 mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner as="span" size="sm" animation="border" className="me-2" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ${formatPrice(subtotal)}`
                )}
              </Button>
            </RouterForm>
          </Card.Body>
        </Card>
      </Col>
      <Col md={5}>
        <Card className="shadow-sm">
          <Card.Header className="fw-semibold">Order Summary</Card.Header>
          <ListGroup variant="flush">
            {lines.map((line) => (
              <ListGroup.Item key={line.productId} className="d-flex justify-content-between align-items-center">
                <div className="me-auto text-truncate" style={{ maxWidth: '200px' }}>
                  <div className="fw-medium small text-truncate">{line.title}</div>
                  <small className="text-muted">Qty: {line.qty}</small>
                </div>
                <span className="small fw-semibold">{formatPrice(line.price * line.qty)}</span>
              </ListGroup.Item>
            ))}
            <ListGroup.Item className="d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
}