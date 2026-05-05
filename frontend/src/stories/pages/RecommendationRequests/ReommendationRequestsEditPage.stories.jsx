import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import RecommendationRequestsEditPage from "main/pages/RecommendationRequests/RecommendationRequestsEditPage";
import { recommendRequestsFixtures } from "fixtures/recommendRequestsFixtures";

export default {
  title: "pages/RecommendationRequests/RecommendationRequestsEditPage",
  component: RecommendationRequestsEditPage,
};

const Template = () => <RecommendationRequestsEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/recommendationrequests", () => {
      return HttpResponse.json(
        recommendRequestsFixtures.threeRecommendRequests[0],
        {
          status: 200,
        },
      );
    }),
    http.put("/api/recommendationrequests", () => {
      return HttpResponse.json(
        {
          id: "17",
          requesterEmail: "riasinghedit",
          professorEmail: "riasinghedit",
          explanation: "test1",
          dateRequested: "2026-04-29T19:31",
          dateNeeded: "2026-04-29T19:31",
          done: "false",
        },
        { status: 200 },
      );
    }),
  ],
};
