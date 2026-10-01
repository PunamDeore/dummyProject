import  { useState, useRef, useEffect } from 'react';
import { Offcanvas, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { ChatDotsFill, Send } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router';
import { api } from '../api/client';
import { useAppDispatch } from '../store';
import { addToCart, clearCart } from '../store/cartSlice';

interface Message {
  role: 'assistant' | 'user';
  text: string;
}

export function ChatAgentWidget() {
  const [show, setShow] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const conversationIdRef = useRef<string>(crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (msgToSend?: string) => {
    const text = (msgToSend ?? input).trim();
    if (!text || loading) return;

    const newHistory: Message[] = [...messages, { role: 'user', text }];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await api.post<{ response: string }>(
        '/agent/chat',
        {
          message: text,
          conversationId: conversationIdRef.current,
        },
        {
          headers: {
            'X-Time-Zone': userTimeZone,
          },
        }
      );

      let assistantReply = res.data.response;

   
      const cartMatch = assistantReply.match(/\[CART_ACTION:ADD:(.*?)\]/);
      if (cartMatch) {
        try {
          const itemData = JSON.parse(cartMatch[1]);
          dispatch(
            addToCart({
              product: {
                id: Number(itemData.id),
                title: itemData.title,
                price: Number(itemData.price),
                thumbnail: itemData.thumbnail,
              },
              qty: Number(itemData.qty) || 1,
            })
          );
        } catch (e) {
          console.error('Failed to parse cart item payload:', e);
        }
        assistantReply = assistantReply.replace(cartMatch[0], '').trim();
      }
      if (assistantReply.includes('[ACTION:CLEAR_CART]')) {
        dispatch(clearCart());
        assistantReply = assistantReply.replace('[ACTION:CLEAR_CART]', '').trim();
      }

       const hasCheckoutAction =
        assistantReply.includes('[ACTION:OPEN_CHECKOUT]') ||
        /go(ing)? to checkout/i.test(text) ||
        /proceed to checkout/i.test(text);

      if (hasCheckoutAction) {
        assistantReply = assistantReply.replace('[ACTION:OPEN_CHECKOUT]', '').trim();
        setShow(false);
        navigate('/account/checkout');
      }

      setMessages([...newHistory, { role: 'assistant', text: assistantReply }]);
    } catch (err) {
      console.error('AI Agent error:', err);
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          text: 'Unable to connect to the assistant right now. Please verify the backend service is running.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setShow(true);
    if (messages.length === 0) {
      sendMessage('Hi');
    }
  };

  return (
    <>
      <Button
        variant="primary"
        className="position-fixed bottom-0 end-0 m-4 rounded-circle shadow-lg p-3"
        style={{ zIndex: 1050 }}
        onClick={handleOpen}
        aria-label="Open AI Assistant"
      >
        <ChatDotsFill size={24} />
      </Button>

      <Offcanvas show={show} onHide={() => setShow(false)} placement="end" style={{ width: '420px' }}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="h6 fw-bold">ShopScope Assistant</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <div className="flex-grow-1 overflow-auto mb-3 pe-1">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 my-2 rounded-3 ${
                  m.role === 'user'
                    ? 'bg-primary text-white text-end ms-5'
                    : 'bg-body-secondary text-body me-5 border'
                }`}
                style={{ whiteSpace: 'pre-wrap', lineHeight: '1.45' }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="text-muted small d-flex align-items-center gap-2 p-2">
                <Spinner size="sm" animation="border" /> Assistant is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <InputGroup>
              <Form.Control
                placeholder="Type 'laptop', 'add to cart', 'checkout'..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <Button variant="primary" type="submit" disabled={loading || !input.trim()}>
                <Send />
              </Button>
            </InputGroup>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}