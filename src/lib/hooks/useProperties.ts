import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

export type PublicProperty = {
    id: string;
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

export function useProperties() {
    const { data, error, mutate } = useSWR<any[]>('/api/properties', fetcher, { shouldRetryOnError: false });

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

    const properties: PublicProperty[] = (data || []).map((p: any) => ({
        id: normalizeId(p._id) || normalizeId(p.id) || '',
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
        isLoading: !data && !error,
        isError: !!error,
        mutate,
    };
}
