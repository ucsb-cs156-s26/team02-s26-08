import { render, screen } from "@testing-library/react";
import UCSBDiningCommonsMenuItemIndexPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemIndexPage";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("UCSBDiningCommonsMenuItemIndexPage tests", () => {
  const queryClient = new QueryClient();

  test("renders without crashing", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByText("Index page not yet implemented"),
    ).toBeInTheDocument();

    expect(screen.getByText("Create")).toHaveAttribute(
      "href",
      "/diningcommonsmenuitem/create",
    );

    expect(screen.getByText("Edit")).toHaveAttribute(
      "href",
      "/diningcommonsmenuitem/edit/1",
    );
  });
});
