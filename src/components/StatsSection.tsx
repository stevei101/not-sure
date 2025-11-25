export const StatsSection = () => {
  return (
    <section className="bg-slate-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">50-70%</div>
            <div className="text-slate-600">Time Reduction</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-slate-600">AI Availability</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
            <div className="text-slate-600">Automation Ready</div>
          </div>
        </div>
      </div>
    </section>
  );
};

