import { render, screen } from "@testing-library/react";
import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

describe("UCSBDiningCommonsMenuItemEditPage tests", () => {
  test("renders without crashing", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText("Edit page not yet implemented"),
    ).toBeInTheDocument();
  });
});
