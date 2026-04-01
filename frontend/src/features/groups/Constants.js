// ─── Style Maps ───────────────────────────────────────────────────────────────

export const SUBJECT_COLORS = {
    'Computer Science': { bg: '#e0f5f5', text: '#1a7a7a', border: '#a8dcdc' },
    'Chemistry': { bg: '#fff0e0', text: '#b45309', border: '#fcd9a0' },
    'Mathematics': { bg: '#f0e0ff', text: '#7c3aed', border: '#d4b0f8' },
    'Data Science': { bg: '#e0ffe8', text: '#166534', border: '#a0e8b4' },
    'Economics': { bg: '#fff0f5', text: '#be185d', border: '#f9a8c9' },
    'History': { bg: '#fef3e0', text: '#92400e', border: '#fcd9a0' },
    'Physics': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    'Biology': { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    'English': { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
    'Law': { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
};

export const FILE_ICONS = {
    pdf: { bg: '#fee2e2', color: '#ef4444', label: 'PDF', emoji: '📄' },
    ppt: { bg: '#fff7ed', color: '#f97316', label: 'PPT', emoji: '📊' },
    pptx: { bg: '#fff7ed', color: '#f97316', label: 'PPT', emoji: '📊' },
    doc: { bg: '#eff6ff', color: '#3b82f6', label: 'DOC', emoji: '📝' },
    docx: { bg: '#eff6ff', color: '#3b82f6', label: 'DOC', emoji: '📝' },
    xls: { bg: '#f0fdf4', color: '#22c55e', label: 'XLS', emoji: '📈' },
    xlsx: { bg: '#f0fdf4', color: '#22c55e', label: 'XLS', emoji: '📈' },
};

export const ROLE_STYLES = {
    Creator: { bg: '#e0f5f5', text: '#1a7a7a', border: '#a8dcdc' },
    Admin: { bg: '#fff0e0', text: '#b45309', border: '#fcd9a0' },
    Member: { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' },
};

const AVATAR_PALETTE = [
    '#fce8f3', '#e0f5f5', '#fff0e0',
    '#f0e0ff', '#e0ffe8', '#fef3e0',
    '#eff6ff', '#fdf4ff', '#f0fdf4',
];

export const EMOJI_AVATARS = ['🧑‍💻', '👩‍🔬', '🧑‍🎓', '👨‍🏫', '👩‍💼', '🧑‍🔭', '👨‍🎨', '👩‍🏫'];

// ─── Utility Helpers ──────────────────────────────────────────────────────────

/** Deterministic avatar bg colour from any string (uid / name) */
export const getAvatarColor = (str = '') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

/** Subject colour with fallback */
export const getSubjectColor = (subject) =>
    SUBJECT_COLORS[subject] || { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };

/** File icon config from extension */
export const getFileIcon = (ext = '') =>
    FILE_ICONS[ext.toLowerCase()] || { bg: '#f1f5f9', color: '#64748b', label: ext.toUpperCase() || 'FILE', emoji: '📁' };

/** Embeddable preview URL for office/PDF files */
export const getViewUrl = (fileUrl = '') => {
    const ext = fileUrl.split('.').pop().split('?')[0].toLowerCase();
    
    // Microsoft Online Viewer for Office documents
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
        return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
    }
    
    // For PDFs and everything else, let the browser handle it natively
    return fileUrl;
};