import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RecommendationRequestsIndexPage from "main/pages/RecommendationRequests/RecommendationRequestsIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";
import { recommendRequestsFixtures } from "fixtures/recommendRequestsFixtures";


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


describe("RecommendationRequestsIndexPage tests", () => {
 const axiosMock = new AxiosMockAdapter(axios);


 const testId = "RecommendationRequestTable";


 const setupUserOnly = () => {
   axiosMock.reset();
   axiosMock.resetHistory();
   axiosMock
     .onGet("/api/currentUser")
     .reply(200, apiCurrentUserFixtures.userOnly);
   axiosMock
     .onGet("/api/systemInfo")
     .reply(200, systemInfoFixtures.showingNeither);
 };


 const setupAdminUser = () => {
   axiosMock.reset();
   axiosMock.resetHistory();
   axiosMock
     .onGet("/api/currentUser")
     .reply(200, apiCurrentUserFixtures.adminUser);
   axiosMock
     .onGet("/api/systemInfo")
     .reply(200, systemInfoFixtures.showingNeither);
 };


 const queryClient = new QueryClient();


 test("Renders with Create Button for admin user", async () => {
   setupAdminUser();
   axiosMock.onGet("/api/recommendationrequests/all").reply(200, []);


   render(
     <QueryClientProvider client={queryClient}>
       <MemoryRouter>
         <RecommendationRequestsIndexPage />
       </MemoryRouter>
     </QueryClientProvider>,
   );


   await waitFor(() => {
     expect(
       screen.getByText(/Create RecommendationRequest/),
     ).toBeInTheDocument();
   });
   const button = screen.getByText(/Create RecommendationRequest/);
   expect(button).toHaveAttribute("href", "/recommendationrequests/create");
   expect(button).toHaveAttribute("style", "float: right;");
 });


 test("renders three RecommendationRequests correctly for regular user", async () => {
   setupUserOnly();
   axiosMock
     .onGet("/api/recommendationrequests/all")
     .reply(200, recommendRequestsFixtures.threeRecommendRequests);


   render(
     <QueryClientProvider client={queryClient}>
       <MemoryRouter>
         <RecommendationRequestsIndexPage />
       </MemoryRouter>
     </QueryClientProvider>,
   );


   await waitFor(() => {
     expect(
       screen.getByTestId(`${testId}-cell-row-0-col-id`),
     ).toHaveTextContent("1");
   });
   expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
     "2",
   );
   expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
     "3",
   );


   const createRecommendationRequestButton = screen.queryByText(
     "Create RecommendationRequest",
   );
   expect(createRecommendationRequestButton).not.toBeInTheDocument();


   expect(
     screen.getByTestId(`${testId}-cell-row-1-col-requesterEmail`),
   ).toHaveTextContent("riasingh@ucsb.edu");


   expect(
     screen.getByTestId(`${testId}-cell-row-1-col-professorEmail`),
   ).toHaveTextContent("ally@ucsb.edu");


   expect(
     screen.getByTestId(`${testId}-cell-row-1-col-explanation`),
   ).toHaveTextContent("testing1");


   expect(
     screen.getByTestId(`${testId}-cell-row-1-col-dateRequested`),
   ).toHaveTextContent("2026-04-29T19:30:00");


   expect(
     screen.getByTestId(`${testId}-cell-row-1-col-dateNeeded`),
   ).toHaveTextContent("2026-04-29T19:30:00");


   expect(
     screen.getByTestId(`${testId}-cell-row-1-col-done`),
   ).toHaveTextContent("false");


   // for non-admin users, details button is visible, but the edit and delete buttons should not be visible
   expect(
     screen.queryByTestId(
       "RecommendationRequestTable-cell-row-0-col-Delete-button",
     ),
   ).not.toBeInTheDocument();
   expect(
     screen.queryByTestId(
       "RecommendationRequestTable-cell-row-0-col-Edit-button",
     ),
   ).not.toBeInTheDocument();
 });


 test("renders empty table when backend unavailable, user only", async () => {
   setupUserOnly();


   axiosMock.onGet("/api/recommendationrequests/all").timeout();


   const restoreConsole = mockConsole();


   render(
     <QueryClientProvider client={queryClient}>
       <MemoryRouter>
         <RecommendationRequestsIndexPage />
       </MemoryRouter>
     </QueryClientProvider>,
   );


   await waitFor(() => {
     expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
   });


   const errorMessage = console.error.mock.calls[0][0];
   expect(errorMessage).toMatch(
     "Error communicating with backend via GET on /api/recommendationrequests/all",
   );
   restoreConsole();
 });


 test("what happens when you click delete, admin", async () => {
   setupAdminUser();


   axiosMock
     .onGet("/api/recommendationrequests/all")
     .reply(200, recommendRequestsFixtures.threeRecommendRequests);
   axiosMock
     .onDelete("/api/recommendationrequests")
     .reply(200, "RecommendationRequest with id 1 was deleted");


   render(
     <QueryClientProvider client={queryClient}>
       <MemoryRouter>
         <RecommendationRequestsIndexPage />
       </MemoryRouter>
     </QueryClientProvider>,
   );


   await waitFor(() => {
     expect(
       screen.getByTestId(`${testId}-cell-row-0-col-id`),
     ).toBeInTheDocument();
   });


   expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
     "1",
   );


   const deleteButton = await screen.findByTestId(
     `${testId}-cell-row-0-col-Delete-button`,
   );
   expect(deleteButton).toBeInTheDocument();


   fireEvent.click(deleteButton);


   await waitFor(() => {
     expect(mockToast).toBeCalledWith(
       "RecommendationRequest with id 1 was deleted",
     );
   });


   await waitFor(() => {
     expect(axiosMock.history.delete.length).toBe(1);
   });
   expect(axiosMock.history.delete[0].url).toBe("/api/recommendationrequests");
   expect(axiosMock.history.delete[0].url).toBe("/api/recommendationrequests");
   expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
 });
});


