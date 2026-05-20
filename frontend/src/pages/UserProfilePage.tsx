import { useParams } from "react-router-dom";
import { usePublicProfile } from "../hooks/useUser";
import { useUserReviews } from "../hooks/useReview";

export default function UserProfilePage() {
  const { id } = useParams();
  const userId = Number(id);

  const { data: profile, isLoading: isProfileLoading } =
    usePublicProfile(userId);
  const { data: reviews, isLoading: isReviewsLoading } = useUserReviews(userId);

  if (isProfileLoading || isReviewsLoading) {
    return <div>Loading user profile...</div>;
  }

  if (!profile) {
    return <div>User not found!</div>;
  }

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{ border: "1px solid gray", padding: "15px", width: "500px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img
            src={profile.profilePicture || "https://via.placeholder.com/80"}
            alt="Profile"
            style={{ width: "80px", height: "80px", borderRadius: "50%" }}
          />
          <div>
            <h2 style={{ margin: 0 }}>@{profile.username}</h2>
            <p style={{ margin: "5px 0 0 0", color: "gray" }}>
              {profile.firstName} {profile.lastName}
            </p>
          </div>
        </div>
      </div>

      {profile.seller ? (
        <div
          style={{
            border: "1px solid purple",
            padding: "15px",
            width: "500px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "purple" }}>
            Seller Information
          </h3>
          <p>
            <strong>Rating:</strong> ⭐ {profile.seller.rating} / 5
          </p>
          <p>
            <strong>Description:</strong>{" "}
            {profile.seller.description || "No description provided."}
          </p>
          <p style={{ fontSize: "13px", color: "gray" }}>
            <strong>Location:</strong> {profile.seller.address.city},{" "}
            {profile.seller.address.country}
          </p>
        </div>
      ) : (
        <div
          style={{
            border: "1px solid silver",
            padding: "15px",
            width: "500px",
            color: "gray",
          }}
        >
          This user is only registered as a buyer.
        </div>
      )}

      <div
        style={{ border: "1px solid black", padding: "15px", width: "500px" }}
      >
        <h3 style={{ margin: "0 0 10px 0" }}>
          Reviews ({reviews?.length || 0})
        </h3>

        {reviews && reviews.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  borderBottom: "1px dashed silver",
                  paddingBottom: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>
                    @{review.reviewer.username}
                  </span>
                  <span style={{ color: "orange" }}>
                    {"⭐".repeat(review.rating)}
                  </span>
                </div>
                <p style={{ margin: "5px 0 0 0", fontSize: "13px" }}>
                  {review.comment || "No comment left."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "gray", fontStyle: "italic" }}>
            No reviews yet for this user.
          </p>
        )}
      </div>
    </div>
  );
}
