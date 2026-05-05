import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/menuItemReviewUtils";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));

describe("menuItemReviewUtils tests", () => {
  test("onDeleteSuccess calls toast and console.log", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    onDeleteSuccess("MenuItemReview deleted");
    expect(consoleSpy).toHaveBeenCalledWith("MenuItemReview deleted");
    expect(toast).toHaveBeenCalledWith("MenuItemReview deleted");
    consoleSpy.mockRestore();
  });

  test("cellToAxiosParamsDelete returns correct params", async () => {
    const cell = { row: { original: { id: 17 } } };
    const result = cellToAxiosParamsDelete(cell);
    expect(result).toEqual({
      url: "/api/menuitemreviews",
      method: "DELETE",
      params: { id: 17 },
    });
  });
});
