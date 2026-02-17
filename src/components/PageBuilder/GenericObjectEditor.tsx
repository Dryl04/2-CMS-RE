import { Plus, Trash2 } from 'lucide-react';
import ImageUploadField from './ImageUploadField';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

interface GenericObjectEditorProps {
  value: JsonValue;
  onChange: (value: JsonValue) => void;
  depth?: number;
  label?: string;
  path?: string;
}

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent';

const isPlainObject = (value: unknown): value is JsonObject => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const createEmptyFromSample = (sample: JsonValue): JsonValue => {
  if (Array.isArray(sample)) {
    if (sample.length === 0) return [];
    return [createEmptyFromSample(sample[0])];
  }

  if (isPlainObject(sample)) {
    return Object.keys(sample).reduce((acc, key) => {
      acc[key] = createEmptyFromSample(sample[key]);
      return acc;
    }, {} as JsonObject);
  }

  if (typeof sample === 'number') return 0;
  if (typeof sample === 'boolean') return false;
  return '';
};

const prettifyLabel = (label?: string) => {
  if (!label) return '';
  return label
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
};

const isMediaField = (label?: string) => {
  if (!label) return false;
  const key = label.toLowerCase();
  return /(image|logo|avatar|thumbnail|banner|cover|photo|media|video)/.test(key);
};

const isVideoField = (label?: string) => {
  if (!label) return false;
  return /video/.test(label.toLowerCase());
};

const isHexColor = (value: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());

const normalizeColorForPicker = (value: string) => {
  const trimmed = value.trim();
  if (isHexColor(trimmed)) {
    if (trimmed.length === 4) {
      return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
    }
    return trimmed;
  }
  return '#000000';
};

const isColorField = (label: string | undefined, path: string | undefined, value: string) => {
  const source = `${(path || '').toLowerCase()} ${(label || '').toLowerCase()}`;
  const semanticColorKey = /(color|headingcolor|textcolor|accent|primary|secondary|buttonbackground|buttontext|iconbackground|iconcolor|overlay\.color)/.test(source);
  const backgroundColorValueKey = /background\.value/.test(source) && isHexColor(value);
  return semanticColorKey || backgroundColorValueKey;
};

function GenericValueField({ value, onChange, label, depth = 0, path = '' }: GenericObjectEditorProps) {
  const displayLabel = prettifyLabel(label);
  const hasLabel = Boolean(label);

  if (Array.isArray(value)) {
    const sample = value[0];

    return (
      <div className="space-y-2">
        {hasLabel && <p className="text-xs font-semibold text-gray-600 uppercase">{displayLabel}</p>}

        {value.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase">Élément {index + 1}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_: JsonValue, i: number) => i !== index))}
                className="btn btn-ghost btn-xs text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <GenericValueField
              value={item}
              onChange={(next) => {
                const updated = [...value];
                updated[index] = next;
                onChange(updated);
              }}
              depth={depth + 1}
              path={`${path}[${index}]`}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            const newItem = sample !== undefined ? createEmptyFromSample(sample) : '';
            onChange([...(value || []), newItem]);
          }}
          className="btn btn-outline btn-xs gap-1"
        >
          <Plus className="w-3 h-3" /> Ajouter
        </button>
      </div>
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);

    return (
      <div className="space-y-3">
        {hasLabel && <p className="text-xs font-semibold text-gray-600 uppercase">{displayLabel}</p>}

        {entries.map(([key, childValue]) => (
          <GenericValueField
            key={key}
            label={key}
            value={childValue}
            depth={depth + 1}
            path={path ? `${path}.${key}` : key}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        ))}
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
        />
        <span className="text-sm text-gray-700">{displayLabel || 'Activé'}</span>
      </label>
    );
  }

  if (typeof value === 'number') {
    return (
      <div>
        {hasLabel && <label className="block text-sm font-medium text-gray-700 mb-1">{displayLabel}</label>}
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className={inputClass}
        />
      </div>
    );
  }

  const textValue = value == null ? '' : String(value);

  if (isMediaField(label)) {
    return (
      <ImageUploadField
        label={displayLabel || 'Média'}
        value={textValue}
        onChange={(next) => onChange(next)}
        mediaType={isVideoField(label) ? 'video' : 'auto'}
      />
    );
  }

  if (isColorField(label, path, textValue)) {
    return (
      <div>
        {hasLabel && <label className="block text-sm font-medium text-gray-700 mb-1">{displayLabel}</label>}
        <input
          type="color"
          value={normalizeColorForPicker(textValue)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 rounded border border-gray-300"
        />
      </div>
    );
  }

  const multiline = textValue.length > 100 || textValue.includes('\n');

  return (
    <div>
      {hasLabel && <label className="block text-sm font-medium text-gray-700 mb-1">{displayLabel}</label>}
      {multiline ? (
        <textarea
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

export default function GenericObjectEditor({ value, onChange, label }: GenericObjectEditorProps) {
  return <GenericValueField value={value} onChange={onChange} label={label} depth={0} path={label || ''} />;
}
