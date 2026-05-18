import { Link } from "react-router-dom";

export default function Story() {
  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-sky-400/10 blur-3xl" />
        <div className="absolute right-0 top-16 h-44 w-44 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-center">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-slate-50 p-8 shadow-xl shadow-slate-200/60 sm:p-10">
              <div className="absolute -right-16 top-1/2 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />
              <div className="relative space-y-6">
                <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                  Our Story
                </span>
                <h1 className="text-slate-900 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Meet Devananda R Nair — the young visionary behind 100KClinics
                </h1>
                <p className="max-w-2xl text-slate-600 text-base leading-7 sm:text-lg">
                  At just <b>13 years old</b>, Devananda is the <b>Chief Inspiration Officer</b> for 100KClinics.com.
                  She is building a globally connected healthcare discovery platform that helps patients find clinics nearby
                  while giving small and independent providers a professional digital presence without high costs.
                </p>

                

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition"
                  >
                    Back to homepage
                  </Link>
                  <a
                    href="https://www.instagram.com/devananda_aka_thangu?igsh=NXJ2ZGcwbXVtZDc0"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Instagram @devananda_aka_thangu
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
              <img
                src="/assets/story.jpeg"
                alt="Devananda R Nair"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-6">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/40 sm:p-10">
                <div className="flex items-center gap-3 text-slate-900">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white font-bold">01</span>
                  <h2 className="text-2xl font-semibold">How this idea came to life</h2>
                </div>
                <div className="mt-5 space-y-4 text-slate-600 leading-7">
                  <p>
                    Devananda’s passion for technology and community wellbeing grew from a simple but powerful belief:
                    healthcare should be easy to access for everyone. While studying at GEMS International School Kannur,
                    she began dreaming of a platform that could connect patients and clinics with no unnecessary fees,
                    no complicated setup, and no barriers for smaller local providers.
                  </p>
                  <p>
                    The vision became 100KClinics.com — a global healthcare discovery and clinic onboarding platform that
                    automatically detects a user’s location and helps patients find nearby clinics instantly. It is designed
                    to act as a mini website for clinics, helping even independent providers establish a professional presence
                    without high costs or technical complexity.
                  </p>
                </div>
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <section className="rounded-[1.75rem] border border-slate-200 bg-sky-600/5 p-6 text-slate-900">
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold text-sky-700">Vision</span>
                  <p className="mt-4 text-base leading-7">
                    To create a globally connected healthcare discovery platform where patients can instantly find nearby clinics
                    through technology, while empowering clinics with a simple and affordable digital presence.
                  </p>
                </section>
                <section className="rounded-[1.75rem] border border-slate-200 bg-sky-900 p-6 text-white">
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold text-sky-200">Mission</span>
                  <p className="mt-4 text-base leading-7 text-slate-100">
                    To onboard clinics onto a unified digital platform that improves healthcare accessibility, supports local providers
                    with online visibility, and helps build future AI-driven care initiatives focused on emotional wellbeing and support
                    for cancer patients.
                  </p>
                </section>
              </div>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[2rem] bg-sky-700 px-8 py-10 text-white shadow-xl shadow-slate-900/10">
                <h3 className="text-xl font-semibold">A platform for small clinics</h3>
                <p className="mt-4 text-slate-200 leading-7">
                  100KClinics helps small and independent healthcare providers establish a strong online presence,
                  receive appointment interest, and join a larger healthcare community without charging patients service fees.
                </p>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">Future-focused support</h3>
                <p className="mt-4 text-slate-600 leading-7">
                  This initiative supports an upcoming AI-driven healthcare support project for cancer patients,
                  designed to offer compassionate emotional and mental wellbeing assistance.
                </p>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">Community impact</h3>
                <p className="mt-4 text-slate-600 leading-7">
                  Devananda represents a new generation of socially conscious innovators who combine healthcare,
                  innovation, and community empowerment to create real global impact.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
