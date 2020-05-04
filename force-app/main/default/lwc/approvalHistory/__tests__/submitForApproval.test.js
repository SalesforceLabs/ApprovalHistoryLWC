import { createElement } from "lwc";
import ApprovalHistory from "c/approvalHistory";
import { registerApexTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import submitForApprovalApex from "@salesforce/apex/ApprovalHistoryController.submitForApproval";
import getApprovalHistory from "@salesforce/apex/ApprovalHistoryController.getApprovalHistory";
import { ShowToastEventName } from "lightning/platformShowToastEvent";
import searchUsers from "@salesforce/apex/ApprovalHistoryController.searchUsers";

import { modalStates } from "../approvalHistoryUtil.js";

const getApprovalHistAdapter = registerApexTestWireAdapter(getApprovalHistory);
const mockSubmitForApproval = require("./data/submitForApproval.json");
const PROCESS_STEP_SUCCESS = '{"success":true}';
const PROCESS_STEP_ERROR = '{"success":false}';
const SUBMIT_APPROVAL_REJECT = {
  body: {
    pageErrors: [{ message: "missing required field: [nextApproverIds]" }]
  }
};
const SEARCH_SUCCESS = [
  {
    id: "temppId",
    sObjectType: "sobjectType",
    icon: "icon",
    title: "title",
    subtitle: "subtitle"
  }
];
const SUBMIT_FOR_APPROVAL_ERROR = {
  body: { pageErrors: [{ message: "Error submitting for approval." }] }
};

let element;
// Mocking imperative Apex method call
jest.mock(
  "@salesforce/apex/ApprovalHistoryController.submitForApproval",
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);

jest.mock(
  "@salesforce/apex/ApprovalHistoryController.searchUsers",
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);

describe("handler functions", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });
  beforeEach(() => {
    element = createElement("c-approval-history", {
      is: ApprovalHistory
    });
    document.body.appendChild(element);
    element.allowSubmitForApproval = true;

  });

  it("verifies submit for approval success", () => {
    getApprovalHistAdapter.emit(mockSubmitForApproval);

    const handler = jest.fn();
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const submitForApprovalButton = element.shadowRoot.querySelector(
          '[data-id="SubmitForApproval"]'
        );
        submitForApprovalButton.click();
      })
      .then(() => {
        submitForApprovalApex.mockResolvedValue(PROCESS_STEP_SUCCESS);
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
      })
      .then(() => {
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe(
          modalStates.SUBMIT_APPROVAL.toastInfo.success.title
        );
        expect(handler.mock.calls[0][0].detail.message).toBe(
          modalStates.SUBMIT_APPROVAL.toastInfo.success.message
        );
        expect(handler.mock.calls[0][0].detail.variant).toBe(
          modalStates.SUBMIT_APPROVAL.toastInfo.success.variant
        );
      });
  });

  it("verifies submit for approval with notSuccess", () => {
    getApprovalHistAdapter.emit(mockSubmitForApproval);

    const handler = jest.fn();
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const submitForApprovalButton = element.shadowRoot.querySelector(
          '[data-id="SubmitForApproval"]'
        );
        submitForApprovalButton.click();
      })
      .then(() => {
        submitForApprovalApex.mockResolvedValue(PROCESS_STEP_ERROR);
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
      })
      .then(() => {
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe(
          modalStates.SUBMIT_APPROVAL.toastInfo.error.title
        );
        expect(handler.mock.calls[0][0].detail.message).toBe(
          modalStates.SUBMIT_APPROVAL.toastInfo.error.message
        );
        expect(handler.mock.calls[0][0].detail.variant).toBe(
          modalStates.SUBMIT_APPROVAL.toastInfo.error.variant
        );
      });
  });

  it("verifies submit for approval and get next approver", () => {
    getApprovalHistAdapter.emit(mockSubmitForApproval);

    const handler = jest.fn();
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const submitForApprovalButton = element.shadowRoot.querySelector(
          '[data-id="SubmitForApproval"]'
        );
        submitForApprovalButton.click();
      })
      .then(() => {
        submitForApprovalApex.mockRejectedValue(SUBMIT_APPROVAL_REJECT);
        searchUsers.mockResolvedValue(SEARCH_SUCCESS);

        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
      })
      .then(() => {
        expect(handler).not.toHaveBeenCalled();
      })
      .then(() => {})
      .then(() => {
        const lookupCmp = element.shadowRoot.querySelector("c-lookup");
        expect(lookupCmp).not.toBeNull();
        lookupCmp.dispatchEvent(new CustomEvent("search"), {
          detail: { searchTerm: "temp" }
        });
        lookupCmp.selection = SEARCH_SUCCESS;
        submitForApprovalApex.mockResolvedValue(PROCESS_STEP_SUCCESS);

        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
      })
      .then(() => {
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe(
          modalStates.SUBMIT_APPROVAL.toastInfo.success.title
        );
        expect(handler.mock.calls[0][0].detail.message).toBe(
          modalStates.SUBMIT_APPROVAL.toastInfo.success.message
        );
        expect(handler.mock.calls[0][0].detail.variant).toBe(
          modalStates.SUBMIT_APPROVAL.toastInfo.success.variant
        );
      });
  });

  it("verifies submit for approval error", () => {
    getApprovalHistAdapter.emit(mockSubmitForApproval);

    const handler = jest.fn();
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const submitForApprovalButton = element.shadowRoot.querySelector(
          '[data-id="SubmitForApproval"]'
        );
        submitForApprovalButton.click();
      })
      .then(() => {
        submitForApprovalApex.mockRejectedValue(SUBMIT_FOR_APPROVAL_ERROR);
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
      })
      .then(() => {})
      .then(() => {
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe(
          modalStates.SUBMIT_APPROVAL.toastInfo.error.title
        );
        expect(handler.mock.calls[0][0].detail.message).toBe(
          SUBMIT_FOR_APPROVAL_ERROR.body.pageErrors[0].message
        );
        expect(handler.mock.calls[0][0].detail.variant).toBe(
          modalStates.SUBMIT_APPROVAL.toastInfo.error.variant
        );
      });
  });
});
