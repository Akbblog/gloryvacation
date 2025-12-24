import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

export type PublicProperty = {
    id: string;
    title: string;
    pricePerNight: number;
    images: string[];
    guests: number;
    bedrooms: number;
    propertyType: string;
    amenities: string[];
    isNew: boolean;
    area: string;
};

export function useProperties() {
    const { data, error, mutate } = useSWR<any[]>('/api/properties', fetcher, { shouldRetryOnError: false });

    const properties: PublicProperty[] = (data || []).map((p: any) => ({
        id: p._id || p.id,
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
