const COMMENT_DATA_FIELD = "comment";
const USER_REQUIRED_ERROR_MESSAGE = "You must select a user before submitting.";

//constant used to store the toast error information if there is an error
//querying the approval history
const queryError = {
  title: "Error!",
  message:
    "There was an error while fetching the Approval History. Please contact your System Administrator.",
  variant: "error"
};

//stores every possible modal state with all properties associated to each state
//this stores the success/error toast message information, the Modal titles, and the submit buttons
export const modalStates = {
  SUBMIT_APPROVAL: {
    state: "SUBMIT_APPROVAL",
    title: "Submit for Approval",
    submitLabel: "Submit",
    toastInfo: {
      success: {
        label: "success",
        title: "Success!",
        message: "Approval Process submitted.",
        variant: "success"
      },
      error: {
        label: "error",
        title: "Error!",
        message:
          "There was an error while submitting the Approval Process. Please contact your System Administrator.",
        variant: "error"
      }
    }
  },
  GET_NEXT_APPROVER_SUBMIT: {
    state: "GET_NEXT_APPROVER_SUBMIT",
    title: "Submit for Approval",
    submitLabel: "Submit",
    lookupLabel: "Choose Next Approver",
    toastInfo: {
      success: {
        label: "success",
        title: "Success!",
        message: "Approval Process submitted.",
        variant: "success"
      },
      error: {
        label: "error",
        title: "Error!",
        message:
          "There was an error while submitting the Approval Process. Please contact your System Administrator.",
        variant: "error"
      }
    }
  },
  APPROVE: {
    state: "APPROVE",
    title: "Approve",
    submitLabel: "Approve",
    action: "Approve",
    toastInfo: {
      success: {
        label: "success",
        title: "Success!",
        message: "The step was approved successfully.",
        variant: "success"
      },
      error: {
        label: "error",
        title: "Error!",
        message:
          "There was an error while approving the step. Please contact your System Administrator.",
        variant: "error"
      }
    }
  }, //want to get sobject type like Approve Account
  GET_NEXT_APPROVER_APPROVE: {
    state: "GET_NEXT_APPROVER_APPROVE",
    title: "Approve",
    submitLabel: "Approve",
    lookupLabel: "Choose Next Approver",
    toastInfo: {
      success: {
        label: "success",
        title: "Success!",
        message: "The step was approved successfully.",
        variant: "success"
      },
      error: {
        label: "error",
        title: "Error!",
        message:
          "There was an error while approving the step. Please contact your System Administrator.",
        variant: "error"
      }
    }
  }, //want to get sobject type like Approve Account
  REJECT: {
    state: "REJECT",
    title: "Reject",
    submitLabel: "Reject",
    action: "Reject",
    toastInfo: {
      success: {
        label: "success",
        title: "Success!",
        message: "The step was rejected successfully.",
        variant: "success"
      },
      error: {
        label: "error",
        title: "Error!",
        message:
          "There was an error while rejecting the step. Please contact your System Administrator.",
        variant: "error"
      }
    }
  }, //want to get sobject type like Reject Account
  RECALL: {
    state: "RECALL",
    title: "Recall Approval Request",
    submitLabel: "Recall",
    action: "Removed",
    toastInfo: {
      success: {
        label: "success",
        title: "Success!",
        message: "The step was recalled successfully.",
        variant: "success"
      },
      error: {
        label: "error",
        title: "Error!",
        message:
          "There was an error while recalling the step. Please contact your System Administrator.",
        variant: "error"
      }
    }
  }, //want to get sobject type like Reject Account
  REASSIGN: {
    state: "REASSIGN",
    title: "Reassign Approval Request",
    submitLabel: "Reassign",
    lookupLabel: "Reassign To",
    toastInfo: {
      success: {
        label: "success",
        title: "Success!",
        message: "Approval process step was reassigned.",
        variant: "success"
      },
      error: {
        label: "error",
        title: "Error!",
        message:
          "There was an error while reassigning the approval process step. Please contact your System Administrator.",
        variant: "error"
      }
    }
  } //want to get sobject type like Reject Account
};

//error message that indicates the next approver is missing
const MISSING_NEXT_APPROVER_ERROR = "missing required field: [nextApproverIds]";

//function called after error message from an imperative method,
//to verify if a next approver is needed
export function verifyIfNextApproverWasNeeded(errors) {
  const missingNextApprover = error =>
    error.message === MISSING_NEXT_APPROVER_ERROR;
  return errors.some(missingNextApprover);
}

//modal helper functions
export function hideModal(self) {
  let modalToHide = self.template.querySelector("c-modal");
  modalToHide.hide();
}

export function showModal(self) {
  let modalToShow = self.template.querySelector("c-modal");
  modalToShow.show();
}
//end modal helper functions

export function getCommentPropertyFromModal(self) {
  return self.template.querySelector(`[data-id="${COMMENT_DATA_FIELD}"]`).value;
}

export function showGetNextApproverModal(self, newState) {
  self.currentModalState = newState;
  showModal(self);
}

//if a user was not selected in the lookup 
//populate the error message
export function validateUserLookup(self) {
  const selection = self.template.querySelector("c-lookup").getSelection();
  if (selection.length === 0) {
    self.lookupErrors = [{ message: USER_REQUIRED_ERROR_MESSAGE }];
    return false;
  }
  self.lookupErrors = [];
  return true;
  
}
//populates the selected user property based on the selected
//user in the lookup component
export function setSelectedUser(self) {
  self.selectedUser = self.template
    .querySelector("c-lookup")
    .getSelection()[0].id;
}

export function clearModalState(self) {
  self.currentModalState = "";
  self.selectedUser = "";
  self.lookupErrors = [];
  self.modalComment = "";
  self.initialSelection = [];
}

//displays a toast based on the current modal state and on the status=success/error
export function displayToast(self, ShowToastEvent, status, messageOverride) {
  const event = new ShowToastEvent({
    title: modalStates[self.currentModalState].toastInfo[status].title,
    message: messageOverride
      ? messageOverride
      : modalStates[self.currentModalState].toastInfo[status].message,
    variant: modalStates[self.currentModalState].toastInfo[status].variant
  });
  self.dispatchEvent(event);
}

export function displayToastErrorQuery(self, ShowToastEvent) {
  const event = new ShowToastEvent({
    title: queryError.title,
    message: queryError.message,
    variant: queryError.variant
  });
  self.dispatchEvent(event);
}

export function extractErrorMessage(errors) {
  let errorMessage = "";
  errors.forEach(element => {
    errorMessage += element.message;
  });
  return errorMessage;
}
