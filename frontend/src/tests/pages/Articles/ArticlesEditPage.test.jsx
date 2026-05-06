import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigateTo = vi.fn();
const mockNavigateRelative = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: "17",
    })),
    Navigate: vi.fn((x) => {
      mockNavigateTo(x);
      return null;
    }),
    useNavigate: () => mockNavigateRelative,
  };
});

const getArticle = () => ({
  id: 17,
  title: "Handy Spring Utility Classes",
  url: "https://twitter.com/maciejwalkowiak/status/1511736828369719300",
  explanation: "Useful Spring classes",
  email: "phtcon@ucsb.edu",
  dateAdded: "2022-04-08T12:00:00",
});

let axiosMock;

describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/Articles", { params: { id: "17" } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigateTo.mockClear();
      mockNavigateRelative.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Article");
      expect(
        screen.queryByTestId("ArticlesForm-title"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/Articles", { params: { id: "17" } })
        .reply(200, getArticle());
      axiosMock.onPut("/api/Articles").reply(200, {
        id: "17",
        title: "Updated Article Title",
        url: "https://example.com/article",
        explanation: "Updated explanation",
        email: "updated@ucsb.edu",
        dateAdded: "2022-06-01T09:00:00",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigateTo.mockClear();
      mockNavigateRelative.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      expect(screen.getByTestId("ArticlesForm-id")).toHaveValue("17");
      expect(screen.getByTestId("ArticlesForm-title")).toHaveValue(
        "Handy Spring Utility Classes",
      );
      expect(screen.getByTestId("ArticlesForm-url")).toHaveValue(
        "https://twitter.com/maciejwalkowiak/status/1511736828369719300",
      );
      expect(screen.getByTestId("ArticlesForm-explanation")).toHaveValue(
        "Useful Spring classes",
      );
      expect(screen.getByTestId("ArticlesForm-email")).toHaveValue(
        "phtcon@ucsb.edu",
      );

      const submitButton = screen.getByTestId("ArticlesForm-submit");
      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
        target: { value: "Updated Article Title" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-url"), {
        target: { value: "https://example.com/article" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-explanation"), {
        target: { value: "Really big explanations" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Updated Article Title",
      );

      expect(mockNavigateTo).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "Updated Article Title",
          url: "https://example.com/article",
          explanation: "Really big explanations",
          email: "phtcon@ucsb.edu",
          dateAdded: "2022-04-08T12:00:00",
        }),
      );
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
        target: { value: "Updated Article Title" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-url"), {
        target: { value: "https://example.com/article" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-explanation"), {
        target: { value: "New explanation" },
      });

      fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Updated Article Title",
      );
      expect(mockNavigateTo).toBeCalledWith({ to: "/articles" });
    });

    test("does not PUT when form is invalid", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");

      fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

      await screen.findByText(/Title is required/);
      expect(axiosMock.history.put.length).toBe(0);
    });

    test("Cancel calls navigate(-1)", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-cancel");
      fireEvent.click(screen.getByTestId("ArticlesForm-cancel"));

      await waitFor(() =>
        expect(mockNavigateRelative).toHaveBeenCalledWith(-1),
      );
    });
  });
});
