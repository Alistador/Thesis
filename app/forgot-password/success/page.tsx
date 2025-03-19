import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-[#3B92F4] to-[#3A91F4]">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Password Reset</h1>
        <p className="text-gray-600">
          If the email doesn&apos;t show up, check your spam folder
        </p>

        <Link
          href="/"
          className="inline-block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition"
        >
          Return to Login
        </Link>
      </div>
    </main>
  );
}
