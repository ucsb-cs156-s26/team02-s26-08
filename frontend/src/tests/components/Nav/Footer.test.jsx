import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import Footer from "main/components/Nav/Footer";
import { beforeEach, describe, expect, test, vi } from "vitest";

let mockSystemInfo;

vi.mock("main/utils/systemInfo", () => ({
  useSystemInfo: () => ({
    data: mockSystemInfo,
    isSuccess: true,
  }),
}));

describe("Footer tests", () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  test("renders correctly with system info content", async () => {
    mockSystemInfo = systemInfoFixtures.initialData;

    render(
      <QueryClientProvider client={queryClient}>
        <Footer />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("Footer")).toBeInTheDocument();
    });

    const expectedText =
      "This is a sample webapp using React with a Spring Boot backend. See the source code on Github.";

    expect(screen.getByTestId("Footer").textContent).toBe(expectedText);

    const footer_see_source_code = screen.getByTestId("footer-see-source-code");

    expect(footer_see_source_code).toBeInTheDocument();
    expect(footer_see_source_code).toHaveTextContent(
      "See the source code on Github.",
    );

    const githubLink = screen.getByText(/Github/);
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/ucsb-cs156-s26/STARTER-team02",
    );
  });

  test("renders correctly without system info content", async () => {
    mockSystemInfo = {};

    render(
      <QueryClientProvider client={queryClient}>
        <Footer />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("Footer")).toBeInTheDocument();
    });

    const expectedText =
      "This is a sample webapp using React with a Spring Boot backend.";

    expect(screen.getByTestId("Footer").textContent).toBe(expectedText);

    const footer_see_source_code = screen.getByTestId("footer-see-source-code");

    expect(footer_see_source_code).toBeInTheDocument();
    expect(footer_see_source_code).toBeEmptyDOMElement();
  });
});
