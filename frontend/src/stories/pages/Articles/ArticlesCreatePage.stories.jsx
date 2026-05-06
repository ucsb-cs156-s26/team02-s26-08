import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";

export default {
  title: "pages/Articles/ArticlesCreatePage",
  component: ArticlesCreatePage,
};

const Template = () => <ArticlesCreatePage storybook={true} />;

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
    http.post("/api/Articles/post", () => {
      return HttpResponse.json(
        {
          id: 1,
          title: "Using testing-playground with React Testing Library",
          url: "https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7",
          explanation: "Helpful when we get to front end development",
          email: "phtcon@ucsb.edu",
          dateAdded: "2022-04-20T00:00:00",
        },
        { status: 200 },
      );
    }),
  ],
};
