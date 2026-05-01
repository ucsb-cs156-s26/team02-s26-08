import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["Dining Commons Code", "Name", "Station"];
  const testId = "UCSBDiningCommonsMenuItemForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm
            initialContents={ucsbDiningCommonsMenuItemFixtures.oneMenuItem}
          />
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
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm />
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
          <UCSBDiningCommonsMenuItemForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Dining Commons Code is required/);
    expect(screen.getByText(/Name is required/)).toBeInTheDocument();
    expect(screen.getByText(/Station is required/)).toBeInTheDocument();
  });

  test("No error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );

    await screen.findByTestId(`${testId}-diningCommonsCode`);

    const diningCommonsCodeField = screen.getByTestId(
      `${testId}-diningCommonsCode`,
    );
    const nameField = screen.getByTestId(`${testId}-name`);
    const stationField = screen.getByTestId(`${testId}-station`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(diningCommonsCodeField, {
      target: { value: "ortega" },
    });
    fireEvent.change(nameField, {
      target: { value: "Baked Pesto Pasta with Chicken" },
    });
    fireEvent.change(stationField, {
      target: { value: "Entree Specials" },
    });

    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Dining Commons Code is required/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Name is required/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Station is required/)).not.toBeInTheDocument();
  });
});
