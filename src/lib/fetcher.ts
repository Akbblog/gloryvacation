export async function fetcher(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fetch error');
    return res.json();
}

export default fetcher;
