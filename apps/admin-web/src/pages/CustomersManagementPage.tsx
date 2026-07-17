export function CustomersManagementPage() {
  const customerAppUrl = import.meta.env.VITE_CUSTOMER_APP_URL

  return (
    <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">Customer accounts</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        There is no user directory API. New customers self-serve on the customer
        web app, confirm email, then sign in.
      </p>
      <ul className="mt-6 flex flex-col gap-3 text-sm">
        <li>
          <a
            href={`${customerAppUrl}/register`}
            className="font-medium text-cyan-300 hover:underline"
          >
            Open registration
          </a>
          <span className="text-zinc-500"> — creates a User-role account</span>
        </li>
        <li>
          <a
            href={`${customerAppUrl}/verify-email`}
            className="font-medium text-cyan-300 hover:underline"
          >
            Email verification
          </a>
          <span className="text-zinc-500"> — required before first login</span>
        </li>
        <li>
          <a
            href={`${customerAppUrl}/forgot-password`}
            className="font-medium text-cyan-300 hover:underline"
          >
            Password recovery
          </a>
          <span className="text-zinc-500"> — reset link by email</span>
        </li>
      </ul>
    </section>
  )
}
