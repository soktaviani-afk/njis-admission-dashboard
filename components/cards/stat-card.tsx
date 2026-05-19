type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function StatCard({
  title,
  value,
  subtitle,
}: StatCardProps) {
  return (
    <div className="rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <h3 className="mt-4 text-4xl font-extrabold tracking-tight text-[#071739]">
        {value}
      </h3>

      {subtitle && (
        <p className="mt-3 text-sm text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}