import { eyebrowClass } from "@/components/common/styles";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <span className={eyebrowClass}>{eyebrow}</span>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#154734] leading-tight tracking-tight">
          {title}
        </h1>
      </div>
      {children}
    </header>
  );
}
