export const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-slate-900">Lornu AI</div>
          <nav className="space-x-4">
            <a href="/" className="text-slate-600 hover:text-slate-900">Home</a>
            <a href="/documentation" className="text-slate-600 hover:text-slate-900">Documentation</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

