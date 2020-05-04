import { createElement } from "lwc";
import ApprovalHistory from "c/approvalHistory";
import { registerApexTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import getApprovalHistory from "@salesforce/apex/ApprovalHistoryController.getApprovalHistory";

const getApprovalHistAdapter = registerApexTestWireAdapter(getApprovalHistory);
const mockApprovalHistoryOneRecord = require("./data/approvalHistoryOneRecord.json");
const mockApprovalHistoryManyRecords = require("./data/approvalHistoryManyRecords.json");
const mockRecall = require("./data/recall.json");
const mockApproveReject = require("./data/approveReject.json");
const mockSubmitForApproval = require("./data/submitForApproval.json");

let element;

function validateButtons(
  element,
  recall,
  approve,
  reject,
  reassign,
  submitForApproval
) {
  const recallButton = element.shadowRoot.querySelector('[data-id="Recall"]');
  const approveButton = element.shadowRoot.querySelector('[data-id="Approve"]');
  const rejectButton = element.shadowRoot.querySelector('[data-id="Reject"]');
  const reassignButton = element.shadowRoot.querySelector(
    '[data-id="Reassign"]'
  );
  const submitForApprovalButton = element.shadowRoot.querySelector(
    '[data-id="SubmitForApproval"]'
  );

  expect(submitForApprovalButton !== null).toBe(submitForApproval);
  expect(recallButton !== null).toBe(recall);
  expect(approveButton !== null).toBe(approve);
  expect(rejectButton !== null).toBe(reject);
  expect(reassignButton !== null).toBe(reassign);
}

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

  it("verifies wire success with one record", () => {
    getApprovalHistAdapter.emit(mockApprovalHistoryOneRecord);
    return Promise.resolve().then(() => {
      const datatable = element.shadowRoot.querySelector("lightning-datatable");
      expect(datatable).not.toBe(null);
    });
  });

  it("verifies wire success with more than one record", () => {
    getApprovalHistAdapter.emit(mockApprovalHistoryManyRecords);
    return Promise.resolve().then(() => {
      const datatable = element.shadowRoot.querySelector("lightning-datatable");
      expect(datatable).not.toBe(null);
    });
  });

  it("verifies wire error", () => {
    getApprovalHistAdapter.error();

    return Promise.resolve().then(() => {
      const datatable = element.shadowRoot.querySelector("lightning-datatable");
      expect(datatable).toBe(null);
    });
  });

  it("verifies buttons when user is current approver", () => {
    getApprovalHistAdapter.emit(mockApproveReject);
    return Promise.resolve().then(() => {
      validateButtons(element, false, true, true, true, false);
    });
  });

  it("verifies buttons when user is submitter or admin", () => {
    getApprovalHistAdapter.emit(mockRecall);
    return Promise.resolve().then(() => {
      validateButtons(element, true, false, false, false, false);
    });
  });

  it("verifies buttons when submit for approval", () => {
    getApprovalHistAdapter.emit(mockSubmitForApproval);
    return Promise.resolve().then(() => {
      validateButtons(element, false, false, false, false, true);
    });
  });
});
