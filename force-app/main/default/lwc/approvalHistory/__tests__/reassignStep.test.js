import { createElement } from "lwc";
import ApprovalHistory from "c/approvalHistory";
import { registerApexTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import getApprovalHistory from "@salesforce/apex/ApprovalHistoryController.getApprovalHistory";
import { ShowToastEventName } from "lightning/platformShowToastEvent";
import reassignStep from "@salesforce/apex/ApprovalHistoryController.reassignStep";

import { modalStates } from "../approvalHistoryUtil.js";
const mockApproveReject = require("./data/approveReject.json");
const getApprovalHistAdapter = registerApexTestWireAdapter(getApprovalHistory);

let element;
const PROCESS_STEP_SUCCESS = '{"success":true}';
const PROCESS_STEP_REJECT = {
  body: { pageErrors: [{ message: "Error reassigning step." }] }
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
// Mocking imperative Apex method call
jest.mock(
  "@salesforce/apex/ApprovalHistoryController.reassignStep",
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
  });

  it("verifies clicking reassign with success", () => {
    getApprovalHistAdapter.emit(mockApproveReject);

    // Mock handler for toast event
    const handler = jest.fn();
    // Add event listener to catch toast event
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const approveButton = element.shadowRoot.querySelector(
          '[data-id="Reassign"]'
        );
        approveButton.click();
      })
      .then(() => {
        //create much for callback function
        const lookupCmp = element.shadowRoot.querySelector("c-lookup");
        expect(lookupCmp).not.toBeNull();
        lookupCmp.dispatchEvent(new CustomEvent("search"), {
          detail: { searchTerm: "temp" }
        });
        lookupCmp.selection = SEARCH_SUCCESS;

        //create much for callback function
        reassignStep.mockResolvedValue(PROCESS_STEP_SUCCESS);
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
        //check modal
      })
      .then(() => {
        //expect(processStep.mock.calls[0][0]).toEqual();
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe(
          modalStates.REASSIGN.toastInfo.success.title
        );
        expect(handler.mock.calls[0][0].detail.message).toBe(
          modalStates.REASSIGN.toastInfo.success.message
        );
        expect(handler.mock.calls[0][0].detail.variant).toBe(
          modalStates.REASSIGN.toastInfo.success.variant
        );
      });
  });

  it("verifies clicking reassign with error", () => {
    getApprovalHistAdapter.emit(mockApproveReject);

    // Mock handler for toast event
    const handler = jest.fn();
    // Add event listener to catch toast event
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const approveButton = element.shadowRoot.querySelector(
          '[data-id="Reassign"]'
        );
        approveButton.click();
      })
      .then(() => {
        //create much for callback function
        const lookupCmp = element.shadowRoot.querySelector("c-lookup");
        expect(lookupCmp).not.toBeNull();
        lookupCmp.dispatchEvent(new CustomEvent("search"), {
          detail: { searchTerm: "temp" }
        });
        lookupCmp.selection = SEARCH_SUCCESS;

        //create much for callback function
        reassignStep.mockRejectedValue(PROCESS_STEP_REJECT);
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
        //check modal
      })
      .then(() => {})
      .then(() => {
        //expect(processStep.mock.calls[0][0]).toEqual();
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe(
          modalStates.REASSIGN.toastInfo.error.title
        );
        expect(handler.mock.calls[0][0].detail.message).toBe(
          modalStates.REASSIGN.toastInfo.error.message
        );
        expect(handler.mock.calls[0][0].detail.variant).toBe(
          modalStates.REASSIGN.toastInfo.error.variant
        );
      });
  });
});
