import Image from "next/image";
import Link from "next/link";

interface FoxLogoProps {
  size?: number;
  showText?: boolean;
  textClassName?: string;
  href?: string;
  className?: string;
}

export function FoxLogo({
  size = 28,
  showText = true,
  textClassName = "text-xl font-bold tracking-tight",
  href = "/",
  className = "",
}: FoxLogoProps) {
  const content = (
    <>
      <Image src="/fox-icon.svg" width={size} height={size} alt="DELO 로고" priority />
      {showText && <span className={textClassName}>DELO</span>}
    </>
  );

  return (
    <Link href={href} className={`flex items-center gap-2.5 ${className}`}>
      {content}
    </Link>
  );
}
