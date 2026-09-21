import {
  useLoadingStore,
} from "../ui/stores/useLoadingStore";

export const createLoadingScreen =
  () => {
    return {
      displayLoadingUI() {
        useLoadingStore
          .getState()
          .show();
      },

      hideLoadingUI() {
        useLoadingStore
          .getState()
          .hide();
      },

      loadingUIText:
        "",

      loadingUIBackgroundColor:
        "black",
    };
  };