'use client';

import { useMemo, useState } from 'react';
import { updateForm } from '@/app/actions-forms';
import { ArrowDown, ArrowUp, Plus, Trash2, Loader2 } from 'lucide-react';
import { FORM_FIELD_TYPES, FormField, FormFieldType, FormLayout, sanitizeFormLayout, sanitizeKey } from '@/lib/forms';
import { useRouter } from 'next/navigation';

type FormBuilderEditorProps = {
  siteId: string;
  form: {
    id: string;
    name: string;
    ctaText: string | null;
    additionalSubmitUrl: string | null;
    fields: unknown;
    layout?: string | null;
  };
};

function reorderFields(fields: FormField[]) {
  return fields.map((field, index) => ({ ...field, order: index }));
}

export default function FormBuilderEditor({ siteId, form }: FormBuilderEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(form.name);
  const [ctaText, setCtaText] = useState(form.ctaText || 'Submit');
  const [additionalSubmitUrl, setAdditionalSubmitUrl] = useState(form.additionalSubmitUrl || '');
  const [layout, setLayout] = useState<FormLayout>(sanitizeFormLayout(form.layout));
  const [fields, setFields] = useState<FormField[]>(Array.isArray(form.fields) ? (form.fields as FormField[]) : []);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    if (!ctaText.trim()) return false;
    if (!fields.length) return false;
    return fields.every((field) => field.key.trim());
  }, [name, ctaText, fields]);

  const addField = () => {
    const nextIndex = fields.length + 1;
    const id = `field_${Date.now()}`;
    const label = `Field ${nextIndex}`;
    const key = sanitizeKey(label);
    setFields((current) =>
      reorderFields([
        ...current,
        {
          id,
          label,
          key,
          type: 'text',
          required: false,
          placeholder: '',
          order: current.length,
        },
      ])
    );
  };

  const removeField = (index: number) => {
    setFields((current) => reorderFields(current.filter((_, i) => i !== index)));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    setFields((current) => {
      const next = [...current];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return reorderFields(next);
    });
  };

  const updateField = (index: number, patch: Partial<FormField>) => {
    setFields((current) =>
      reorderFields(
        current.map((field, i) => {
          if (i !== index) return field;
          const next = { ...field, ...patch };
          if (patch.label !== undefined && patch.key === undefined) {
            next.key = sanitizeKey(patch.label) || next.key;
          }
          return next;
        })
      )
    );
  };

  const onSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await updateForm(form.id, siteId, {
        name: name.trim(),
        ctaText: ctaText.trim(),
        additionalSubmitUrl: additionalSubmitUrl.trim() || null,
        fields: reorderFields(fields),
        layout,
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to save form changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Form Settings</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm text-gray-600">Form Name</span>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-600">CTA Text</span>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
            />
          </label>
        </div>
        <label className="space-y-1 block">
          <span className="text-sm text-gray-600">Additional Submit URL (optional)</span>
          <input
            className="w-full px-3 py-2 border rounded-lg"
            type="url"
            placeholder="https://example.com/webhook"
            value={additionalSubmitUrl}
            onChange={(e) => setAdditionalSubmitUrl(e.target.value)}
          />
        </label>
        <label className="space-y-1 block">
          <span className="text-sm text-gray-600">Layout</span>
          <select
            className="w-full px-3 py-2 border rounded-lg bg-white"
            value={layout}
            onChange={(e) => setLayout(sanitizeFormLayout(e.target.value))}
          >
            <option value="stacked">Stacked</option>
            <option value="inlineDesktop">Inline on desktop (stacked on mobile)</option>
          </select>
        </label>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Fields</h2>
          <button
            type="button"
            onClick={addField}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
          >
            <Plus size={14} />
            Add Field
          </button>
        </div>

        {fields.length === 0 ? (
          <p className="text-sm text-gray-500">Add at least one field to save this form.</p>
        ) : (
          <div className="space-y-3">
            {layout === 'inlineDesktop' && fields.length > 3 ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                Inline layout works best with up to 3 fields on desktop.
              </p>
            ) : null}
            {fields.map((field, index) => (
              <div key={field.id || `${field.key}-${index}`} className="border rounded-lg p-4 space-y-3">
                <div className="grid md:grid-cols-3 gap-3">
                  <label className="space-y-1">
                    <span className="text-xs text-gray-600">Label (optional)</span>
                    <input
                      className="w-full px-2 py-1.5 border rounded"
                      value={field.label || ''}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      placeholder="Leave empty to hide"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-gray-600">Key</span>
                    <input
                      className="w-full px-2 py-1.5 border rounded"
                      value={field.key}
                      onChange={(e) => updateField(index, { key: sanitizeKey(e.target.value) })}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-gray-600">Type</span>
                    <select
                      className="w-full px-2 py-1.5 border rounded bg-white"
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value as FormFieldType })}
                    >
                      {FORM_FIELD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="space-y-1 block">
                  <span className="text-xs text-gray-600">Placeholder (optional)</span>
                  <input
                    className="w-full px-2 py-1.5 border rounded"
                    value={field.placeholder || ''}
                    onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  />
                </label>

                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    Required
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                      className="p-2 border rounded disabled:opacity-40"
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveField(index, 'down')}
                      disabled={index === fields.length - 1}
                      className="p-2 border rounded disabled:opacity-40"
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="p-2 border rounded text-red-600"
                      title="Remove field"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canSave || isSaving}
          onClick={onSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg disabled:opacity-40"
        >
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
