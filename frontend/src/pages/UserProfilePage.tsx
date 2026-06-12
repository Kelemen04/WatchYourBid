import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePublicProfile, useMeData } from "../hooks/useUser";
import { useUserReviews } from "../hooks/useReview";
import { useDeleteReview } from "../hooks/useModerator";
import { getUserId, getUserRole } from "../api/axios";

export default function UserProfilePage() {
  const { id } = useParams();
  const targetUserId = Number(id);
  const navigate = useNavigate();

  const [skip, setSkip] = useState(0);
  const take = 5;

  const myRole = getUserRole();
  const myId = getUserId();
  const isStaff =
    myRole === "ADMIN" || myRole === "SUPER_ADMIN" || myRole === "MODERATOR";
  const isOwner = myId === targetUserId;

  const { data: myPrivateData, isLoading: isMeLoading } = useMeData({
    enabled: isOwner,
  });
  const { data: publicProfile, isLoading: isPublicLoading } = usePublicProfile(
    targetUserId,
    { enabled: !isOwner },
  );

  const { data: reviews, isLoading: isReviewsLoading } = useUserReviews(
    targetUserId,
    skip,
    take,
  );
  const { mutate: deleteReview } = useDeleteReview(targetUserId);

  const isLoading =
    (isOwner ? isMeLoading : isPublicLoading) || isReviewsLoading;
  const profile = isOwner ? myPrivateData : publicProfile;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 bg-white">
        <h2 className="font-playfair text-3xl font-bold text-stone-900">
          User Not Found
        </h2>
        <p className="text-stone-500 font-inter">
          The profile you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 border border-stone-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const userEmail = "email" in profile ? profile.email : null;
  const userPhone = "phoneNumber" in profile ? profile.phoneNumber : null;

  return (
    <div className="w-full min-h-screen bg-text-muted/10 font-inter text-stone-900 pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-28 bg-background border-b border-stone-100"></div>

              <div className="relative z-10 mb-5 mt-4">
                <img
                  src={profile.profilePicture || "/default-avatar.png"}
                  className="w-32 h-32 rounded-full object-cover border-[6px] border-white bg-white shadow-lg"
                  alt="Profile"
                />
              </div>

              <h1 className="font-playfair text-3xl font-extrabold text-stone-950 mb-1 break-words w-full">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-[var(--color-primary)] font-bold text-sm mb-6 tracking-wide break-words w-full">
                @{profile.username}
              </p>

              <div className="w-full flex flex-col gap-3 mt-2">
                {userEmail && (
                  <a className="flex items-center gap-4 transition-all text-left group">
                    <span className="text-[14px] font-bold text-stone-700 truncate">
                      📧 {userEmail}
                    </span>
                  </a>
                )}

                {userPhone && (
                  <a className="flex items-center gap-4 transition-all text-left group">
                    <span className="text-[14px] font-bold text-stone-700 truncate">
                      📞 {userPhone}
                    </span>
                  </a>
                )}

                {!userEmail && !userPhone && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                    <span className="text-xs text-stone-400 font-medium">
                      No contact info provided.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Eladói Statisztika Kártya */}
            {profile.seller && (
              <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 pb-4 border-b border-stone-100">
                  Seller Rating
                </h4>
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-black text-background">
                    {profile.seller.rating.toFixed(1)}/5.0
                  </span>
                  <div className="flex flex-row">
                    <span className="text-primary text-4xl tracking-widest drop-shadow-sm">
                      ★
                    </span>
                    <span className="text-2xl text-stone-500 font-bold uppercase mt-1">
                      Rating
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Eladói Bemutatkozás */}
            {profile.seller?.description && (
              <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 pb-4 border-b border-stone-100">
                  About the Seller
                </h4>
                <p className="text-sm text-stone-700 italic leading-relaxed break-words whitespace-pre-wrap">
                  "{profile.seller.description}"
                </p>
              </div>
            )}
          </aside>

          <main className="lg:col-span-8 flex flex-col">
            <h3 className="font-playfair mb-4 text-4xl font-bold border-b-1 border-background text-stone-900">
              User Reviews
            </h3>

            {reviews && reviews.length > 0 ? (
              <div className="flex flex-col gap-6">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="group bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-lg hover:border-[var(--color-primary)] transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 w-1 h-full bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1 w-full sm:w-auto">
                        <span className="font-bold text-[15px] text-stone-900 break-words">
                          @{rev.reviewer.username}
                        </span>
                        <span className="text-[var(--color-primary)] text-[12px] tracking-widest drop-shadow-sm">
                          {"★".repeat(rev.rating)}
                          <span className="text-stone-200">
                            {"★".repeat(5 - rev.rating)}
                          </span>
                        </span>
                      </div>

                      {(isStaff || myId === Number(rev.reviewer.id)) && (
                        <button
                          onClick={() => deleteReview(rev.id)}
                          className="opacity-0 group-hover:opacity-100 text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition-all shrink-0 ml-2"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Komment */}
                    <p className="text-stone-700 leading-relaxed text-[15px] italic break-words whitespace-pre-wrap">
                      "{rev.comment}"
                    </p>

                    {/* Aukció Neve */}
                    {rev.auction && (
                      <div className="border-t border-stone-100 mt-1">
                        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-stone-500">
                          <span className="shrink-0">Related Auction:</span>
                          <span className="text-primary truncate">
                            {rev.auction.title}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Lapozó gombok */}
                <div className="flex justify-center gap-4 mt-8 pt-6">
                  <button
                    disabled={skip === 0}
                    onClick={() => setSkip((s) => Math.max(0, s - take))}
                    className="px-6 py-3 bg-white border border-stone-200 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                  >
                    Previous
                  </button>
                  <button
                    disabled={reviews.length < take}
                    onClick={() => setSkip((s) => s + take)}
                    className="px-6 py-3 bg-white border border-stone-200 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-stone-50 border border border-stone-200 rounded-3xl">
                <div className="w-16 h-16 bg-white border border-stone-100 rounded-full flex items-center justify-center shadow-sm mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h4 className="font-playfair text-xl font-bold text-stone-800 mb-2">
                  No Reviews Yet
                </h4>
                <p className="text-sm text-stone-500">
                  This user hasn't received any public feedback.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
