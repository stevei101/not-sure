import { Bot, Workflow, BarChart3 } from 'lucide-react';
import { Header } from './Header';
import { Hero } from './Hero';
import { FeatureCard } from './FeatureCard';
import { StatsSection } from './StatsSection';
import { Footer } from './Footer';

const features = [
  {
    icon: <Bot className="h-6 w-6" />,
    title: "Generative Agents",
    description: "Deploy specialized AI agents that understand your specific codebase and architectural patterns."
  },
  {
    icon: <Workflow className="h-6 w-6" />,
    title: "Workflow Automation",
    description: "Automate repetitive engineering tasks from PR reviews to documentation generation."
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Efficacy Analytics",
    description: "Track the measurable impact of AI adoption on your team's velocity and code quality."
  }
];

export const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 bg-grid-slate-100">
      <Header />

      <main>
        <Hero />

        <StatsSection />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Platform Capabilities
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built for scaling teams, our platform integrates seamlessly into your existing stack
              to supercharge development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

