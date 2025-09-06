import { ArrowRight } from "lucide-react";
import Link from "next/link";
import PixelCard from "@/components/molecules/PixelCard";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="container mx-auto px-4 py-20 flex justify-center">
      <PixelCard
        variant="blue"
        colors="#ACE1AF,#8FD19F,#7BC78F"
        className="w-full max-w-3xl relative overflow-hidden"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <h1 className="text-3xl font-bold mb-4 text-foreground">
            Ready to Ace Your Interview?
          </h1>

          <p className="text-base text-muted-foreground mb-6 max-w-sm">
            Join thousands of developers who have improved their interview
            skills with Grant Guide.
          </p>

          <Link href="/register">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </PixelCard>
    </section>
  );
}
