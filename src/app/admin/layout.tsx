import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/admin" className="text-lg font-bold text-emerald-800">
            Tambua Admin
          </Link>
          <nav className="flex gap-4 text-sm font-medium text-gray-600">
            <Link href="/admin/categories" className="hover:text-emerald-700">
              Categories
            </Link>
            <Link href="/admin/questions" className="hover:text-emerald-700">
              Questions
            </Link>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
    </div>
  );
}
