import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Not Found</h2>
            <p className="text-gray-600 mb-6">Could not find requested resource</p>
            <Link href="/" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                Return Home
            </Link>
        </div>
    )
}
