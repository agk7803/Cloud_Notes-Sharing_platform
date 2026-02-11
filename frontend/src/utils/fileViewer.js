export const getViewUrl = (url) => {
    if (!url) return '';
    const extension = url.split('.').pop().toLowerCase();
    const officeExtensions = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

    if (officeExtensions.includes(extension)) {
        return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }

    return url;
};
