import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

export type PublicProperty = {
    id: string;
    slug: string;
    title: string;
    pricePerNight: number;
    images: string[];
    guests: number;
    bedrooms: number;
    propertyType: "apartment" | "villa" | "studio" | "townhouse" | "penthouse";
    amenities: string[];
    isNew: boolean;
    area: string;
};

export interface PropertiesResponse {
    properties: any[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export function useProperties(url?: string) {
    const { data, error, mutate } = useSWR<PropertiesResponse>(url || '/api/properties', fetcher, { shouldRetryOnError: false });

    const normalizeId = (value: any): string | undefined => {
        if (!value) return undefined;
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            // Mongo extended JSON shape
            if (typeof value.$oid === 'string') return value.$oid;
            // Sometimes APIs may nest
            if (typeof (value as any).id === 'string') return (value as any).id;
        }
        if (typeof value?.toString === 'function') {
            const s = value.toString();
            if (typeof s === 'string' && s !== '[object Object]') return s;
        }
        const fallback = String(value);
        return fallback !== '[object Object]' ? fallback : undefined;
    };

    const properties: PublicProperty[] = (data?.properties || []).map((p: any) => ({
        id: normalizeId(p._id) || normalizeId(p.id) || '',
        slug: p.slug || '',
        title: p.title,
        pricePerNight: p.pricePerNight || p.price,
        images: p.images && p.images.length ? p.images : ['/placeholder.jpg'],
        guests: p.guests || 1,
        bedrooms: p.bedrooms || 1,
        propertyType: p.propertyType || 'apartment',
        amenities: p.amenities || [],
        isNew: p.isNew || false,
        area: p.location?.area || (p.area || 'Unknown'),
    }));

    return {
        properties,
        pagination: data?.pagination,
        isLoading: !data && !error,
        isError: !!error,
        mutate,
    };
}

export function useFilteredProperties(filters: {
    area?: string;
    propertyType?: string;
    bedrooms?: string;
    priceRange?: string;
    guests?: number;
    sortBy?: string;
    search?: string;
    amenities?: string[];
    page?: number;
    limit?: number;
}) {
    const params = new URLSearchParams();

    if (filters.area && filters.area !== "Any Area") params.set("area", filters.area);
    if (filters.propertyType) params.set("type", filters.propertyType);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
    if (filters.priceRange) params.set("price", filters.priceRange);
    if (filters.guests && filters.guests > 1) params.set("guests", filters.guests.toString());
    if (filters.sortBy && filters.sortBy !== "featured") params.set("sort", filters.sortBy);
    if (filters.search) params.set("search", filters.search);
    if (filters.amenities && filters.amenities.length > 0) params.set("amenities", filters.amenities.join(","));
    if (filters.page && filters.page > 1) params.set("page", filters.page.toString());
    if (filters.limit && filters.limit !== 12) params.set("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = `/api/properties${queryString ? `?${queryString}` : ""}`;

    return useProperties(url);
}
