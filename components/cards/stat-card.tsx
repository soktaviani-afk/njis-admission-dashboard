import {
  LucideIcon,
} from "lucide-react";

type StatCardProps = {
  title: string;

  value: string | number;

  subtitle?: string;

  icon?: LucideIcon;
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-7 shadow-[0_15px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(15,23,42,0.10)]">
      {/* Glow */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100/40 blur-3xl transition-all duration-500 group-hover:scale-125" />

      {/* Top */}
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            {title}
          </p>

          <h3 className="mt-5 break-words text-4xl font-extrabold leading-tight tracking-tight text-[#071739] xl:text-5xl">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
            <Icon
              size={30}
            />
          </div>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="relative mt-5 text-sm leading-relaxed text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}