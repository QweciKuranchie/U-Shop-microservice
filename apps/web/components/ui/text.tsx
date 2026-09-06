import { cn } from "@repo/utils";
const Title = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h2
      className={cn(
        "text-3xl md:text-3xl font-bold  capitalize tracking-wide font-sans",
        className,
      )}
    >
      {children}
    </h2>
  );
};
const SubTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h3
      className={cn(
        "text-sm md:text-sm font-semibold text-white capitalize tracking-wide font-sans",
        className,
      )}
    >
      {children}
    </h3>
  );
};
const SubText=(

  {
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }
)=>{
  return (
    <p
      className={cn(
        "text-sm md:text-sm text-white capitalize tracking-wide font-sans",
        className,
      )}
    >
      {children}
    </p>
  );
}
export { Title, SubTitle, SubText }
