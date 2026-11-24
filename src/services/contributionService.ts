import type { ContributionDraft } from '../types/heritage';

const DRAFT_STORAGE_KEY = 'samskruthi_contribution_draft';
const SUBMISSIONS_STORAGE_KEY = 'samskruthi_local_submissions';

export const ContributionService = {
  /**
   * Save a contribution draft to localStorage
   */
  saveDraft: (draft: Partial<ContributionDraft>): void => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('Failed to save draft to localStorage', e);
    }
  },

  /**
   * Retrieve stored draft if present
   */
  getDraft: (): Partial<ContributionDraft> | null => {
    try {
      const data = localStorage.getItem(DRAFT_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Clear active draft upon successful submission
   */
  clearDraft: (): void => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  },

  /**
   * Submit contribution on client side (mock service ready for backend API endpoint)
   */
  submitContribution: async (data: ContributionDraft): Promise<{ success: boolean; submissionId: string }> => {
    // Simulate network delay for realistic UI feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    const submissionId = `SUB-${Date.now().toString().slice(-6)}`;

    // Store in local mock submissions array for persistence test
    try {
      const existing = JSON.parse(localStorage.getItem(SUBMISSIONS_STORAGE_KEY) || '[]');
      existing.unshift({
        ...data,
        id: submissionId,
        submittedAt: new Date().toISOString(),
        status: 'Under Peer Review',
      });
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(existing));
      ContributionService.clearDraft();
    } catch (e) {
      // Fallback
    }

    return {
      success: true,
      submissionId,
    };
  },
};
