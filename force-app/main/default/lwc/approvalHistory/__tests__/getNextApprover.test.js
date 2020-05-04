import { createElement } from "lwc";
import ApprovalHistory from "c/approvalHistory";
import { registerApexTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import getApprovalHistory from "@salesforce/apex/ApprovalHistoryController.getApprovalHistory";
import processStep from "@salesforce/apex/ApprovalHistoryController.processStep";
import { ShowToastEventName } from "lightning/platformShowToastEvent";
import searchUsers from "@salesforce/apex/ApprovalHistoryController.searchUsers";

import { modalStates } from "../approvalHistoryUtil.js";
const getApprovalHistAdapter = registerApexTestWireAdapter(getApprovalHistory);
const mockApproveReject = require("./data/approveReject.json");

let element;
// Mocking imperative Apex method call
jest.mock(
  "@salesforce/apex/ApprovalHistoryController.processStep",
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

const APPROVE_STEP_REJECT = {
  body: {
    pageErrors: [{ message: "missing required field: [nextApproverIds]" }]
  }
};
const PROCESS_STEP_SUCCESS = '{"success":true}';
const SEARCH_SUCCESS = [
  {
    id: "temppId",
    sObjectType: "sobjectType",
    icon: "icon",
    title: "title",
    subtitle: "subtitle"
  }
];

const SEARCH_ERROR = {
  body: { message: "An internal server error has occurred" },
  ok: false,
  status: 400,
  statusText: "Bad Request"
};

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
  });

  it("verifies get next approver success", () => {
    getApprovalHistAdapter.emit(mockApproveReject);
    // Mock handler for toast event
    const handler = jest.fn();
    // Add event listener to catch toast event
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const approveButton = element.shadowRoot.querySelector(
          '[data-id="Approve"]'
        );
        approveButton.click();
      })
      .then(() => {
        //create much for callback function
        processStep.mockRejectedValue(APPROVE_STEP_REJECT);
        searchUsers.mockResolvedValue(SEARCH_SUCCESS);

        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
        //check modal
      })
      .then(() => {
        expect(handler).not.toHaveBeenCalled();
      })
      .then(() => {})
      .then(() => {})
      .then(() => {
        const lookupCmp = element.shadowRoot.querySelector("c-lookup");
        expect(lookupCmp).not.toBeNull();
        lookupCmp.dispatchEvent(new CustomEvent("search"), {
          detail: { searchTerm: "temp" }
        });
        lookupCmp.selection = SEARCH_SUCCESS;
        processStep.mockResolvedValue(PROCESS_STEP_SUCCESS);

        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
      })
      .then(() => {
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe(
          modalStates.APPROVE.toastInfo.success.title
        );
        expect(handler.mock.calls[0][0].detail.message).toBe(
          modalStates.APPROVE.toastInfo.success.message
        );
        expect(handler.mock.calls[0][0].detail.variant).toBe(
          modalStates.APPROVE.toastInfo.success.variant
        );
      });
  });

  it("verifies get next approver error", () => {
    getApprovalHistAdapter.emit(mockApproveReject);
    // Mock handler for toast event
    const handler = jest.fn();
    // Add event listener to catch toast event
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const approveButton = element.shadowRoot.querySelector(
          '[data-id="Approve"]'
        );
        approveButton.click();
      })
      .then(() => {
        //create much for callback function
        processStep.mockRejectedValue(APPROVE_STEP_REJECT);
        searchUsers.mockRejectedValue(SEARCH_ERROR);

        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
        //check modal
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

        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
      })
      .then(() => {
        expect(handler).not.toHaveBeenCalled();
      });
  });
});
