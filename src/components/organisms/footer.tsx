import Logo from "@/components/atoms/logo-with-text";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Logo size="sm" variant="minimal" />
          <p className="text-sm text-muted-foreground">
            © 2025 Grant Guide. Built with AI for the future of interview
            preparation.
          </p>
        </div>
      </div>
    </footer>
  );
}
