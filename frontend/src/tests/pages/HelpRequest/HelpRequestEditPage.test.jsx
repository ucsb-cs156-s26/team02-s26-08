import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
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
const mockedUseNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 1,
    })),
    useNavigate: () => mockedUseNavigate,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("HelpRequestEditPage tests", () => {
  const setupAxiosMock = () => {
    axiosMock = new AxiosMockAdapter(axios);
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const renderPage = () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  afterEach(() => {
    mockToast.mockClear();
    mockNavigate.mockClear();
    mockedUseNavigate.mockClear();
    axiosMock.restore();
    axiosMock.resetHistory();
  });

  test("renders header but form is not present when backend does not return data", async () => {
    setupAxiosMock();
    axiosMock.onGet("/api/HelpRequest", { params: { id: 1 } }).timeout();

    const restoreConsole = mockConsole();

    renderPage();

    await screen.findByText("Edit HelpRequest");
    expect(
      screen.queryByTestId("HelpRequestForm-requesterEmail"),
    ).not.toBeInTheDocument();
    restoreConsole();
  });

  test("is populated with the data provided and submits updates", async () => {
    setupAxiosMock();
    axiosMock
      .onGet("/api/HelpRequest", { params: { id: 1 } })
      .reply(200, helpRequestFixtures.oneHelpRequest);
    axiosMock.onPut("/api/HelpRequest").reply(200, {
      id: "1",
      requesterEmail: "updated@ucsb.edu",
      teamId: "team01",
      tableOrBreakoutRoom: "5",
      requestTime: "2026-04-25T17:00",
      explanation: "Need help with frontend routing",
      solved: "true",
    });

    renderPage();

    await screen.findByTestId("HelpRequestForm-id");

    const idField = screen.getByTestId("HelpRequestForm-id");
    const requesterEmailField = screen.getByTestId(
      "HelpRequestForm-requesterEmail",
    );
    const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
    const tableOrBreakoutRoomField = screen.getByTestId(
      "HelpRequestForm-tableOrBreakoutRoom",
    );
    const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
    const explanationField = screen.getByTestId("HelpRequestForm-explanation");
    const solvedField = screen.getByTestId("HelpRequestForm-solved");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    expect(idField).toHaveValue("1");
    expect(requesterEmailField).toHaveValue("student1@ucsb.edu");
    expect(teamIdField).toHaveValue("team01");
    expect(tableOrBreakoutRoomField).toHaveValue("4");
    expect(requestTimeField).toHaveValue("2026-04-25T16:00");
    expect(explanationField).toHaveValue("Need help with Dokku");
    expect(solvedField).toHaveValue("false");
    expect(submitButton).toHaveTextContent("Update");

    fireEvent.change(requesterEmailField, {
      target: { value: "updated@ucsb.edu" },
    });
    fireEvent.change(tableOrBreakoutRoomField, {
      target: { value: "5" },
    });
    fireEvent.change(requestTimeField, {
      target: { value: "2026-04-25T17:00" },
    });
    fireEvent.change(explanationField, {
      target: { value: "Need help with frontend routing" },
    });
    fireEvent.change(solvedField, {
      target: { value: "true" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockToast).toBeCalled());
    expect(mockToast).toBeCalledWith(
      "HelpRequest Updated - id: 1 requesterEmail: updated@ucsb.edu",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/helprequest" });

    expect(axiosMock.history.put.length).toBe(1);
    expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
    expect(axiosMock.history.put[0].data).toBe(
      JSON.stringify({
        requesterEmail: "updated@ucsb.edu",
        teamId: "team01",
        tableOrBreakoutRoom: "5",
        requestTime: "2026-04-25T17:00",
        explanation: "Need help with frontend routing",
        solved: "true",
      }),
    );
  });

  test("does not submit invalid data", async () => {
    setupAxiosMock();
    axiosMock
      .onGet("/api/HelpRequest", { params: { id: 1 } })
      .reply(200, helpRequestFixtures.oneHelpRequest);
    axiosMock.onPut("/api/HelpRequest").reply(200, {});

    renderPage();

    await screen.findByTestId("HelpRequestForm-id");

    const requesterEmailField = screen.getByTestId(
      "HelpRequestForm-requesterEmail",
    );
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.change(requesterEmailField, {
      target: { value: "" },
    });
    fireEvent.click(submitButton);

    expect(
      await screen.findByText("Requester Email is required."),
    ).toBeInTheDocument();
    expect(axiosMock.history.put.length).toBe(0);
  });

  test("cancel button navigates back", async () => {
    setupAxiosMock();
    axiosMock
      .onGet("/api/HelpRequest", { params: { id: 1 } })
      .reply(200, helpRequestFixtures.oneHelpRequest);

    renderPage();

    const cancelButton = await screen.findByTestId("HelpRequestForm-cancel");
    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledWith(-1));
    expect(axiosMock.history.put.length).toBe(0);
  });
});
