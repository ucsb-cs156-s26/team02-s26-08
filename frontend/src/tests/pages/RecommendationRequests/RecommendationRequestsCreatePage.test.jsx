import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecommendationRequestsCreatePage from "main/pages/RecommendationRequests/RecommendationRequestsCreatePage";
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

describe("RecommendationRequestsCreatePage tests", () => {
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

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("requesterEmail")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /recommendationrequests", async () => {
    const queryClient = new QueryClient();
    const recommendationrequests = {
      id: 2,
      requesterEmail: "riasingh@ucsb.edu",
      professorEmail: "ally@ucsb.edu",
      explanation: "testing1",
      dateRequested: "2026-04-29T19:30",
      dateNeeded: "2026-04-29T19:30",
      done: "false",
    };

    axiosMock
      .onPost("/api/recommendationrequests/post")
      .reply(202, recommendationrequests);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("requesterEmail")).toBeInTheDocument();
    });

    const requesterEmailInput = screen.getByLabelText("requesterEmail");
    expect(requesterEmailInput).toBeInTheDocument();

    const professorEmailInput = screen.getByLabelText("professorEmail");
    expect(professorEmailInput).toBeInTheDocument();

    const explanationInput = screen.getByLabelText("explanation");
    expect(explanationInput).toBeInTheDocument();

    const dateRequestedInput = screen.getByLabelText("dateRequested");
    expect(dateRequestedInput).toBeInTheDocument();

    const dateNeededInput = screen.getByLabelText("dateNeeded");
    expect(dateNeededInput).toBeInTheDocument();

    const doneInput = screen.getByLabelText("done");
    expect(doneInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(requesterEmailInput, {
      target: { value: "riasingh@ucsb.edu" },
    });
    fireEvent.change(professorEmailInput, {
      target: { value: "ally@ucsb.edu" },
    });
    fireEvent.change(explanationInput, { target: { value: "testing1" } });
    fireEvent.change(dateRequestedInput, {
      target: { value: "2026-04-29T19:30:00" },
    });
    fireEvent.change(dateNeededInput, {
      target: { value: "2026-04-29T19:30:00" },
    });
    fireEvent.change(doneInput, { target: { value: "false" } });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "riasingh@ucsb.edu",
      professorEmail: "ally@ucsb.edu",
      explanation: "testing1",
      dateRequested: "2026-04-29T19:30",
      dateNeeded: "2026-04-29T19:30",
      done: "false",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toHaveBeenCalledWith(
      "New RecommendationRequest Created - id: 2 requesterEmail: riasingh@ucsb.edu",
    );
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/recommendationrequests",
    });
  });
});
