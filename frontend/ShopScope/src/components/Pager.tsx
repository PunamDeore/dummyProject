import { Pagination } from 'react-bootstrap';

interface PagerProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}
export function Pager({ page, pageCount, onChange }: PagerProps) {
  if (pageCount <= 1) return null;

  return (
    <Pagination className="justify-content-center mt-4 mb-0">
      <Pagination.Prev disabled={page === 0} onClick={() => onChange(page - 1)} />
      <Pagination.Item disabled>
        Page {page + 1} of {pageCount}
      </Pagination.Item>
      <Pagination.Next disabled={page >= pageCount - 1} onClick={() => onChange(page + 1)} />
    </Pagination>
  );
}
