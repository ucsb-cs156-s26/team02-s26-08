import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import RecommendationRequestForm from "main/components/RecommendationRequests/RecommendationRequestForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RecommendationRequestsEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: recommendationRequests,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/recommendationrequests?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/recommendationrequests`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (recommendationrequests) => ({
    url: "/api/recommendationrequests",
    method: "PUT",
    params: {
      id: recommendationrequests.id,
    },
    data: {
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
      `RecommendationRequest Updated - id: ${recommendationrequests.id} requesterEmail: ${recommendationrequests.requesterEmail}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/recommendationrequests?id=${id}`],
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
        <h1>Edit RecommendationRequests</h1>
        {recommendationRequests && (
          <RecommendationRequestForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={recommendationRequests}
          />
        )}
      </div>
    </BasicLayout>
  );
}
