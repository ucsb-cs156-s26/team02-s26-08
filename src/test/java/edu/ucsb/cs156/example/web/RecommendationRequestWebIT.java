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
public class RecommendationRequestWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_rec_request() throws Exception {
    setupUser(true);

    page.getByText("RecommendationRequests").click();

    page.getByText("Create RecommendationRequest").click();
    assertThat(page.getByText("Create New RecommendationRequest")).isVisible();
    page.getByLabel("requesterEmail").fill("firstDayOfClasses");
    page.getByLabel("professorEmail").fill("20222");
    page.getByLabel("explanation").fill("20222");
    page.getByLabel("dateRequested").fill("2022-01-03T00:00");
    page.getByLabel("dateNeeded").fill("2022-01-03T00:00");
    page.getByLabel("done").fill("true");
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("firstDayOfClasses");

    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit RecommendationRequest")).isVisible();
    page.getByTestId("RecommendationRequestForm-explanation").fill("20223");
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("20223");

    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_rec_request() throws Exception {
    setupUser(false);

    page.getByText("RecommendationRequests").click();

    assertThat(page.getByText("Create RecommendationRequest")).not().isVisible();
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }
}
