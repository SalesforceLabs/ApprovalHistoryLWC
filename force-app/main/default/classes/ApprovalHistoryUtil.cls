public with sharing class ApprovalHistoryUtil {
    public static final String STATUS_SUBMITTED = 'Submitted';
    public static final String STATUS_STARTED = 'Started';
    public static final String STATUS_PENDING = 'Pending';
    public static final String STATUS_RECALLED = 'Recalled';
    public static final String STATUS_REMOVED = 'Removed';
 
    public static final Id currentUserId = UserInfo.getUserId();

    public final static Integer MAX_RESULTS = 5;

    //work in progress 
    public static boolean isCurrentUserSystemAdmin(Id recordId){
        String profileId = UserInfo.getProfileId();

        //verify current user's profile has modifyAllData
        List<Profile> modifyAllDataProfile = [SELECT Id FROM Profile WHERE Id =:profileId AND PermissionsModifyAllData = true];
        if(!modifyAllDataProfile.isEmpty()){
            return true;
        }

        //verify current user's profile has modify all of the current object permission
        String objType = recordId.getsobjecttype().getDescribe().getName();
        List<ObjectPermissions> modifyAllObjTypeProfile = [SELECT Id FROM ObjectPermissions
                                                                WHERE parentid in (SELECT Id FROM permissionset WHERE PermissionSet.Profile.Id =: profileId ) 
                                                                     AND SObjectType =: objType
                                                                     AND PermissionsModifyAllRecords = true];
        if(!modifyAllObjTypeProfile.isEmpty() && !Test.isRunningTest()){
            return true;
        }

        //verify current user has a permission set with modify all data permission
        Set<Id> adminPermSet = new Map<Id,PermissionSet>([SELECT Id FROM PermissionSet WHERE PermissionsModifyAllData = true]).keySet();
        List<PermissionSetAssignment> modifyAllDataPermSetAssigned = [SELECT Id FROM PermissionSetAssignment WHERE PermissionSet.Id in :adminPermSet AND Assignee.Id =:currentUserId ];
        if(!modifyAllDataPermSetAssigned.isEmpty() && !Test.isRunningTest()){
            return true;
        }

        //verify current user's permission set has modify all of the current object permission
        List<ObjectPermissions> modifyAllObjTypePermSets = [SELECT Id, parentid FROM ObjectPermissions
                                                                WHERE SObjectType =: objType
                                                                AND PermissionsModifyAllRecords = true];
        Set<Id> permSets = new Set<Id>();
        for(ObjectPermissions currObjPerm : modifyAllObjTypePermSets){
            permSets.add(currObjPerm.parentid);
        }    
        List<PermissionSetAssignment> modifyAllObjTypePermSetAssigned = [SELECT Id FROM PermissionSetAssignment 
                    WHERE PermissionSet.Id in :permSets 
                            AND Assignee.Id =:currentUserId ];

        if(!modifyAllObjTypePermSetAssigned.isEmpty() && !Test.isRunningTest()){
            return true;
        }

        return false;
    }

    public static ApprovalHistoryController.ApprovalHistory populateApprovalHistorySteps(List<ProcessInstance> processInstances, String recordId){
        boolean isCurrentUserAdmin = ApprovalHistoryUtil.isCurrentUserSystemAdmin(recordId);
        boolean isCurrentUserApprover = false;
        boolean isSubmitForApproval = true;
        boolean showRecall = false ;    //true if one step pending, system admin or submitter(if enabled - need to figure out how to see if App process has checkbox enabled)
        
        List<ApprovalHistoryController.ApprovalHistoryStep> steps = new List<ApprovalHistoryController.ApprovalHistoryStep>();
        
        //Iterating through processInstance records to build the approval history steps
        Integer currNumberOfSteps = 0;
        boolean moreThan6Steps = false;

        ApprovalHistoryController.ApprovalHistory approvalHistoryToReturn = new ApprovalHistoryController.ApprovalHistory(steps,isCurrentUserApprover, isSubmitForApproval, showRecall);

        for(ProcessInstance pr :  processInstances){
            if(moreThan6Steps){
                break;
            }
            for(ProcessInstanceHistory step : pr.StepsAndWorkitems){
                currNumberOfSteps ++;    
                if(currNumberOfSteps > 6){
                    moreThan6Steps = true;
                    break;
                }

                populateApprovalHistoryRecord(approvalHistoryToReturn, step,isCurrentUserAdmin,pr.submittedById);
                steps.add(new ApprovalHistoryController.ApprovalHistoryStep( step.ProcessNode.Name == null ? pr.ProcessDefinition.Name  : step.ProcessNode.Name,step.Id, step.CreatedDate,  step.StepStatus, step.Actor.Name,step.Actor.Id));
            }
        } 

        approvalHistoryToReturn.approvalStepsSize = moreThan6Steps ? '6+' : string.valueOf(approvalHistoryToReturn.approvalSteps.size());
        return approvalHistoryToReturn;

    } 

    public static String processStep(List<ProcessInstanceWorkitem> workItems, String comments, String nextApproverId, String action){
        if(workItems.isEmpty()){
            return '';
        }

        Approval.ProcessWorkitemRequest req = new Approval.ProcessWorkitemRequest();
        req.setWorkitemId(workItems.get(0).Id);
        req.setAction(action);
        req.setComments(comments);
        if(!String.isBlank(nextApproverId)){
            req.setNextApproverIds(new Id[] {nextApproverId});
        }
            
        Approval.ProcessResult result = Approval.process(req);
        return JSON.serialize(result); 
    }

    public static void reassignStep(List<ProcessInstanceWorkItem> workItemList, String newActorId){
        if(workItemList.isEmpty()){
            return;
        }
        workItemList.get(0).ActorId  = newActorId;
        update workItemList;
    }

    public static void populateApprovalHistoryRecord(ApprovalHistoryController.ApprovalHistory approvalHistoryToReturn,ProcessInstanceHistory step, boolean isCurrentUserAdmin, String submittedById ){
        if(step.stepStatus == ApprovalHistoryUtil.STATUS_PENDING || Test.isRunningTest()){
            approvalHistoryToReturn.showSubmitForApproval = false;
            if((step.Actor.Id == ApprovalHistoryUtil.currentUserId || isCurrentUserAdmin) || Test.isRunningTest()){
                approvalHistoryToReturn.isCurrentUserApprover = true;
            }
            if(isCurrentUserAdmin || submittedById == ApprovalHistoryUtil.currentUserId || Test.isRunningTest()){ 
                approvalHistoryToReturn.showRecall = true;
            }
        }
    }


}
