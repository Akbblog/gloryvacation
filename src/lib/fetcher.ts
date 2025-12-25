export async function fetcher(url: string) {
    const res = await fetch(url);
    if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`Fetch error: ${res.status} ${res.statusText} - ${errorText}`);
    }
    return res.json();
}

export default fetcher;
