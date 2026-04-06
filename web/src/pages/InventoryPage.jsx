import { Archive, CircleDollarSign, Layers3, PackageSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InventoryPage({ assets = [] }) {
  const totalValue = assets.reduce((sum, asset) => sum + asset.price, 0);
  const activeCount = assets.filter((asset) => asset.status.toLowerCase() === "active").length;
  const categoryCount = new Set(assets.map((asset) => asset.category)).size;

  if (assets.length === 0) {
    return (
      <Card className="rounded-[1.5rem] border-white/55 bg-white/62 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
        <CardContent className="flex min-h-[18rem] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.1rem] bg-slate-100 text-slate-400">
            <PackageSearch className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">No assets imported yet</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Upload a CSV or spreadsheet to start visualizing your inventory, categories, and statuses here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<Archive className="h-5 w-5 text-cyan-100" />}
          label="Tracked Assets"
          value={assets.length}
          tone="from-slate-950 via-slate-800 to-blue-900"
        />
        <SummaryCard
          icon={<Layers3 className="h-5 w-5 text-cyan-100" />}
          label="Categories"
          value={categoryCount}
          tone="from-blue-900 via-blue-700 to-cyan-500"
        />
        <SummaryCard
          icon={<CircleDollarSign className="h-5 w-5 text-cyan-100" />}
          label="Portfolio Value"
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subvalue={`${activeCount} active`}
          tone="from-emerald-900 via-teal-700 to-cyan-500"
        />
      </section>

      <Card className="overflow-hidden rounded-[1.5rem] border-white/55 bg-white/62 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/75">
              <TableRow className="border-slate-200/70 hover:bg-transparent">
                <TableHead className="px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-5">
                  Asset Name
                </TableHead>
                <TableHead className="px-3 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-4">
                  Category
                </TableHead>
                <TableHead className="px-3 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-4">
                  Status
                </TableHead>
                <TableHead className="hidden px-3 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 lg:table-cell lg:px-4">
                  Purchase Date
                </TableHead>
                <TableHead className="px-4 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-5">
                  Value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id} className="border-slate-200/60 hover:bg-slate-50/70">
                  <TableCell className="px-4 py-3.5 sm:px-5">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{asset.name}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">Asset record</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3.5 text-sm text-slate-600 sm:px-4">{asset.category}</TableCell>
                  <TableCell className="px-3 py-3.5 sm:px-4">
                    <StatusBadge status={asset.status} />
                  </TableCell>
                  <TableCell className="hidden px-3 py-3.5 text-sm text-slate-600 lg:table-cell lg:px-4">
                    {asset.purchaseDate || "Not available"}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-right text-sm font-semibold text-slate-900 sm:px-5">
                    ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ icon, label, value, subvalue, tone }) {
  return (
    <Card className={`rounded-[1.35rem] border border-slate-900/80 bg-gradient-to-br ${tone} py-0 text-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-white/10 ring-1 ring-white/12">
          {icon}
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold text-white">{value}</p>
        {subvalue ? <p className="mt-1.5 text-xs text-white/70 sm:text-sm">{subvalue}</p> : null}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const normalized = status.toLowerCase();
  const tone =
    normalized === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : normalized === "repair"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : normalized === "storage"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <Badge className={`border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${tone}`}>
      {status}
    </Badge>
  );
}
