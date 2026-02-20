import React from 'react';
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

  const design = section.design || {};
  const typo = design.typography || {};
  const headingStyle: React.CSSProperties = {
    ...(typo.headingFontFamily || typo.fontFamily ? { fontFamily: typo.headingFontFamily || typo.fontFamily } : {}),
    ...(typo.headingFontWeight ? { fontWeight: typo.headingFontWeight } : {}),
    ...(typo.headingFontSize ? { fontSize: typo.headingFontSize } : {}),
  };
  const textStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo.textFontSize ? { fontSize: typo.textFontSize } : {}),
  };
  const subtitleStyle: React.CSSProperties = {
    ...(typo.fontFamily ? { fontFamily: typo.fontFamily } : {}),
  };

  const accentColor = design.colors?.accent;

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
          style={subtitleStyle}
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
                  className="text-base sm:text-lg font-semibold pr-4 sm:pr-8 text-base-content"
                  style={headingStyle}
                >
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform text-primary ${isOpen ? 'rotate-180' : ''}`}
                  style={accentColor ? { color: accentColor } : undefined}
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
          style={subtitleStyle}
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
                  style={accentColor ? { color: accentColor } : undefined}
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
          style={subtitleStyle}
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
                style={accentColor ? { color: accentColor } : undefined}
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
          style={subtitleStyle}
        >
          {subtitle || 'We have answers'}
        </p>
      </div>

      <div className="space-y-6">
        {(faqs || defaultFaqs).map((faq: any, index: number) => {
          const isOpen = openIndex === index;
          const variants = [
            'bg-primary text-primary-content',
            'bg-secondary text-secondary-content',
            'bg-accent text-accent-content',
            'bg-info text-info-content',
            'bg-success text-success-content',
            'bg-error text-error-content',
          ];
          return (
            <div
              key={index}
              className={`${variants[index % 6]} rounded-2xl overflow-hidden shadow-xl`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:brightness-110 transition-all"
              >
                <span className="text-lg font-semibold pr-8">{faq.question}</span>
                {isOpen ? (
                  <Minus className="w-6 h-6 flex-shrink-0" />
                ) : (
                  <Plus className="w-6 h-6 flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-0">
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
