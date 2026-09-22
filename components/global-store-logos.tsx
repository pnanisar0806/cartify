interface LogoProps {
  className?: string;
}

export function InstacartLogo({ className = "h-5 w-auto" }: LogoProps) {
  return (
    <svg viewBox="0 0 120 30" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="22" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#43B02A">instacart</text>
    </svg>
  );
}

export function WalmartLogo({ className = "h-5 w-auto" }: LogoProps) {
  return (
    <svg viewBox="0 0 120 30" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="22" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#0071CE">Walmart</text>
      <circle cx="110" cy="15" r="5" fill="#FFC220" />
    </svg>
  );
}

export function TargetLogo({ className = "h-5 w-auto" }: LogoProps) {
  return (
    <svg viewBox="0 0 100 30" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="22" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#CC0000">TARGET</text>
    </svg>
  );
}

export function TescoLogo({ className = "h-5 w-auto" }: LogoProps) {
  return (
    <svg viewBox="0 0 100 30" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="22" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#00539F">TESCO</text>
    </svg>
  );
}

export function SainsburysLogo({ className = "h-5 w-auto" }: LogoProps) {
  return (
    <svg viewBox="0 0 120 30" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="22" fontFamily="sans-serif" fontSize="22" fontWeight="bold" fill="#F06C00">Sainsbury's</text>
    </svg>
  );
}

export function OcadoLogo({ className = "h-5 w-auto" }: LogoProps) {
  return (
    <svg viewBox="0 0 100 30" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="22" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#6F2C91">ocado</text>
    </svg>
  );
}

export function AmazonFreshUSLogo({ className = "h-5 w-auto" }: LogoProps) {
  return (
    <svg viewBox="0 0 150 30" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="22" fontFamily="sans-serif" fontSize="22" fontWeight="bold" fill="#000000">amazon</text>
      <text x="95" y="22" fontFamily="sans-serif" fontSize="22" fontWeight="bold" fill="#16a34a">fresh</text>
    </svg>
  );
}

export function AmazonFreshUKLogo({ className = "h-5 w-auto" }: LogoProps) {
  return (
    <svg viewBox="0 0 150 30" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="22" fontFamily="sans-serif" fontSize="22" fontWeight="bold" fill="#000000">amazon</text>
      <text x="95" y="22" fontFamily="sans-serif" fontSize="22" fontWeight="bold" fill="#16a34a">fresh</text>
    </svg>
  );
}
