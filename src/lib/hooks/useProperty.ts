import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

export function useProperty(id?: string) {
    const key = id ? `/api/properties/${id}` : null;
    const { data, error, mutate } = useSWR<any>(key, fetcher, { shouldRetryOnError: false });

    return {
        property: data || null,
        isLoading: !data && !error,
        isError: !!error,
        mutate,
    };
}
