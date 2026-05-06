const menuItemReviewFixtures = {
  oneMenuItemReview: [
    {
      id: 1,
      itemId: 1,
      reviewerEmail: "reviewer1@ucsb.edu",
      stars: 5,
      dateReviewed: "2024-10-31T12:00:00",
      comments: "Great food, would order again!",
    },
  ],

  threeMenuItemReviews: [
    {
      id: 2,
      itemId: 3,
      reviewerEmail: "reviewer2@ucsb.edu",
      stars: 4,
      dateReviewed: "2024-11-01T09:30:00",
      comments: "Very tasty, but a bit pricey.",
    },

    {
      id: 3,
      itemId: 5,
      reviewerEmail: "reviewer3@ucsb.edu",
      stars: 3,
      dateReviewed: "2024-11-02T14:00:00",
      comments: "It was okay, nothing special.",
    },

    {
      id: 4,
      itemId: 7,
      reviewerEmail: "reviewer4@ucsb.edu",
      stars: 2,
      dateReviewed: "2024-11-03T18:00:00",
      comments: "Not great, would not recommend.",
    },
  ],
};

export { menuItemReviewFixtures };
