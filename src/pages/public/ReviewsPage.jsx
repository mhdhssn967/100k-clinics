// pages/patient/ReviewsPage.jsx
import { Star, MessageSquare } from "lucide-react";

const mockReviews = [
  {
    id: 1,
    clinicName: "Aster Medcity",
    doctorName: "Dr. Anita Menon",
    rating: 5,
    date: "Mar 20, 2025",
    comment: "Excellent care. Dr. Menon was thorough and explained everything clearly. Highly recommended.",
    clinicImage: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=100&q=80",
  },
  {
    id: 2,
    clinicName: "Sunrise Wellness Clinic",
    doctorName: "Dr. Suresh Pillai",
    rating: 4,
    date: "Feb 15, 2025",
    comment: "Quick and efficient. Minimal waiting time. Would definitely recommend to others.",
    clinicImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&q=80",
  },
];

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          className={i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const avg = mockReviews.length
    ? (mockReviews.reduce((s, r) => s + r.rating, 0) / mockReviews.length).toFixed(1)
    : "–";

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="bg-white px-5 pt-14 pb-5">
        <h1 className="text-slate-900 text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-slate-400 text-sm mt-1">{mockReviews.length} reviews · {avg} avg rating</p>
      </div>

      {/* Average score card */}
      {mockReviews.length > 0 && (
        <div className="mx-5 mt-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-5">
          <div className="text-center">
            <p className="text-4xl font-bold text-slate-900 tracking-tight">{avg}</p>
            <Stars rating={Math.round(parseFloat(avg))} />
            <p className="text-slate-400 text-[11px] mt-1">{mockReviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5,4,3,2,1].map(n => {
              const count = mockReviews.filter(r => r.rating === n).length;
              const pct = mockReviews.length ? (count / mockReviews.length) * 100 : 0;
              return (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 w-3">{n}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-5 pt-5 space-y-3">
        {mockReviews.map(r => (
          <div key={r.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <img src={r.clinicImage} alt={r.clinicName} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 font-bold text-sm truncate">{r.clinicName}</p>
                <p className="text-slate-400 text-xs">{r.doctorName}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <Stars rating={r.rating} />
                <p className="text-slate-300 text-[10px] mt-1">{r.date}</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-3">
              {r.comment}
            </p>
          </div>
        ))}

        {mockReviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-700 font-semibold">No reviews yet</p>
            <p className="text-slate-400 text-sm mt-1">Reviews appear after completed visits</p>
          </div>
        )}
      </div>
    </div>
  );
}