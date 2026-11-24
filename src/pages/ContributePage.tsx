import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Upload, CheckCircle2, 
  Trash2, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, X, Globe
} from 'lucide-react';
import { HERITAGE_CATEGORIES, CONTINENTS } from '../data/categories';
import { ContributionService } from '../services/contributionService';
import type { ContributionDraft, HeritageCategorySlug, Continent } from '../types/heritage';

interface FormErrors {
  title?: string;
  category?: string;
  continent?: string;
  country?: string;
  location?: string;
  description?: string;
  contributorName?: string;
  contributorEmail?: string;
  licenseConsent?: string;
}

export const ContributePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') || 'ancient-civilizations') as HeritageCategorySlug;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [draftBannerOpen, setDraftBannerOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ContributionDraft>({
    category: initialCategory,
    continent: 'Asia',
    country: '',
    title: '',
    nativeTitle: '',
    location: '',
    period: '',
    heritageType: 'tangible',
    description: '',
    culturalSignificance: '',
    languages: 'English',
    tags: '',
    contributorName: '',
    contributorEmail: '',
    licenseConsent: false,
    images: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; submissionId: string } | null>(null);

  // Check for saved draft on mount
  useEffect(() => {
    const saved = ContributionService.getDraft();
    if (saved && saved.title && !hasRestoredDraft) {
      setDraftBannerOpen(true);
    }
  }, [hasRestoredDraft]);

  const handleRestoreDraft = () => {
    const saved = ContributionService.getDraft();
    if (saved) {
      setFormData((prev) => ({
        ...prev,
        ...saved,
      }));
      setHasRestoredDraft(true);
      setDraftBannerOpen(false);
    }
  };

  const handleDismissDraft = () => {
    setDraftBannerOpen(false);
  };

  // Auto-save draft changes to localStorage
  useEffect(() => {
    if (formData.title || formData.description) {
      ContributionService.saveDraft(formData);
    }
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Image Upload handler (Client-side Data URL)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            {
              name: file.name,
              size: file.size,
              type: file.type,
              previewUrl,
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Step Validation
  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title of cultural heritage record is required';
      if (!formData.country.trim()) newErrors.country = 'Country or sovereign nation is required';
      if (!formData.location.trim()) newErrors.location = 'Region, province, or historic settlement is required';
    }

    if (currentStep === 2) {
      if (!formData.description.trim() || formData.description.trim().length < 30) {
        newErrors.description = 'Please provide at least 30 characters of historical context or oral chronicle';
      }
    }

    if (currentStep === 4) {
      if (!formData.contributorName.trim()) newErrors.contributorName = 'Contributor name is required';
      if (!formData.contributorEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contributorEmail)) {
        newErrors.contributorEmail = 'A valid email is required for contributor verification';
      }
      if (!formData.licenseConsent) {
        newErrors.licenseConsent = 'You must accept the open cultural heritage declaration';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => (Math.min(prev + 1, 4) as any));
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => (Math.max(prev - 1, 1) as any));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const res = await ContributionService.submitContribution(formData);
      setSubmissionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    ContributionService.clearDraft();
    setFormData({
      category: 'ancient-civilizations',
      continent: 'Asia',
      country: '',
      title: '',
      nativeTitle: '',
      location: '',
      period: '',
      heritageType: 'tangible',
      description: '',
      culturalSignificance: '',
      languages: 'English',
      tags: '',
      contributorName: '',
      contributorEmail: '',
      licenseConsent: false,
      images: [],
    });
    setSubmissionResult(null);
    setStep(1);
  };

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Draft Recovery Banner */}
      {draftBannerOpen && (
        <div className="bg-heritage-surface border border-heritage-gold/50 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-heritage-gold flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Unsubmitted Draft Found</h4>
              <p className="text-xs text-slate-300">
                You have a saved draft in progress from your previous session.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 rounded-lg bg-heritage-gold text-heritage-darker font-bold text-xs hover:bg-heritage-gold-light transition-colors"
            >
              Restore Draft
            </button>
            <button
              onClick={handleDismissDraft}
              className="p-1 text-slate-400 hover:text-white"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-heritage-surface border border-heritage-gold/30 text-xs text-heritage-gold font-semibold uppercase tracking-widest shadow-md">
          <Globe className="w-3.5 h-3.5" />
          <span>Universal Citizen Archive</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-white">
          Contribute a World Heritage Record
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">
          Document an ancient archaeological monument, indigenous ritual, family oral story, endangered craft technique, or historical photograph from anywhere in the world.
        </p>
      </div>

      {/* Multi-Step Wizard Indicator */}
      <div className="bg-heritage-surface border border-white/10 rounded-2xl p-4">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { num: 1, label: 'Identity & Geography' },
            { num: 2, label: 'Narrative & Lore' },
            { num: 3, label: 'Visual Archives' },
            { num: 4, label: 'Review & Verify' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                if (s.num < step || validateStep(step)) {
                  setStep(s.num as any);
                }
              }}
              className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 font-medium ${
                step === s.num
                  ? 'bg-heritage-gold text-heritage-darker font-bold shadow-md'
                  : step > s.num
                  ? 'bg-white/5 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-current">
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="truncate">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Success Modal Dialogue */}
      {submissionResult && (
        <div className="bg-heritage-surface border-2 border-emerald-500/50 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Global Heritage Record Registered!
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Your contribution has been saved in the decentralized community archive with reference ID:
            </p>
            <div className="font-mono text-heritage-gold bg-black/40 px-4 py-2 rounded-xl border border-white/10 inline-block font-bold text-base">
              {submissionResult.submissionId}
            </div>
          </div>

          <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl max-w-lg mx-auto text-xs text-emerald-300 leading-relaxed text-left flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Decoupled Client-Side Archival Verified</p>
              <p className="mt-0.5 text-slate-300">
                This record is safely persisted to your browser storage. It is structured to seamlessly dispatch to a cloud API when connected, without requiring UI refactoring.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/explore"
              className="px-6 py-3 rounded-full bg-heritage-gold text-heritage-darker font-bold text-xs uppercase tracking-wider hover:bg-heritage-gold-light transition-all"
            >
              Browse Global Archive
            </Link>
            <button
              onClick={handleResetForm}
              className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all"
            >
              Submit Another Record
            </button>
          </div>
        </div>
      )}

      {/* Form Wizard */}
      {!submissionResult && (
        <form onSubmit={handleSubmit} className="bg-heritage-surface border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          {/* STEP 1: Identification & Stream */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-xl font-serif font-bold text-white">
                  Step 1: Classification & Geography
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Choose the heritage stream and locate the origin continent and country.
                </p>
              </div>

              {/* Continent Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Continent *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {CONTINENTS.map((cont) => (
                    <button
                      type="button"
                      key={cont.name}
                      onClick={() => setFormData((prev) => ({ ...prev, continent: cont.name as Continent }))}
                      className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                        formData.continent === cont.name
                          ? 'bg-heritage-gold/20 border-heritage-gold text-white font-bold shadow-md'
                          : 'bg-black/20 border-white/10 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <span>{cont.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stream Picker */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Heritage Category Stream *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {HERITAGE_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.slug}
                      onClick={() => setFormData((prev) => ({ ...prev, category: cat.slug }))}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        formData.category === cat.slug
                          ? 'bg-heritage-terracotta/30 border-heritage-terracotta text-white font-bold shadow-md'
                          : 'bg-black/20 border-white/10 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <span className="block truncate">{cat.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Native Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="title" className="text-xs font-semibold text-slate-300">
                    Title / Common Name *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Inti Raymi Festival of the Sun"
                    className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                  {errors.title && <p className="text-[11px] text-rose-400">{errors.title}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="nativeTitle" className="text-xs font-semibold text-slate-300">
                    Indigenous / Original Language Name (Optional)
                  </label>
                  <input
                    id="nativeTitle"
                    name="nativeTitle"
                    type="text"
                    value={formData.nativeTitle || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Quechua, Arabic, Swahili, etc."
                    className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Country & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="country" className="text-xs font-semibold text-slate-300">
                    Country / Sovereign Nation *
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g. Peru, Egypt, Japan, Mali"
                    className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                  {errors.country && <p className="text-[11px] text-rose-400">{errors.country}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="location" className="text-xs font-semibold text-slate-300">
                    Province, Settlement, or Region *
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Cusco Valley, Sahara Desert"
                    className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                  {errors.location && <p className="text-[11px] text-rose-400">{errors.location}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="heritageType" className="text-xs font-semibold text-slate-300">
                    Heritage Type
                  </label>
                  <select
                    id="heritageType"
                    name="heritageType"
                    value={formData.heritageType}
                    onChange={handleInputChange}
                    className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  >
                    <option value="tangible">Tangible Monument / Artifact</option>
                    <option value="intangible">Intangible Living Practice</option>
                    <option value="cultural-landscape">Cultural Landscape</option>
                  </select>
                </div>
              </div>

              {/* Historical Era */}
              <div className="space-y-1">
                <label htmlFor="period" className="text-xs font-semibold text-slate-300">
                  Historical Era / Century / Antiquity
                </label>
                <input
                  id="period"
                  name="period"
                  type="text"
                  value={formData.period}
                  onChange={handleInputChange}
                  placeholder="e.g. c. 1438 CE (Inca Empire) or Ancient Kingdom"
                  className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Narrative & Lore */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-xl font-serif font-bold text-white">
                  Step 2: Cultural Chronicle & Lore
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Describe what makes this tradition, site, or memory culturally significant.
                </p>
              </div>

              <div className="space-y-1">
                <label htmlFor="description" className="text-xs font-semibold text-slate-300">
                  Detailed Historical & Cultural Chronicle *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Recount the origins, materials used, oral songs, legendary custodians, and current condition of this heritage asset..."
                  className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl p-4 text-xs text-white focus:outline-none leading-relaxed"
                />
                {errors.description && <p className="text-[11px] text-rose-400">{errors.description}</p>}
                <span className="text-[10px] text-slate-400 block">
                  Character count: {formData.description.length} (minimum 30)
                </span>
              </div>

              <div className="space-y-1">
                <label htmlFor="culturalSignificance" className="text-xs font-semibold text-slate-300">
                  Living Significance / Community Impact (Optional)
                </label>
                <textarea
                  id="culturalSignificance"
                  name="culturalSignificance"
                  rows={3}
                  value={formData.culturalSignificance || ''}
                  onChange={handleInputChange}
                  placeholder="How does this practice shape the community's identity today?"
                  className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl p-4 text-xs text-white focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="languages" className="text-xs font-semibold text-slate-300">
                    Associated Languages / Dialects
                  </label>
                  <input
                    id="languages"
                    name="languages"
                    type="text"
                    value={formData.languages}
                    onChange={handleInputChange}
                    placeholder="e.g. Quechua, Spanish, Arabic, Japanese"
                    className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="tags" className="text-xs font-semibold text-slate-300">
                    Descriptive Tags (Comma separated)
                  </label>
                  <input
                    id="tags"
                    name="tags"
                    type="text"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g. Architecture, Astronomical, Ritual, UNESCO"
                    className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Photographs & Visual Evidence */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-xl font-serif font-bold text-white">
                  Step 3: Visual Archives & Media
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Attach photographs, sketches, or archival scans. Files are processed client-side.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-heritage-gold/40 hover:border-heritage-gold rounded-2xl p-8 text-center bg-black/20 transition-colors">
                <Upload className="w-8 h-8 text-heritage-gold mx-auto mb-2" />
                <h4 className="font-serif font-bold text-sm text-white">
                  Select Visual Media from Device
                </h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  PNG, JPG, or WEBP. Instant client-side preview with zero server roundtrip.
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-heritage-gold text-heritage-darker font-bold text-xs cursor-pointer hover:bg-heritage-gold-light transition-colors">
                  <span>Browse Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preview thumbnails */}
              {formData.images.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Attached Files ({formData.images.length}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 group p-1"
                      >
                        {img.previewUrl && (
                          <img
                            src={img.previewUrl}
                            alt={img.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="p-1 flex items-center justify-between text-[11px] text-slate-300">
                          <span className="truncate max-w-[120px]">{img.name}</span>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            aria-label="Remove image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review, Contributor & License */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-xl font-serif font-bold text-white">
                  Step 4: Contributor Declaration & Verification
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Provide your attribution details and accept the open heritage license agreement.
                </p>
              </div>

              {/* Summary Review Card */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2 text-xs">
                <h4 className="font-bold text-heritage-gold uppercase tracking-wider text-[10px]">
                  Draft Record Preview
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div><strong>Title:</strong> {formData.title || 'Untitled'}</div>
                  <div><strong>Stream:</strong> {formData.category}</div>
                  <div><strong>Geography:</strong> {formData.location}, {formData.country} ({formData.continent})</div>
                  <div><strong>Period:</strong> {formData.period || 'Unspecified'}</div>
                </div>
                <p className="text-slate-400 line-clamp-2 pt-1 border-t border-white/5">
                  <strong>Excerpt:</strong> {formData.description}
                </p>
              </div>

              {/* Contributor Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="contributorName" className="text-xs font-semibold text-slate-300">
                    Your Full Name / Custodian Organization *
                  </label>
                  <input
                    id="contributorName"
                    name="contributorName"
                    type="text"
                    value={formData.contributorName}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Amina Diallo"
                    className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                  {errors.contributorName && <p className="text-[11px] text-rose-400">{errors.contributorName}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="contributorEmail" className="text-xs font-semibold text-slate-300">
                    Contact Email Address *
                  </label>
                  <input
                    id="contributorEmail"
                    name="contributorEmail"
                    type="email"
                    value={formData.contributorEmail}
                    onChange={handleInputChange}
                    placeholder="name@heritage-institution.org"
                    className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                  {errors.contributorEmail && <p className="text-[11px] text-rose-400">{errors.contributorEmail}</p>}
                </div>
              </div>

              {/* License Consent Checkbox */}
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl bg-heritage-surface border border-white/10 hover:border-heritage-gold/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.licenseConsent}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, licenseConsent: e.target.checked }));
                      if (errors.licenseConsent) {
                        setErrors((prev) => ({ ...prev, licenseConsent: undefined }));
                      }
                    }}
                    className="mt-1 w-4 h-4 rounded text-heritage-gold focus:ring-heritage-gold border-white/20 bg-black/40"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    I confirm that this contribution represents authentic, documented cultural or oral knowledge, and I consent to releasing this metadata under the <strong>Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)</strong> open heritage framework, subject to the Samskruthi{' '}
                    <Link to="/terms" target="_blank" className="text-heritage-gold underline hover:text-white">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" target="_blank" className="text-heritage-gold underline hover:text-white">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
                {errors.licenseConsent && <p className="text-[11px] text-rose-400">{errors.licenseConsent}</p>}
              </div>
            </div>
          )}

          {/* Navigation & Action Buttons */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-full bg-heritage-gold hover:bg-heritage-gold-light text-heritage-darker font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-heritage-saffron to-heritage-gold hover:from-heritage-saffron-deep hover:to-heritage-gold-light text-heritage-darker font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Archiving Draft...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Archive Entry</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
