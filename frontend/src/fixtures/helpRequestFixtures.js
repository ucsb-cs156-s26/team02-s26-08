const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "student1@ucsb.edu",
    teamId: "team01",
    tableOrBreakoutRoom: "4",
    requestTime: "2026-04-25T16:00:00",
    explanation: "Need help with Dokku",
    solved: false,
  },
  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "student1@ucsb.edu",
      teamId: "team01",
      tableOrBreakoutRoom: "4",
      requestTime: "2026-04-25T16:00:00",
      explanation: "Need help with Dokku",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "student2@ucsb.edu",
      teamId: "team02",
      tableOrBreakoutRoom: "Breakout room 2",
      requestTime: "2026-04-25T16:15:00",
      explanation: "Need help with tests",
      solved: true,
    },
    {
      id: 3,
      requesterEmail: "student3@ucsb.edu",
      teamId: "team03",
      tableOrBreakoutRoom: "7",
      requestTime: "2026-04-25T16:30:00",
      explanation: "Question about React forms",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
