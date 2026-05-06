import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Navigate, useParams } from "react-router";
import ArticlesForm from "main/components/Articles/ArticlesForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function ArticlesEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: article,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/Articles?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/Articles`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (articleData) => ({
    url: "/api/Articles",
    method: "PUT",
    params: {
      id: articleData.id,
    },
    data: {
      title: articleData.title,
      url: articleData.url,
      explanation: articleData.explanation,
      email: articleData.email,
      dateAdded: articleData.dateAdded,
    },
  });

  const onSuccess = (updatedArticle) => {
    toast(
      `Article Updated - id: ${updatedArticle.id} title: ${updatedArticle.title}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/Articles?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/articles" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Article</h1>
        {article && (
          <ArticlesForm
            initialContents={article}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
