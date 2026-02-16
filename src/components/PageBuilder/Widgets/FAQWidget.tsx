import { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface FAQWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function FAQWidget({ section }: FAQWidgetProps) {
  const { title, subtitle, faqs } = section.content;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;
  const accentColor = section.design?.colors?.accent || undefined;

  const headingStyle = headingColor ? { color: headingColor } : undefined;
  const textStyle = textColor ? { color: textColor } : undefined;
  const accentStyle = accentColor ? { color: accentColor } : undefined;

  const defaultFaqs = [
    {
      question: 'How do I get started?',
      answer: 'Getting started is easy! Simply sign up for an account, choose your plan, and you\'ll have access to all our features immediately.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for enterprise customers.',
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.',
    },
    {
      question: 'Do you offer customer support?',
      answer: 'We offer 24/7 customer support via email, chat, and phone for all our customers.',
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required.',
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Absolutely! You can change your plan at any time from your account settings.',
    },
  ];

  const renderAccordion = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {title || 'Frequently Asked Questions'}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={textStyle}
        >
          {subtitle || 'Find answers to common questions'}
        </p>
      </div>

      <div className="space-y-4">
        {(faqs || defaultFaqs).map((faq: any, index: number) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-base-100 rounded-xl border border-base-content/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-base-200 transition-colors"
              >
                <span
                  className="text-lg font-semibold pr-8 text-base-content"
                  style={headingStyle}
                >
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform text-primary ${isOpen ? 'rotate-180' : ''}`}
                  style={accentStyle}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-0">
                  <p
                    className="text-base leading-relaxed text-base-content/70"
                    style={textStyle}
                  >
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTwoColumns = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {title || 'FAQ'}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={textStyle}
        >
          {subtitle || 'Everything you need to know'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {(faqs || defaultFaqs).map((faq: any, index: number) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-base-100 rounded-xl border border-base-content/10 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-6 py-4 text-left flex items-start justify-between hover:bg-base-200 transition-colors"
              >
                <span
                  className="text-base font-semibold pr-4 text-base-content"
                  style={headingStyle}
                >
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform mt-0.5 text-primary ${isOpen ? 'rotate-180' : ''}`}
                  style={accentStyle}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-4">
                  <p
                    className="text-sm leading-relaxed text-base-content/70"
                    style={textStyle}
                  >
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {title || 'Common Questions'}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={textStyle}
        >
          {subtitle || 'Quick answers to questions you may have'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(faqs || defaultFaqs).map((faq: any, index: number) => (
          <div
            key={index}
            className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-content/10 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10"
              style={accentColor ? { backgroundColor: `${accentColor}15` } : undefined}
            >
              <span
                className="text-xl font-bold text-primary"
                style={accentStyle}
              >
                Q
              </span>
            </div>
            <h3
              className="text-lg font-bold mb-3 text-base-content"
              style={headingStyle}
            >
              {faq.question}
            </h3>
            <p
              className="text-sm leading-relaxed text-base-content/70"
              style={textStyle}
            >
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGradient = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={headingStyle}
        >
          {title || 'Got Questions?'}
        </h2>
        <p
          className="text-lg sm:text-xl text-base-content/70"
          style={textStyle}
        >
          {subtitle || 'We have answers'}
        </p>
      </div>

      <div className="space-y-6">
        {(faqs || defaultFaqs).map((faq: any, index: number) => {
          const isOpen = openIndex === index;
          const gradients = [
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-pink-500 to-pink-600',
            'from-orange-500 to-orange-600',
            'from-teal-500 to-teal-600',
            'from-red-500 to-red-600',
          ];
          return (
            <div
              key={index}
              className={`bg-gradient-to-r ${gradients[index % 6]} rounded-2xl overflow-hidden shadow-xl`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between text-white hover:brightness-110 transition-all"
              >
                <span className="text-lg font-semibold pr-8">{faq.question}</span>
                {isOpen ? (
                  <Minus className="w-6 h-6 flex-shrink-0" />
                ) : (
                  <Plus className="w-6 h-6 flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-0 text-white">
                  <p className="text-base leading-relaxed opacity-95">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  switch (section.variant) {
    case 'two-columns':
      return renderTwoColumns();
    case 'cards':
      return renderCards();
    case 'gradient':
      return renderGradient();
    default:
      return renderAccordion();
  }
}
