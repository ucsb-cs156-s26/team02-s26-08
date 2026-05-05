import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import RecommendationRequestsEditPage from "main/pages/RecommendationRequests/RecommendationRequestsEditPage";

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

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("RecommendationRequestsEditPage tests", () => {
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
      axiosMock
        .onGet("/api/recommendationrequests", { params: { id: 17 } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit RecommendationRequests");
      expect(
        screen.queryByTestId("RecommendationRequests-requesterEmail"),
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
        .onGet("/api/recommendationrequests", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          requesterEmail: "riasingh",
          professorEmail: "riasingh",
          explanation: "test",
          dateRequested: "2026-04-29T19:30",
          dateNeeded: "2026-04-29T19:30",
          done: "true",
        });
      axiosMock.onPut("/api/recommendationrequests").reply(200, {
        id: "17",
        requesterEmail: "riasinghedit",
        professorEmail: "riasinghedit",
        explanation: "test1",
        dateRequested: "2026-04-29T19:31",
        dateNeeded: "2026-04-29T19:31",
        done: "false",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");
      const idField = screen.getByLabelText("Id");
      const requesterEmailField = screen.getByLabelText("requesterEmail");
      const professorEmailField = screen.getByLabelText("professorEmail");
      const explanationField = screen.getByLabelText("explanation");
      const dateRequestedField = screen.getByLabelText("dateRequested");
      const dateNeededField = screen.getByLabelText("dateNeeded");
      const doneField = screen.getByLabelText("done");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");

      expect(requesterEmailField).toBeInTheDocument();
      expect(requesterEmailField).toHaveValue("riasingh");

      expect(professorEmailField).toBeInTheDocument();
      expect(professorEmailField).toHaveValue("riasingh");

      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("test");

      expect(dateRequestedField).toBeInTheDocument();
      expect(dateRequestedField).toHaveValue("2026-04-29T19:30");

      expect(dateNeededField).toBeInTheDocument();
      expect(dateNeededField).toHaveValue("2026-04-29T19:30");

      expect(doneField).toBeInTheDocument();
      expect(doneField).toHaveValue("true");

      const submitButton = screen.getByTestId(
        "RecommendationRequestForm-submit",
      );
      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(requesterEmailField, {
        target: { value: "riasinghedit" },
      });
      fireEvent.change(professorEmailField, {
        target: { value: "riasinghedit" },
      });
      fireEvent.change(explanationField, {
        target: { value: "test1" },
      });
      fireEvent.change(dateRequestedField, {
        target: { value: "2026-04-29T19:31" },
      });
      fireEvent.change(dateNeededField, {
        target: { value: "2026-04-29T19:31" },
      });
      fireEvent.change(doneField, {
        target: { value: "false" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "RecommendationRequest Updated - id: 17 requesterEmail: riasinghedit",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequests" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "riasinghedit",
          professorEmail: "riasinghedit",
          explanation: "test1",
          dateRequested: "2026-04-29T19:31",
          dateNeeded: "2026-04-29T19:31",
          done: "false",
        }),
      ); // posted object
      expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequests" });
    });
  });
});
