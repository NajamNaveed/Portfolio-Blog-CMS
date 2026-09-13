import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { getAdminSiteContent, updateSiteContent } from '../../services/siteContentService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { DEFAULT_SITE_CONTENT } from '../../utils/defaultSiteContent';

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
const labelClass = 'block text-sm font-medium text-gray-900';

const SOCIAL_ICON_OPTIONS = ['Github', 'Linkedin', 'Twitter', 'Instagram', 'Mail', 'Globe'];

function Section({ title, description, children }) {
  return (
    <section className="rounded-lg border border-gray-200 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      <div className="mt-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export default function SiteContentEditor() {
  const [data, setData] = useState(DEFAULT_SITE_CONTENT);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoadStatus('loading');
    try {
      const content = await getAdminSiteContent();
      setData(content);
      setLoadStatus('success');
    } catch {
      setLoadStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateField(path, value) {
    setSaved(false);
    setData((prev) => {
      const next = structuredClone(prev);
      let target = next;
      for (let i = 0; i < path.length - 1; i += 1) target = target[path[i]];
      target[path[path.length - 1]] = value;
      return next;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      const payload = {
        brand: data.brand,
        hero: data.hero,
        about: data.about,
        focusAreas: data.focusAreas,
        skills: data.skills,
        socialLinks: data.socialLinks,
        contact: data.contact,
        footer: data.footer,
      };
      const updated = await updateSiteContent(payload);
      setData(updated);
      setSaved(true);
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Unable to save site content. Please try again.'));
    } finally {
      setSaving(false);
    }
  }

  if (loadStatus === 'loading') return <LoadingSpinner />;
  if (loadStatus === 'error') return <ErrorMessage message="Couldn't load site content." onRetry={load} />;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Site Content</h1>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {saveError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>
      )}
      {saved && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Site content saved. Changes are live on the public site.
        </div>
      )}

      <Section title="Brand" description="Your name and role, used across the site and browser tab.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Name</label>
            <input className={inputClass} value={data.brand?.name || ''} onChange={(e) => updateField(['brand', 'name'], e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Role / Title</label>
            <input className={inputClass} value={data.brand?.role || ''} onChange={(e) => updateField(['brand', 'role'], e.target.value)} />
          </div>
        </div>
      </Section>

      <Section title="Hero Section" description="The first thing visitors see on the homepage.">
        <div>
          <label className={labelClass}>Eyebrow Label</label>
          <input className={inputClass} value={data.hero?.eyebrow || ''} onChange={(e) => updateField(['hero', 'eyebrow'], e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Headline</label>
          <input className={inputClass} value={data.hero?.headline || ''} onChange={(e) => updateField(['hero', 'headline'], e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Rotating Roles</label>
          <ListEditor
            items={data.hero?.roles || []}
            onChange={(items) => updateField(['hero', 'roles'], items)}
            placeholder="e.g. Full Stack Developer"
            renderItem={(value, onItemChange) => (
              <input className={inputClass} value={value} onChange={(e) => onItemChange(e.target.value)} />
            )}
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows={3}
            className={inputClass}
            value={data.hero?.description || ''}
            onChange={(e) => updateField(['hero', 'description'], e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-gray-200 p-3">
            <p className="text-xs font-semibold uppercase text-gray-500">Primary Button</p>
            <div className="mt-2 flex flex-col gap-2">
              <input
                className={inputClass}
                placeholder="Label"
                value={data.hero?.primaryCta?.label || ''}
                onChange={(e) => updateField(['hero', 'primaryCta', 'label'], e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Link (e.g. /projects)"
                value={data.hero?.primaryCta?.href || ''}
                onChange={(e) => updateField(['hero', 'primaryCta', 'href'], e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-md border border-gray-200 p-3">
            <p className="text-xs font-semibold uppercase text-gray-500">Secondary Button</p>
            <div className="mt-2 flex flex-col gap-2">
              <input
                className={inputClass}
                placeholder="Label"
                value={data.hero?.secondaryCta?.label || ''}
                onChange={(e) => updateField(['hero', 'secondaryCta', 'label'], e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Link (e.g. /contact)"
                value={data.hero?.secondaryCta?.href || ''}
                onChange={(e) => updateField(['hero', 'secondaryCta', 'href'], e.target.value)}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="About Page">
        <div>
          <label className={labelClass}>Intro</label>
          <textarea rows={3} className={inputClass} value={data.about?.intro || ''} onChange={(e) => updateField(['about', 'intro'], e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Approach Title</label>
            <input className={inputClass} value={data.about?.approachTitle || ''} onChange={(e) => updateField(['about', 'approachTitle'], e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Résumé URL</label>
            <input className={inputClass} value={data.about?.resumeUrl || ''} onChange={(e) => updateField(['about', 'resumeUrl'], e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Approach Text</label>
          <textarea rows={3} className={inputClass} value={data.about?.approachText || ''} onChange={(e) => updateField(['about', 'approachText'], e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Years of Experience</label>
            <input type="number" className={inputClass} value={data.about?.yearsExperience ?? 0} onChange={(e) => updateField(['about', 'yearsExperience'], Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>Projects Completed</label>
            <input type="number" className={inputClass} value={data.about?.projectsCompleted ?? 0} onChange={(e) => updateField(['about', 'projectsCompleted'], Number(e.target.value))} />
          </div>
        </div>
      </Section>

      <Section title="Focus Areas" description="The 'What I Build' cards on the homepage and about page. Each card shows its number (01, 02...) as a glowing background on hover.">
        <ListEditor
          items={data.focusAreas || []}
          onChange={(items) => updateField(['focusAreas'], items)}
          newItem={() => ({ title: '', description: '' })}
          renderItem={(item, onItemChange) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <input className={inputClass} placeholder="Title" value={item.title} onChange={(e) => onItemChange({ ...item, title: e.target.value })} />
              <input className={inputClass} placeholder="Description" value={item.description} onChange={(e) => onItemChange({ ...item, description: e.target.value })} />
            </div>
          )}
        />
      </Section>

      <Section title="Skills" description="Grouped technologies shown in the homepage marquee and the About page's 3D globe. Icon names use Simple Icons format, e.g. SiReact, SiNodedotjs, SiMongodb.">
        <ListEditor
          items={data.skills || []}
          onChange={(items) => updateField(['skills'], items)}
          newItem={() => ({ label: '', items: [] })}
          renderItem={(group, onGroupChange) => (
            <div className="rounded-md border border-gray-200 p-3">
              <input
                className={inputClass}
                placeholder="Group label (e.g. Frontend)"
                value={group.label}
                onChange={(e) => onGroupChange({ ...group, label: e.target.value })}
              />
              <div className="mt-3">
                <ListEditor
                  items={group.items || []}
                  onChange={(items) => onGroupChange({ ...group, items })}
                  newItem={() => ({ name: '', icon: 'SiReact' })}
                  renderItem={(skill, onSkillChange) => (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        className={inputClass}
                        placeholder="Name (e.g. React.js)"
                        value={skill.name}
                        onChange={(e) => onSkillChange({ ...skill, name: e.target.value })}
                      />
                      <input
                        className={inputClass}
                        placeholder="Icon (e.g. SiReact)"
                        value={skill.icon}
                        onChange={(e) => onSkillChange({ ...skill, icon: e.target.value })}
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          )}
        />
      </Section>

      <Section title="Social Links">
        <ListEditor
          items={data.socialLinks || []}
          onChange={(items) => updateField(['socialLinks'], items)}
          newItem={() => ({ label: '', url: '', icon: 'Github' })}
          renderItem={(item, onItemChange) => (
            <div className="grid gap-2 sm:grid-cols-[1fr_2fr_140px]">
              <input className={inputClass} placeholder="Label" value={item.label} onChange={(e) => onItemChange({ ...item, label: e.target.value })} />
              <input className={inputClass} placeholder="URL" value={item.url} onChange={(e) => onItemChange({ ...item, url: e.target.value })} />
              <select className={inputClass} value={item.icon} onChange={(e) => onItemChange({ ...item, icon: e.target.value })}>
                {SOCIAL_ICON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}
        />
      </Section>

      <Section title="Contact Info" description="Shown on the Contact page and in the footer.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} value={data.contact?.email || ''} onChange={(e) => updateField(['contact', 'email'], e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={data.contact?.phone || ''} onChange={(e) => updateField(['contact', 'phone'], e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input className={inputClass} value={data.contact?.location || ''} onChange={(e) => updateField(['contact', 'location'], e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Availability Note</label>
            <input className={inputClass} value={data.contact?.availability || ''} onChange={(e) => updateField(['contact', 'availability'], e.target.value)} />
          </div>
        </div>
      </Section>

      <Section title="Footer">
        <div>
          <label className={labelClass}>Tagline</label>
          <textarea rows={2} className={inputClass} value={data.footer?.tagline || ''} onChange={(e) => updateField(['footer', 'tagline'], e.target.value)} />
        </div>
      </Section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </form>
  );
}

// Generic add/remove list editor shared by every repeatable field above
// (roles, focus areas, skill groups, skill items, social links).
function ListEditor({ items, onChange, renderItem, newItem = () => '', placeholder }) {
  function updateAt(index, value) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeAt(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...items, newItem()]);
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">{renderItem(item, (value) => updateAt(i, value))}</div>
          <button
            type="button"
            onClick={() => removeAt(i)}
            aria-label="Remove"
            className="mt-1 shrink-0 rounded-md p-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-900"
      >
        <Plus className="size-4" /> Add {placeholder ? '' : 'item'}
      </button>
    </div>
  );
}
