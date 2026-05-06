import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function UCSBOrganizationForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "UCSBOrganizationForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="orgCode">Org Code</Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-orgCode"}
              id="orgCode"
              type="text"
              isInvalid={!initialContents && Boolean(errors.orgCode)}
              {...register("orgCode", {
                required: !initialContents && "Org Code is required.",
              })}
              disabled={Boolean(initialContents)}
            />
            {!initialContents && (
              <Form.Control.Feedback type="invalid">
                {errors.orgCode?.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="orgTranslationShort">
              Organization Translation Short
            </Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-orgTranslationShort"}
              id="orgTranslationShort"
              type="text"
              isInvalid={Boolean(errors.orgTranslationShort)}
              {...register("orgTranslationShort", {
                required: "Organization Translation Short is required.",
                maxLength: {
                  value: 50,
                  message: "Max length 50 characters",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.orgTranslationShort?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="orgTranslation">
              Organization Translation
            </Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-orgTranslation"}
              id="orgTranslation"
              type="text"
              isInvalid={Boolean(errors.orgTranslation)}
              {...register("orgTranslation", {
                required: "Organization Translation is required.",
                maxLength: {
                  value: 100,
                  message: "Max length 100 characters",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.orgTranslation?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="inactive">Inactive</Form.Label>
            <Form.Check
              data-testid={testIdPrefix + "-inactive"}
              id="inactive"
              type="checkbox"
              {...register("inactive")}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid={testIdPrefix + "-submit"}>
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid={testIdPrefix + "-cancel"}
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default UCSBOrganizationForm;
