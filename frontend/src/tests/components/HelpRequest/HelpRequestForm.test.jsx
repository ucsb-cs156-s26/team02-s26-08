import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  const expectedHeaders = [
    "Requester Email",
    "Team Id",
    "Table or Breakout Room",
    "Request Time",
    "Explanation",
    "Solved",
  ];
  const testId = "HelpRequestForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
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
      <Router>
        <HelpRequestForm initialContents={helpRequestFixtures.oneHelpRequest} />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByText(/^Id$/)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-requesterEmail`)).toHaveValue(
      "student1@ucsb.edu",
    );
    expect(screen.getByTestId(`${testId}-teamId`)).toHaveValue("team01");
    expect(screen.getByTestId(`${testId}-tableOrBreakoutRoom`)).toHaveValue(
      "4",
    );
    expect(screen.getByTestId(`${testId}-requestTime`)).toHaveValue(
      "2026-04-25T16:00",
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      "Need help with Dokku",
    );
    expect(screen.getByTestId(`${testId}-solved`)).toHaveValue("false");
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    expect(
      await screen.findByText(/Requester Email is required/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Team Id is required/)).toBeInTheDocument();
    expect(
      screen.getByText(/Table or Breakout Room is required/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Request Time is required/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
    expect(screen.getByText(/Solved is required/)).toBeInTheDocument();

    const requesterEmailInput = screen.getByTestId(`${testId}-requesterEmail`);
    const requestTimeInput = screen.getByTestId(`${testId}-requestTime`);

    fireEvent.change(requesterEmailInput, { target: { value: "bad-email" } });
    fireEvent.change(requestTimeInput, { target: { value: "bad-input" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Requester Email must be a valid email address/),
      ).toBeInTheDocument();
    });
  });

  test("that the form submits valid data", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <HelpRequestForm submitAction={mockSubmitAction} />
      </Router>,
    );

    fireEvent.change(await screen.findByTestId(`${testId}-requesterEmail`), {
      target: { value: "student1@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "team01" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-requestTime`), {
      target: { value: "2026-04-25T16:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Need help with Dokku" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-solved`), {
      target: { value: "false" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
  });
});
