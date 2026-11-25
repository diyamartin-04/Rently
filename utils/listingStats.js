// Rating summary for a listing, built from its reviews.
// A listing is a "guest favourite" with at least 3 reviews averaging 4.5 or higher.
const MIN_REVIEWS_FOR_FAVOURITE = 3;
const MIN_AVERAGE_FOR_FAVOURITE = 4.5;

module.exports = function getStats(reviews = []) {
  const list = (reviews || []).filter((r) => r && typeof r === "object");
  const count = list.length;
  const average = count ? list.reduce((sum, r) => sum + (r.rating || 0), 0) / count : null;

  return {
    count,
    average,
    guestFavourite: count >= MIN_REVIEWS_FOR_FAVOURITE && average >= MIN_AVERAGE_FOR_FAVOURITE,
  };
};
