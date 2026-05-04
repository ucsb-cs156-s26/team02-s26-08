import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestForm from "main/components/RecommendationRequests/RecommendationRequestForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RecommendationRequestsCreatePage({
  storybook = false,
}) {
  const objectToAxiosParams = (recommendationrequests) => ({
    url: "/api/recommendationrequests/post",
    method: "POST",
    params: {
      requesterEmail: recommendationrequests.requesterEmail,
      professorEmail: recommendationrequests.professorEmail,
      explanation: recommendationrequests.explanation,
      dateRequested: recommendationrequests.dateRequested,
      dateNeeded: recommendationrequests.dateNeeded,
      done: recommendationrequests.done,
    },
  });

  const onSuccess = (recommendationrequests) => {
    toast(
      `New RecommendationRequest Created - id: ${recommendationrequests.id} requesterEmail: ${recommendationrequests.requesterEmail}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/recommendationrequests/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/recommendationrequests" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New RecommendationRequest</h1>
        <RecommendationRequestForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
