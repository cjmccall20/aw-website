export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="hero-gradient border-b border-line">
      <div className="container-content py-16 sm:py-20 lg:py-24">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-4" : ""} font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance max-w-3xl`}>{title}</h1>
        {description && (
          <p className="mt-6 text-lg sm:text-xl text-ink-soft max-w-2xl text-pretty">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
