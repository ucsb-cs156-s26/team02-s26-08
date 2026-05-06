import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import ArticlesForm from "main/components/Articles/ArticlesForm";
import { articlesFixtures } from "fixtures/articlesFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticlesForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Title",
    "URL",
    "Explanation",
    "Email",
    "Date Added",
  ];
  const testId = "ArticlesForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm initialContents={articlesFixtures.oneArticle} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Title is required/);
    expect(screen.getByText(/URL is required/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date Added is required/)).toBeInTheDocument();

    const urlInput = screen.getByTestId(`${testId}-url`);
    fireEvent.change(urlInput, { target: { value: "not-a-url" } });
    const emailInput = screen.getByTestId(`${testId}-email`);
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/URL must start with http:\/\/ or https:\/\//),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Email must be a valid email address/),
    ).toBeInTheDocument();
  });

  test("No error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );
    await screen.findByTestId(`${testId}-title`);

    const titleField = screen.getByTestId(`${testId}-title`);
    const urlField = screen.getByTestId(`${testId}-url`);
    const explanationField = screen.getByTestId(`${testId}-explanation`);
    const emailField = screen.getByTestId(`${testId}-email`);
    const dateAddedField = screen.getByTestId(`${testId}-dateAdded`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(titleField, { target: { value: "Test Title" } });
    fireEvent.change(urlField, { target: { value: "https://example.com" } });
    fireEvent.change(explanationField, {
      target: { value: "Test explanation" },
    });
    fireEvent.change(emailField, { target: { value: "test@ucsb.edu" } });
    fireEvent.change(dateAddedField, {
      target: { value: "2022-04-20T12:00" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/Title is required/)).not.toBeInTheDocument();
    expect(screen.queryByText(/URL is required/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Explanation is required/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Email is required/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Date Added is required/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/URL must start with http:\/\/ or https:\/\//),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Email must be a valid email address/),
    ).not.toBeInTheDocument();
  });
});
