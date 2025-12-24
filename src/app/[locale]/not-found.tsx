import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Not Found</h2>
            <p className="text-gray-600 mb-6">Could not find requested resource</p>
            <Link href="/" className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl">
                Return Home
            </Link>
        </div>
    )
}
