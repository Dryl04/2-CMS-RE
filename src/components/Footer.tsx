import { Layout } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Layout className="w-4 h-4 text-gray-900" />
            </div>
            <span className="text-lg font-semibold">SEO Manager</span>
          </div>
          <p className="text-gray-500 text-sm">
            2026 SEO Manager. Tous droits reserves.
          </p>
        </div>
      </div>
    </footer>
  );
}
