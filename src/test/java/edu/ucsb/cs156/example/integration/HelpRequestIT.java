package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired HelpRequestRepository helpRequestRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_help_request() throws Exception {
    // arrange
    LocalDateTime requestTime = LocalDateTime.parse("2026-04-25T16:00:00");

    HelpRequest helpRequest =
        HelpRequest.builder()
            .id(1L)
            .requesterEmail("student1@ucsb.edu")
            .teamId("team01")
            .tableOrBreakoutRoom("4")
            .requestTime(requestTime)
            .explanation("Need help with Dokku")
            .solved(false)
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/HelpRequest/post")
                    .param("requesterEmail", "student1@ucsb.edu")
                    .param("teamId", "team01")
                    .param("tableOrBreakoutRoom", "4")
                    .param("requestTime", "2026-04-25T16:00:00")
                    .param("explanation", "Need help with Dokku")
                    .param("solved", "false")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(helpRequest);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);

    HelpRequest savedHelpRequest = helpRequestRepository.findById(1L).orElseThrow();
    assertEquals(helpRequest, savedHelpRequest);
  }
}
