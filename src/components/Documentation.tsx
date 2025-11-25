export const Documentation = () => {
  return (
    <div className="min-h-screen bg-slate-50 bg-grid-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </a>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">
          Documentation
        </h1>
        
        <div className="prose prose-slate max-w-none">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Getting Started</h2>
            <p className="text-slate-600 mb-4">
              Welcome to the Lornuai Inc. Generative AI platform documentation. This platform is designed
              to enhance engineering efficacy by automating critical workflows.
            </p>
            <p className="text-slate-600">
              Our platform provides a measurable <strong>50-70% reduction</strong> in time and investment
              for engineering tasks through specialized AI agents and workflow automation.
            </p>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Platform Capabilities</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Generative Agents</h3>
                <p className="text-slate-600">
                  Deploy specialized AI agents that understand your specific codebase and architectural patterns.
                  These agents can assist with code reviews, documentation generation, and architectural decisions.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Workflow Automation</h3>
                <p className="text-slate-600">
                  Automate repetitive engineering tasks from PR reviews to documentation generation. Our platform
                  integrates seamlessly with your existing development tools and processes.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Efficacy Analytics</h3>
                <p className="text-slate-600">
                  Track the measurable impact of AI adoption on your team's velocity and code quality. Monitor
                  time savings, automation rates, and ROI metrics in real-time.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">API Reference</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  <code className="bg-slate-100 px-2 py-1 rounded text-sm">GET /api/status</code>
                </h3>
                <p className="text-slate-600">
                  Health check endpoint. Returns system status and available AI models.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  <code className="bg-slate-100 px-2 py-1 rounded text-sm">POST /api/query</code>
                </h3>
                <p className="text-slate-600 mb-2">
                  Query AI models. Requires Cloudflare Access authentication.
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Request Body:</p>
                  <pre className="text-sm text-slate-600">
{`{
  "prompt": "Your query here",
  "model": "llama-3.3-70b" // optional
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication</h2>
            <p className="text-slate-600 mb-4">
              This platform is protected by Cloudflare Access and requires Google Workspace authentication
              with an <strong>@lornu.ai</strong> email address.
            </p>
            <p className="text-slate-600">
              All API requests are automatically authenticated through Cloudflare Access JWT tokens.
              No additional API keys are required for internal employees.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

