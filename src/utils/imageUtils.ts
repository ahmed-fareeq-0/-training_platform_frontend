export const getImageUrl = (path: string | null | undefined): string | undefined => {
    if (!path) return undefined;

    // If it's already an absolute URL, return it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Get the base API url, stripping the /api/v1 suffix to get the raw host
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const hostUrl = baseUrl.replace(/\/api\/v1\/?$/, '');

    // Ensure the relative path starts with a slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${hostUrl}${cleanPath}`;
};
