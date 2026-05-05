import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Organization Translation Short",
    "Organization Translation",
    "Inactive",
  ];
  const testId = "UCSBOrganizationForm";

  test("renders correctly with no initialContents (Create mode)", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    // orgCode is always shown; in Create mode it is editable (not disabled)
    const orgCodeField = await screen.findByTestId(`${testId}-orgCode`);
    expect(orgCodeField).toBeInTheDocument();
    expect(orgCodeField).not.toBeDisabled();

    // inactive checkbox is present
    expect(screen.getByTestId(`${testId}-inactive`)).toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents (Update mode)", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm
            initialContents={ucsbOrganizationFixtures.oneOrganization[0]}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    // orgCode is shown as read-only in Update mode
    const orgCodeField = await screen.findByTestId(`${testId}-orgCode`);
    expect(orgCodeField).toBeInTheDocument();
    expect(screen.getByText("Org Code")).toBeInTheDocument();
    expect(orgCodeField).toHaveValue("ZPRC");
    expect(orgCodeField).toBeDisabled();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("orgCode field is marked invalid on empty submit in Create mode", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    const submitButton = await screen.findByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    // Wait for the error message to appear, then verify field is marked invalid
    await screen.findByText(/Org Code is required\./);
    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveClass("is-invalid");
  });

  test("orgCode field is NOT marked invalid in Update mode", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm
            initialContents={ucsbOrganizationFixtures.oneOrganization[0]}
          />
        </Router>
      </QueryClientProvider>,
    );

    // Clear a non-orgCode field so a validation error fires, confirming the
    // form ran validation — then verify orgCode itself is not marked invalid.
    const shortInput = await screen.findByTestId(
      `${testId}-orgTranslationShort`,
    );
    fireEvent.change(shortInput, { target: { value: "" } });

    const submitButton = screen.getByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    await screen.findByText(/Organization Translation Short is required\./);
    expect(screen.getByTestId(`${testId}-orgCode`)).not.toHaveClass(
      "is-invalid",
    );
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    await screen.findByText(/Org Code is required\./);
    expect(
      screen.getByText(/Organization Translation Short is required\./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Organization Translation is required\./),
    ).toBeInTheDocument();
  });

  test("that max length validations are enforced", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByTestId(`${testId}-submit`);

    const shortInput = screen.getByTestId(`${testId}-orgTranslationShort`);
    fireEvent.change(shortInput, { target: { value: "a".repeat(51) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 50 characters/)).toBeInTheDocument();
    });

    const longInput = screen.getByTestId(`${testId}-orgTranslation`);
    fireEvent.change(longInput, { target: { value: "a".repeat(101) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 100 characters/)).toBeInTheDocument();
    });
  });

  test("No error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId(`${testId}-orgCode`)).toBeInTheDocument();

    const orgCodeInput = screen.getByTestId(`${testId}-orgCode`);
    const shortInput = screen.getByTestId(`${testId}-orgTranslationShort`);
    const fullInput = screen.getByTestId(`${testId}-orgTranslation`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(orgCodeInput, { target: { value: "ZPRC" } });
    fireEvent.change(shortInput, { target: { value: "Zeta Phi Rho" } });
    fireEvent.change(fullInput, {
      target: { value: "Zeta Phi Rho Fraternity" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    // orgCode should not be marked invalid when filled correctly in Create mode
    expect(screen.getByTestId(`${testId}-orgCode`)).not.toHaveClass(
      "is-invalid",
    );
    expect(
      screen.queryByText(/Org Code is required\./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Organization Translation Short is required\./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Organization Translation is required\./),
    ).not.toBeInTheDocument();
  });
});
