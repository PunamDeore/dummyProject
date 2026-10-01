import { useRef, useState } from 'react';
import { Alert, Button, Card, Form, ProgressBar } from 'react-bootstrap';
import { uploadFile, type UploadResult } from '../api/services/uploads';
import { ApiError } from '../lib/ApiError';

export function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  async function handleUpload() {
    if (!file) return;

    setBusy(true);
    setError(null);
    setResult(null);
    setProgress(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await uploadFile(file, {
        signal: controller.signal,
        onProgress: (p) => setProgress(p),
      });
      setResult(res);
      setProgress(100);
    } catch (err) {
      if ((err as Error)?.name !== 'CanceledError') {
        setError(ApiError.from(err).message);
      }
    } finally {
      setBusy(false);
      abortControllerRef.current = null;
    }
  }

  function handleCancel() {
    abortControllerRef.current?.abort();
    setBusy(false);
    setProgress(0);
  }

  return (
    <Card className="mt-4">
      <Card.Header className="fw-semibold">Upload a profile picture</Card.Header>
      <Card.Body>
        <Form.Group controlId="uploaderFile" className="mb-3">
          <Form.Label className="small fw-semibold">Select image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFile(e.target.files?.[0] ?? null);
              setError(null);
              setResult(null);
            }}
          />
        </Form.Group>

        {busy && (
          <div className="mb-3">
            <ProgressBar
              now={progress}
              label={progress === 100 ? 'Processing...' : `${progress}%`}
              animated={progress < 100}
            />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}
        {result && (
          <Alert variant="success">
            Upload successful! Received {Math.round(result.size / 1024)} KB.
          </Alert>
        )}

        <div className="d-flex gap-2">
          <Button variant="primary" onClick={handleUpload} disabled={!file || busy}>
            {busy ? 'Uploading...' : 'Upload'}
          </Button>
          {busy && (
            <Button variant="outline-secondary" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}