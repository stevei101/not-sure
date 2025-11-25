import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl font-extrabold mb-6">
          Generative AI Platform
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Enhance engineering efficacy with specialized AI agents and workflow automation.
        </p>
        <Link
          to="/documentation"
          className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          View Documentation
        </Link>
      </div>
    </section>
  );
};

