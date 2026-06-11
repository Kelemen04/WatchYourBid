import { useParams, useNavigate } from "react-router-dom";
import { usePublicProfile, useMeData } from "../hooks/useUser";
import { useUserReviews } from "../hooks/useReview";
import { useDeleteReview } from "../hooks/useModerator";
import { getUserId, getUserRole } from "../api/axios";

export default function UserProfilePage() {
  const { id } = useParams();
  const targetUserId = Number(id);
  const navigate = useNavigate();

  const myRole = getUserRole();
  const myId = getUserId();

  // Jogosultságok
  const isStaff =
    myRole === "ADMIN" || myRole === "SUPER_ADMIN" || myRole === "MODERATOR";
  const isOwner = myId === targetUserId;

  // OKOS ADATLEKÉRÉS:
  // Ha a saját profilomat nézem, a /me végpontot hívom (MeResponse, több adattal)
  // Ha másét, akkor a /user/:id végpontot (PublicProfileDTO, privát adatok nélkül)
  const { data: myPrivateData, isLoading: isMeLoading } = useMeData({
    enabled: isOwner,
  });
  const { data: publicProfile, isLoading: isPublicLoading } = usePublicProfile(
    targetUserId,
    { enabled: !isOwner },
  );

  const { data: reviews, isLoading: isReviewsLoading } =
    useUserReviews(targetUserId);
  const { mutate: deleteReview } = useDeleteReview();

  const isLoading =
    (isOwner ? isMeLoading : isPublicLoading) || isReviewsLoading;

  // Közös objektummá alakítjuk a megjelenítéshez
  const profile = isOwner ? myPrivateData : publicProfile;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-background"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-2xl text-red-500 font-bold">User not found!</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-inter">
      {/* Fejléc */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-background">
          {isOwner ? "My Dashboard & Profile" : "User Profile"}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Bal oldal (1/3): Profil, Privát és Eladói adatok (Sticky) */}
        <div className="w-full lg:w-1/3 sticky top-24 flex flex-col gap-6">
          {/* Alap Profil Kártya (Publikus + Privát infók) */}
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col items-center text-center gap-4 relative overflow-hidden">
            {isOwner && (
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                YOU
              </div>
            )}
            <img
              src={profile.profilePicture || "https://via.placeholder.com/150"}
              alt={`${profile.username}'s profile`}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
            />

            <div className="flex flex-col gap-1 w-full items-center">
              <h3 className="text-2xl font-bold text-background">
                @{profile.username}
              </h3>
              {(profile.firstName || profile.lastName) && (
                <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">
                  {profile.firstName} {profile.lastName}
                </p>
              )}

              {/* Csak a saját profil esetén látjuk az emailt, telefont és egyenleget */}
              {isOwner && myPrivateData && (
                <div className="w-full bg-gray-50 mt-4 p-3 rounded-lg border border-gray-100 text-left flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Balance:</span>
                    <span className="font-bold text-primary">
                      €{myPrivateData.balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col text-xs text-gray-600 gap-1 mt-1 border-t border-gray-200 pt-2">
                    <span className="truncate">📧 {myPrivateData.email}</span>
                    {myPrivateData.phoneNumber && (
                      <span>📞 {myPrivateData.phoneNumber}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isOwner && (
              <button
                onClick={() => navigate("/profile/edit")}
                className="mt-2 w-full py-2.5 border-2 border-background text-background font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-background hover:text-white transition-colors"
              >
                Edit Settings
              </button>
            )}
          </div>

          {/* Eladói adatok Kártya (Publikus) */}
          {profile.seller ? (
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col gap-5">
              <h4 className="text-lg font-bold text-background border-b border-gray-100 pb-2">
                Seller Identity
              </h4>

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Rating
                </span>
                <span className="font-bold text-lg text-background flex items-center gap-1">
                  ⭐ {profile.seller.rating.toFixed(1)} / 5.0
                </span>
              </div>

              {/* Részletes Lakcím kiíratása */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Business Location
                </span>
                <div className="text-sm text-background font-medium leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                  <p>
                    {profile.seller.address.street}{" "}
                    {profile.seller.address.number}
                  </p>

                  {(profile.seller.address.building ||
                    profile.seller.address.floor ||
                    profile.seller.address.apartment) && (
                    <p className="text-gray-600">
                      {profile.seller.address.building &&
                        `Bld: ${profile.seller.address.building} `}
                      {profile.seller.address.floor &&
                        `Fl: ${profile.seller.address.floor} `}
                      {profile.seller.address.apartment &&
                        `Apt: ${profile.seller.address.apartment}`}
                    </p>
                  )}

                  <p>
                    {profile.seller.address.zipCode}{" "}
                    {profile.seller.address.city}
                  </p>
                  <p className="text-gray-500">
                    {profile.seller.address.region},{" "}
                    {profile.seller.address.country}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  About
                </span>
                <p className="text-sm text-gray-600 italic leading-relaxed">
                  "
                  {profile.seller.description || "No description provided yet."}
                  "
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl text-center">
              <span className="text-sm text-gray-500 uppercase tracking-widest font-medium">
                Not registered as a Seller.
              </span>
            </div>
          )}

          {/* Vevői adatok (CSAK A SAJÁT PROFILNÁL LÁTSZIK) */}
          {isOwner && myPrivateData && myPrivateData.buyer && (
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col gap-4">
              <h4 className="text-lg font-bold text-background border-b border-gray-100 pb-2">
                Buyer Identity
              </h4>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Default Shipping Address
              </span>
              <div className="text-sm text-background font-medium leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                <p>
                  {myPrivateData.buyer.shippingAddress.street}{" "}
                  {myPrivateData.buyer.shippingAddress.number}
                </p>
                <p>
                  {myPrivateData.buyer.shippingAddress.zipCode}{" "}
                  {myPrivateData.buyer.shippingAddress.city}
                </p>
                <p className="text-gray-500">
                  {myPrivateData.buyer.shippingAddress.country}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Jobb oldal (2/3): Értékelések listája */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-background">
                Reviews as Seller
              </h3>
              <span className="bg-gray-100 text-background px-4 py-1 rounded-full text-sm font-bold">
                {reviews?.length || 0} total
              </span>
            </div>

            {reviews && reviews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {reviews.map((review) => {
                  const canDelete =
                    isStaff ||
                    (myId !== null && myId === Number(review.reviewer.id));

                  return (
                    <div
                      key={review.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors bg-gray-50/30"
                    >
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex justify-between items-center w-full">
                          <span className="font-bold text-background">
                            @{review.reviewer.username}
                          </span>
                          <span className="text-sm tracking-widest text-orange-400">
                            {"⭐".repeat(review.rating)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {review.comment || "No comment left."}
                        </p>
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => deleteReview(review.id)}
                          className={`shrink-0 px-4 py-2 border rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${
                            isStaff
                              ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              : "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                          }`}
                          title={
                            isStaff
                              ? "Delete as Moderator"
                              : "Delete your review"
                          }
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 text-lg uppercase tracking-widest font-medium">
                  {isOwner
                    ? "You don't have any reviews yet."
                    : "No reviews yet for this user."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
