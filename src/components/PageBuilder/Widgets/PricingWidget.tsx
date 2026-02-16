import { Check } from 'lucide-react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface PricingWidgetProps {
  section: PageBuilderSection;
  onUpdate: (updates: Partial<PageBuilderSection>) => void;
}

export default function PricingWidget({ section }: PricingWidgetProps) {
  const { title, subtitle, plans } = section.content;

  const headingColor = section.design?.typography?.headingColor || undefined;
  const textColor = section.design?.typography?.textColor || undefined;
  const accentColor = section.design?.colors?.accent || undefined;

  const renderCards = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={{ color: headingColor }}
        >
          {title || 'Simple, Transparent Pricing'}
        </h2>
        <p className="text-lg sm:text-xl text-base-content/70" style={{ color: textColor }}>
          {subtitle || 'Choose the perfect plan for your needs'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {(plans || [
          { name: 'Starter', price: '$29', period: '/month', features: ['10 Projects', '5GB Storage', 'Basic Support'], popular: false },
          { name: 'Professional', price: '$79', period: '/month', features: ['Unlimited Projects', '50GB Storage', 'Priority Support', 'Advanced Analytics'], popular: true },
          { name: 'Enterprise', price: '$199', period: '/month', features: ['Unlimited Everything', 'Custom Storage', '24/7 Support', 'Dedicated Manager'], popular: false },
        ]).map((plan: any, index: number) => (
          <div
            key={index}
            className={`relative bg-base-100 rounded-2xl shadow-xl p-8 transition-transform hover:scale-105 ${
              plan.popular ? 'ring-2 ring-offset-2 border-primary ring-primary' : 'border border-base-content/10'
            }`}
            style={plan.popular && accentColor ? { borderColor: accentColor, ringColor: accentColor } : {}}
          >
            {plan.popular && (
              <div
                className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold bg-primary text-primary-content"
                style={{ backgroundColor: accentColor }}
              >
                Most Popular
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2 text-base-content" style={{ color: headingColor }}>
                {plan.name}
              </h3>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-primary" style={{ color: accentColor }}>
                  {plan.price}
                </span>
                <span className="text-base-content/50 ml-2">{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <Check className="w-5 h-5 mr-3 flex-shrink-0 text-primary" style={{ color: accentColor }} />
                  <span className="text-base-content/70" style={{ color: textColor }}>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all hover:shadow-lg ${
                plan.popular ? 'bg-primary text-primary-content' : 'bg-transparent text-primary border-2 border-primary'
              }`}
              style={{
                backgroundColor: plan.popular ? accentColor : undefined,
                color: plan.popular ? undefined : accentColor,
                borderColor: accentColor,
              }}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComparison = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={{ color: headingColor }}
        >
          {title || 'Compare Plans'}
        </h2>
        <p className="text-lg sm:text-xl text-base-content/70" style={{ color: textColor }}>
          {subtitle || 'Find the perfect fit for your business'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-base-100 rounded-2xl shadow-xl overflow-hidden">
          <thead className="bg-primary text-primary-content" style={{ backgroundColor: accentColor }}>
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Features</th>
              {(plans || [
                { name: 'Starter' },
                { name: 'Professional' },
                { name: 'Enterprise' },
              ]).map((plan: any, index: number) => (
                <th key={index} className="px-6 py-4 text-center font-semibold">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-base-content/10">
            {['Projects', 'Storage', 'Support', 'Analytics', 'Custom Domain'].map((feature, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 font-medium text-base-content" style={{ color: headingColor }}>
                  {feature}
                </td>
                <td className="px-6 py-4 text-center">
                  <Check className="w-5 h-5 mx-auto text-primary" style={{ color: accentColor }} />
                </td>
                <td className="px-6 py-4 text-center">
                  <Check className="w-5 h-5 mx-auto text-primary" style={{ color: accentColor }} />
                </td>
                <td className="px-6 py-4 text-center">
                  <Check className="w-5 h-5 mx-auto text-primary" style={{ color: accentColor }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderToggle = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-base-content"
          style={{ color: headingColor }}
        >
          {title || 'Flexible Pricing'}
        </h2>
        <p className="text-lg sm:text-xl mb-6 text-base-content/70" style={{ color: textColor }}>
          {subtitle || 'Save 20% with annual billing'}
        </p>
        <div className="inline-flex items-center bg-base-200 rounded-full p-1">
          <button className="px-6 py-2 rounded-full font-semibold bg-primary text-primary-content" style={{ backgroundColor: accentColor }}>
            Monthly
          </button>
          <button className="px-6 py-2 rounded-full font-semibold text-base-content/60">
            Annual
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {(plans || [
          { name: 'Professional', price: '$79', features: ['Everything in Starter', 'Priority Support', 'Advanced Features'] },
          { name: 'Enterprise', price: '$199', features: ['Everything in Pro', '24/7 Support', 'Custom Solutions'] },
        ]).slice(0, 2).map((plan: any, index: number) => (
          <div key={index} className="bg-base-100 rounded-2xl shadow-xl p-8 border-2 border-base-content/5 hover:border-base-content/20 transition-all">
            <h3 className="text-2xl font-bold mb-2 text-base-content" style={{ color: headingColor }}>
              {plan.name}
            </h3>
            <div className="flex items-baseline mb-6">
              <span className="text-5xl font-bold text-primary" style={{ color: accentColor }}>
                {plan.price}
              </span>
              <span className="text-base-content/50 ml-2">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-center">
                  <Check className="w-5 h-5 mr-3 text-primary" style={{ color: accentColor }} />
                  <span className="text-base-content/70" style={{ color: textColor }}>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className="w-full py-3 px-6 rounded-xl font-semibold transition-all hover:shadow-lg bg-primary text-primary-content"
              style={{ backgroundColor: accentColor }}
            >
              Start Free Trial
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4 text-base-content"
          style={{ color: headingColor }}
        >
          {title || 'One Simple Price'}
        </h2>
        <p className="text-lg text-base-content/70" style={{ color: textColor }}>
          {subtitle || 'Everything you need, nothing you don\'t'}
        </p>
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-content/10 p-12 text-center">
        <div className="mb-8">
          <div className="flex items-baseline justify-center">
            <span className="text-6xl font-bold text-primary" style={{ color: accentColor }}>
              $99
            </span>
            <span className="text-base-content/50 ml-2 text-xl">/month</span>
          </div>
          <p className="mt-2 text-sm text-base-content/50">Billed monthly, cancel anytime</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
          {[
            'Unlimited Projects',
            'Unlimited Storage',
            'Priority Support',
            'Advanced Analytics',
            'Custom Domain',
            'Team Collaboration',
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center">
              <Check className="w-5 h-5 mr-3 text-primary" style={{ color: accentColor }} />
              <span className="text-base-content/70" style={{ color: textColor }}>{feature}</span>
            </div>
          ))}
        </div>

        <button
          className="px-12 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl bg-primary text-primary-content"
          style={{ backgroundColor: accentColor }}
        >
          Get Started Now
        </button>
      </div>
    </div>
  );

  switch (section.variant) {
    case 'comparison':
      return renderComparison();
    case 'toggle':
      return renderToggle();
    case 'minimal':
      return renderMinimal();
    default:
      return renderCards();
  }
}
