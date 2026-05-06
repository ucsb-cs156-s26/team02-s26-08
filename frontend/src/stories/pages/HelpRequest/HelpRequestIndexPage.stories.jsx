import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";

export default {
  title: "pages/HelpRequest/HelpRequestIndexPage",
  component: HelpRequestIndexPage,
};

const Template = () => <HelpRequestIndexPage storybook={true} />;

export const Empty = Template.bind({});
Empty.parameters = {
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
    http.get("/api/HelpRequest/all", () => {
      return HttpResponse.json([], { status: 200 });
    }),
  ],
};

export const ThreeItemsOrdinaryUser = Template.bind({});
ThreeItemsOrdinaryUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/HelpRequest/all", () => {
      return HttpResponse.json(helpRequestFixtures.threeHelpRequests);
    }),
  ],
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/HelpRequest/all", () => {
      return HttpResponse.json(helpRequestFixtures.threeHelpRequests);
    }),
    http.delete("/api/HelpRequest", () => {
      return HttpResponse.json("HelpRequest with id 1 was deleted", {
        status: 200,
      });
    }),
  ],
};
