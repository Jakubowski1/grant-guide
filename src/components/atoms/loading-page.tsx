import Logo from "@/components/atoms/logo-with-text";

interface LoadingPageProps {
  message?: string;
}

export default function LoadingPage({
  message = "Loading...",
}: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <Logo size="md" />
        <p className="mt-4 text-muted-foreground">{message}</p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
}
