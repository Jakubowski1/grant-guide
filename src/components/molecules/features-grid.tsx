"use client";

import { Brain, Target, TrendingUp, Users, Zap } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function FeaturesGrid() {
  const features = [
    {
      icon: Brain,
      title: "AI-Generated Questions",
      description:
        "Dynamic, role-specific questions that adapt to your experience level and target position.",
    },
    {
      icon: Target,
      title: "Instant Feedback",
      description:
        "Get detailed analysis of your answers with actionable suggestions for improvement.",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description:
        "Track your improvement over time with detailed performance metrics and insights.",
    },
    {
      icon: Users,
      title: "Role-Specific Practice",
      description:
        "Tailored questions for Frontend, Backend, DevOps, and other engineering roles.",
    },
    {
      icon: Zap,
      title: "Multiple Formats",
      description:
        "Practice with text, voice recording, and whiteboard coding challenges.",
    },
    {
      icon: Brain,
      title: "Smart Follow-ups",
      description:
        "AI maintains context and asks intelligent follow-up questions based on your responses.",
    },
  ];

  return (
    <section className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Why Choose Grant Guide?</h2>
        <p className="text-xl text-muted-foreground">
          Advanced AI technology meets personalized learning
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="border-border bg-card hover:bg-card/80 transition-colors"
          >
            <CardHeader>
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
