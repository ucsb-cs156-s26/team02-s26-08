package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemReviewRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewWebIT extends WebTestCase {

  @Autowired MenuItemReviewRepository menuItemReviewRepository;

  @Test
  public void admin_user_can_see_and_delete_menu_item_review() throws Exception {
    setupUser(true);

    MenuItemReview review =
        MenuItemReview.builder()
            .itemId(1L)
            .reviewerEmail("reviewer1@ucsb.edu")
            .stars(5)
            .dateReviewed(LocalDateTime.parse("2024-10-31T12:00:00"))
            .comments("Great food!")
            .build();

    menuItemReviewRepository.save(review);

    page.getByText("Menu Item Review").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments"))
        .hasText("Great food!");

    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_see_create_button() throws Exception {
    setupUser(false);

    page.getByText("Menu Item Review").click();

    assertThat(page.getByText("Create MenuItemReview")).not().isVisible();
  }

  @Test
  public void admin_user_can_see_create_button() throws Exception {
    setupUser(true);

    page.getByText("Menu Item Review").click();

    assertThat(page.getByText("Create MenuItemReview")).isVisible();
  }
}
