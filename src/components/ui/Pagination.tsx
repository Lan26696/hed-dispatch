/**
 * 分页组件
 */

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex items-center justify-between border-t border-slate-800/50 bg-slate-800/20 px-6 py-4">
      <p className="text-sm text-slate-500">
        共 <span className="font-medium text-slate-300">{total}</span> 条记录
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={!hasPrev}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-400 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          上一页
        </button>
        <span className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-white">
          {page}
        </span>
        {totalPages > 1 && (
          <span className="text-slate-500">/ {totalPages}</span>
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={!hasNext}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-400 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    </div>
  );
}
