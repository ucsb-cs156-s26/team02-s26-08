const recommendRequestsFixtures = {
    oneRecommendRequest: {
      id: 1,
      requesterEmail: "riasingh",
      professorEmail: "riasingh",
      explanation: "test",
      dateRequested: "2026-04-29T19:30:00",
      dateNeeded: "2026-04-29T19:30:00",
      done: true,
    },
    threeRecommendRequests: [
      {
        id: 1,
        requesterEmail: "riasingh",
        professorEmail: "riasingh",
        explanation: "test",
        dateRequested: "2026-04-29T19:30:00",
        dateNeeded: "2026-04-29T19:30:00",
        done: true,
      },
      {
        id: 2,
        requesterEmail: "riasingh@ucsb.edu",
        professorEmail: "ally@ucsb.edu",
        explanation: "testing1",
        dateRequested: "2026-04-29T19:30:00",
        dateNeeded: "2026-04-29T19:30:00",
        done: false,
      },
      {
        id: 3,
        requesterEmail: "riasingh@ucsb.edu",
        professorEmail: "ally@ucsb.edu",
        explanation: "testing3",
        dateRequested: "2026-04-29T19:30:00",
        dateNeeded: "2026-04-29T19:30:00",
        done: false,
      },
    ],
   };
   
   
   export { recommendRequestsFixtures };
   