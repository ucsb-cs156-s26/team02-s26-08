import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("HelpRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders without crashing", async () => {
    renderPage();

    await screen.findByText("Create New HelpRequest");
    expect(
      screen.getByTestId("HelpRequestForm-requesterEmail"),
    ).toBeInTheDocument();
  });

  test("on submit, makes request to backend, and redirects to /helprequest", async () => {
    const helpRequest = {
      id: 3,
      requesterEmail: "student3@ucsb.edu",
      teamId: "team03",
      tableOrBreakoutRoom: "7",
      requestTime: "2026-04-25T16:00",
      explanation: "Need help with React testing",
      solved: "false",
    };

    axiosMock.onPost("/api/HelpRequest/post").reply(202, helpRequest);

    renderPage();

    fireEvent.change(
      await screen.findByTestId("HelpRequestForm-requesterEmail"),
      {
        target: { value: "student3@ucsb.edu" },
      },
    );
    fireEvent.change(screen.getByTestId("HelpRequestForm-teamId"), {
      target: { value: "team03" },
    });
    fireEvent.change(
      screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
      {
        target: { value: "7" },
      },
    );
    fireEvent.change(screen.getByTestId("HelpRequestForm-requestTime"), {
      target: { value: "2026-04-25T16:00" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
      target: { value: "Need help with React testing" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-solved"), {
      target: { value: "false" },
    });

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "student3@ucsb.edu",
      teamId: "team03",
      tableOrBreakoutRoom: "7",
      requestTime: "2026-04-25T16:00",
      explanation: "Need help with React testing",
      solved: "false",
    });

    expect(mockToast).toBeCalledWith(
      "New HelpRequest Created - id: 3 requesterEmail: student3@ucsb.edu",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/helprequest" });
  });

  test("on invalid submit, shows validation errors and does not post", async () => {
    renderPage();

    fireEvent.click(await screen.findByTestId("HelpRequestForm-submit"));

    expect(
      await screen.findByText("Requester Email is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Team Id is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Table or Breakout Room is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Request Time is required.")).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
    expect(screen.getByText("Solved is required.")).toBeInTheDocument();
    expect(axiosMock.history.post.length).toBe(0);
  });
});
