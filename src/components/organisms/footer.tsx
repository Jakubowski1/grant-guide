import Logo from "@/components/atoms/logo-the-mockr";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © 2025 Themockr. Built with AI for the future of interview
            preparation.
          </p>
        </div>
      </div>
    </footer>
  );
}
