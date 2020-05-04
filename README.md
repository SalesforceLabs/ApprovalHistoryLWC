# Approval History LWC
This repo contains a project that you can deploy to your org and use the `approvalHistory` LWC in Lightning Record Pages, and Lightning Apps.
This component has all the functionality of the standard Approval History related list, with the difference that you can use it in any app. 

If you want to use it in a Record Detail Page, you can use it by just dropping it into the page. 


If you want to use it in a Lightning App Page, you will need to use a wrapper component and utilize the component public properties: `recordId`, and `allowSubmitForApproval`. The `recordId` property represents that record whose approval history will be displayed. The `allowSubmitForApproval` property determines if the submit for approval button will show as an action. Also, there is public function `submitForApproval` that triggers the submit for approval action.

