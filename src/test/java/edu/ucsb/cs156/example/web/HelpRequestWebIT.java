package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_help_request() throws Exception {
    setupUser(true);

    page.getByText("HelpRequest").click();

    page.getByText("Create HelpRequest").click();
    assertThat(page.getByText("Create New HelpRequest")).isVisible();
    page.getByTestId("HelpRequestForm-requesterEmail").fill("manual-check@ucsb.edu");
    page.getByTestId("HelpRequestForm-teamId").fill("team02");
    page.getByTestId("HelpRequestForm-tableOrBreakoutRoom").fill("Table 5");
    page.getByTestId("HelpRequestForm-requestTime").fill("2026-04-25T16:00");
    page.getByTestId("HelpRequestForm-explanation").fill("Initial manual check");
    page.getByTestId("HelpRequestForm-solved").selectOption("false");
    page.getByTestId("HelpRequestForm-submit").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("manual-check@ucsb.edu");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("Initial manual check");

    page.getByTestId("HelpRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit HelpRequest")).isVisible();

    page.getByTestId("HelpRequestForm-explanation").fill("Updated manual check");
    page.getByTestId("HelpRequestForm-solved").selectOption("true");
    page.getByTestId("HelpRequestForm-submit").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("Updated manual check");
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-solved")).hasText("true");

    page.getByTestId("HelpRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }
}
