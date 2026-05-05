import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
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

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Create New Article")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Explanation")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Date Added")).toBeInTheDocument();
  });

  test("on submit, makes request to backend, and redirects to /articles", async () => {
    const queryClient = new QueryClient();
    const savedArticle = {
      id: 3,
      title: "Handy Spring Utility Classes",
      url: "https://twitter.com/maciejwalkowiak/status/1511736828369719300",
      explanation: "Useful Spring classes",
      email: "phtcon@ucsb.edu",
      dateAdded: "2022-04-08T12:00:00",
    };

    axiosMock.onPost("/api/Articles/post").reply(202, savedArticle);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Handy Spring Utility Classes" },
    });
    fireEvent.change(screen.getByLabelText("URL"), {
      target: {
        value: "https://twitter.com/maciejwalkowiak/status/1511736828369719300",
      },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Useful Spring classes" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "phtcon@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Date Added"), {
      target: { value: "2022-04-08T12:00" },
    });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].url).toBe("/api/Articles/post");
    expect(axiosMock.history.post[0].params).toEqual({
      title: "Handy Spring Utility Classes",
      url: "https://twitter.com/maciejwalkowiak/status/1511736828369719300",
      explanation: "Useful Spring classes",
      email: "phtcon@ucsb.edu",
      dateAdded: "2022-04-08T12:00",
    });

    expect(mockToast).toBeCalledWith(
      "New Article Created - id: 3 title: Handy Spring Utility Classes",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });

  test("when form is invalid, does not POST and shows validation messages", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Create New Article")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create"));

    await screen.findByText(/Title is required/);
    expect(screen.getByText(/URL is required/)).toBeInTheDocument();
    expect(axiosMock.history.post.length).toBe(0);
  });
});
