import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/articlesUtils";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));

describe("articlesUtils tests", () => {
  test("onDeleteSuccess calls toast and console.log", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    onDeleteSuccess("Article deleted");

    expect(consoleSpy).toHaveBeenCalledWith("Article deleted");
    expect(toast).toHaveBeenCalledWith("Article deleted");

    consoleSpy.mockRestore();
  });

  test("cellToAxiosParamsDelete returns correct params", async () => {
    const cell = { row: { original: { id: 17 } } };

    const result = cellToAxiosParamsDelete(cell);

    expect(result).toEqual({
      url: "/api/Articles",
      method: "DELETE",
      params: { id: 17 },
    });
  });
});
