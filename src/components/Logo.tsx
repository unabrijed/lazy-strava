export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
      <rect width="100" height="100" rx="20" fill="#FC4C02"/>
      <circle cx="25" cy="70" r="8" fill="white"/>
      <circle cx="50" cy="30" r="8" fill="white"/>
      <circle cx="75" cy="55" r="8" fill="white"/>
      <path d="M25 70 L50 30 L75 55" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
