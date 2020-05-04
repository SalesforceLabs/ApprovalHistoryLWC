import { createElement } from "lwc";
import ApprovalHistory from "c/approvalHistory";
import { registerApexTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import getApprovalHistory from "@salesforce/apex/ApprovalHistoryController.getApprovalHistory";
import processStep from "@salesforce/apex/ApprovalHistoryController.processStep";
import { ShowToastEventName } from "lightning/platformShowToastEvent";

import { modalStates } from "../approvalHistoryUtil.js";

const getApprovalHistAdapter = registerApexTestWireAdapter(getApprovalHistory);
const mockApproveReject = require("./data/approveReject.json");
const mockRecall = require("./data/recall.json");

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

const PROCESS_STEP_SUCCESS = '{"success":true}';
const PROCESS_STEP_ERROR = '{"success":false}';
const PROCESS_STEP_REJECT = {
  body: { pageErrors: [{ message: "Error declining step." }] }
};
const APPROVE_STEP_REJECT = {
  body: {
    pageErrors: [{ message: "missing required field: [nextApproverIds]" }]
  }
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

  it("verifies clicking approve with success", () => {
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
        processStep.mockResolvedValue(PROCESS_STEP_SUCCESS);
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
        //check modal
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
  it("verifies clicking approve with notSuccess", () => {
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
        processStep.mockResolvedValue(PROCESS_STEP_ERROR);
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
        //check modal
      })
      .then(() => {
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe(
          modalStates.APPROVE.toastInfo.error.title
        );
        expect(handler.mock.calls[0][0].detail.message).toBe(
          modalStates.APPROVE.toastInfo.error.message
        );
        expect(handler.mock.calls[0][0].detail.variant).toBe(
          modalStates.APPROVE.toastInfo.error.variant
        );
      });
  });

  it("verifies clicking approve with error", () => {
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
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
        //check modal
      })
      .then(() => {
        expect(handler).not.toHaveBeenCalled();
      });
  });
  it("verifies clicking reject with success", () => {
    getApprovalHistAdapter.emit(mockApproveReject);

    // Mock handler for toast event
    const handler = jest.fn();
    // Add event listener to catch toast event
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const approveButton = element.shadowRoot.querySelector(
          '[data-id="Reject"]'
        );
        approveButton.click();
      })
      .then(() => {
        //create much for callback function
        processStep.mockResolvedValue(PROCESS_STEP_SUCCESS);
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
          modalStates.REJECT.toastInfo.success.title
        );
        expect(handler.mock.calls[0][0].detail.message).toBe(
          modalStates.REJECT.toastInfo.success.message
        );
        expect(handler.mock.calls[0][0].detail.variant).toBe(
          modalStates.REJECT.toastInfo.success.variant
        );
      });
  });
  it("verifies clicking reject with notSuccess", () => {
    getApprovalHistAdapter.emit(mockApproveReject);

    // Mock handler for toast event
    const handler = jest.fn();
    // Add event listener to catch toast event
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const approveButton = element.shadowRoot.querySelector(
          '[data-id="Reject"]'
        );
        approveButton.click();
      })
      .then(() => {
        //create much for callback function
        processStep.mockResolvedValue(PROCESS_STEP_ERROR);
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
        //check modal
      })
      .then(() => {
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe(
          modalStates.REJECT.toastInfo.error.title
        );
        expect(handler.mock.calls[0][0].detail.message).toBe(
          modalStates.REJECT.toastInfo.error.message
        );
        expect(handler.mock.calls[0][0].detail.variant).toBe(
          modalStates.REJECT.toastInfo.error.variant
        );
      });
  });
  it("verifies clicking reject with error", () => {
    getApprovalHistAdapter.emit(mockApproveReject);

    // Mock handler for toast event
    const handler = jest.fn();
    // Add event listener to catch toast event
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const approveButton = element.shadowRoot.querySelector(
          '[data-id="Reject"]'
        );
        approveButton.click();
      })
      .then(() => {
        //create much for callback function
        processStep.mockRejectedValue(PROCESS_STEP_REJECT);
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
        //check modal
      })
      .then(() => {})
      .then(() => {
        expect(handler).toHaveBeenCalled();
      });
  });

  it("verifies clicking recall with success", () => {
    getApprovalHistAdapter.emit(mockRecall);

    // Mock handler for toast event
    const handler = jest.fn();
    // Add event listener to catch toast event
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const approveButton = element.shadowRoot.querySelector(
          '[data-id="Recall"]'
        );
        approveButton.click();
      })
      .then(() => {
        //create much for callback function
        processStep.mockResolvedValue(PROCESS_STEP_SUCCESS);
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
          modalStates.RECALL.toastInfo.success.title
        );
        expect(handler.mock.calls[0][0].detail.message).toBe(
          modalStates.RECALL.toastInfo.success.message
        );
        expect(handler.mock.calls[0][0].detail.variant).toBe(
          modalStates.RECALL.toastInfo.success.variant
        );
      });
  });
  it("verifies clicking recall with notSuccess", () => {
    getApprovalHistAdapter.emit(mockRecall);

    // Mock handler for toast event
    const handler = jest.fn();
    // Add event listener to catch toast event
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const approveButton = element.shadowRoot.querySelector(
          '[data-id="Recall"]'
        );
        approveButton.click();
      })
      .then(() => {
        //create much for callback function
        processStep.mockResolvedValue(PROCESS_STEP_ERROR);
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
        //check modal
      })
      .then(() => {
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe(
          modalStates.RECALL.toastInfo.error.title
        );
        expect(handler.mock.calls[0][0].detail.message).toBe(
          modalStates.RECALL.toastInfo.error.message
        );
        expect(handler.mock.calls[0][0].detail.variant).toBe(
          modalStates.RECALL.toastInfo.error.variant
        );
      });
  });
  it("verifies clicking recall with error", () => {
    getApprovalHistAdapter.emit(mockRecall);

    // Mock handler for toast event
    const handler = jest.fn();
    // Add event listener to catch toast event
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const approveButton = element.shadowRoot.querySelector(
          '[data-id="Recall"]'
        );
        approveButton.click();
      })
      .then(() => {
        //create much for callback function
        processStep.mockRejectedValue(PROCESS_STEP_REJECT);
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Submit"]'
        );
        submitButton.click();
        //check modal
      })
      .then(() => {})
      .then(() => {
        expect(handler).toHaveBeenCalled();
      });
  });

  it("verifies canceling the modal", () => {
    getApprovalHistAdapter.emit(mockRecall);

    // Mock handler for toast event
    const handler = jest.fn();
    // Add event listener to catch toast event
    element.addEventListener(ShowToastEventName, handler);

    return Promise.resolve()
      .then(() => {
        const approveButton = element.shadowRoot.querySelector(
          '[data-id="Recall"]'
        );
        approveButton.click();
      })
      .then(() => {
        //create much for callback function
        processStep.mockRejectedValue(PROCESS_STEP_REJECT);
        const submitButton = element.shadowRoot.querySelector(
          '[data-id="Cancel"]'
        );
        submitButton.click();
        //check modal
      });
  });
});
