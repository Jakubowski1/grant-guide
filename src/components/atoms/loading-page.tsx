import Logo from "@/components/atoms/logo-grant-guide";

interface LoadingPageProps {
  message?: string;
}

export default function LoadingPage({
  message = "Loading...",
}: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center animate-pulse space-y-4">
        <Logo size="md" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
