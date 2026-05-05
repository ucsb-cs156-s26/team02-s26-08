import { render, screen } from "@testing-library/react";
import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("UCSBDiningCommonsMenuItemEditPage tests", () => {
  const queryClient = new QueryClient();

  test("renders without crashing", () => {
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
