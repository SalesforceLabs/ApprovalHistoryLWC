@isTest
private class ApprovalHistoryUtilTest {
    @testSetup static void methodName() {
        Account newAccount = new Account(Name = 'Test Account');
        insert newAccount;
    }
    @isTest static void isCurrentUserIdTest_SystemAdmin(){
        List<User> users = [select Id, FirstName, LastName FROM User WHERE Profile.Name = 'System Administrator' LIMIT 1];
        List<Account> accounts = [SELECT Id FROM Account LIMIT 1];
        System.runAs(users.get(0)){
            boolean isAdmin = ApprovalHistoryUtil.isCurrentUserSystemAdmin(accounts.get(0).Id);
            System.assertEquals(true, isAdmin, 'The user was supposed to be found admin');
        }
       
    }

    @isTest static void isCurrentUserIdTest_NOT_SystemAdmin(){
        List<User> users = [select Id, FirstName, LastName FROM User WHERE Profile.Name != 'System Administrator' LIMIT 1];
        List<Account> accounts = [SELECT Id FROM Account LIMIT 1];
        System.runAs(users.get(0)){
            boolean isAdmin = ApprovalHistoryUtil.isCurrentUserSystemAdmin(accounts.get(0).Id);
            System.assertEquals(false, isAdmin, 'The user was not supposed to be found admin');
        }
       
    }

    @isTest static void processStepTest_EmptyWorkItems(){
        List<User> users = [select Id, FirstName, LastName FROM User WHERE Profile.Name != 'System Administrator' LIMIT 1];
        List<Account> accounts = [SELECT Id FROM Account LIMIT 1];
        List<ProcessInstanceWorkitem> workItems = new List<ProcessInstanceWorkitem>();
        String retVal = ApprovalHistoryUtil.processStep( workItems, 'comments',users.get(0).Id, accounts.get(0).Id);

    }
    
    @isTest static void processStepTest_NotEmptyWorkItems(){
        List<User> users = [select Id, FirstName, LastName FROM User WHERE Profile.Name != 'System Administrator' LIMIT 1];
        List<Account> accounts = [SELECT Id FROM Account LIMIT 1];
        List<ProcessInstanceWorkitem> workItems = new List<ProcessInstanceWorkitem>();
        workItems.add(new ProcessInstanceWorkitem(Id = '04i3h000001L5fGAAS'));
        try{
            String retVal = ApprovalHistoryUtil.processStep( workItems, 'comments',users.get(0).Id, accounts.get(0).Id);
        }catch(Exception e){

        }
    }

    @isTest static void reassignStepTest(){
        List<User> users = [SELECT Id, FirstName, LastName FROM User LIMIT 1];
        List<ProcessInstanceWorkitem> workItems = new List<ProcessInstanceWorkitem>();
        workItems.add(new ProcessInstanceWorkitem(Id = '04i3h000001L5fGAAS'));
        try{
            ApprovalHistoryUtil.reassignStep(workItems, users.get(0).Id);
        }catch(Exception e){
        }
    }

    @isTest static void populateApprovalHistoryTest(){
        List<Account> accounts = [SELECT Id FROM Account LIMIT 1];

        List<ProcessInstance> processInstances = new List<ProcessInstance> ();
        ApprovalHistoryController.ApprovalHistory retVal = ApprovalHistoryUtil.populateApprovalHistorySteps(processInstances, accounts.get(0).Id);

    }

    @isTest static void populateApprovalHistoryRecord(){
        List<User> users = [SELECT Id, FirstName, LastName FROM User LIMIT 1];
        List<ApprovalHistoryController.ApprovalHistoryStep> approvalSteps = new List<ApprovalHistoryController.ApprovalHistoryStep>();
        approvalSteps.add(new ApprovalHistoryController.ApprovalHistoryStep( 'stepName','stepId', DateTime.now(),'stepStatus', 'assignedTo', 'assignedToId', 'Comments'));
        ApprovalHistoryController.ApprovalHistory approvalHistoryToReturn = new ApprovalHistoryController.ApprovalHistory( approvalSteps,  false, true, true);
        ProcessInstanceHistory step = new ProcessInstanceHistory();
        ApprovalHistoryUtil.populateApprovalHistoryRecord(approvalHistoryToReturn, step,  true, users.get(0).Id );
        System.assertEquals(true, approvalHistoryToReturn.showRecall, 'The recall attribute is supposed to be true');
        System.assertEquals(true, approvalHistoryToReturn.isCurrentUserApprover, 'The isCurrentUserApprover attribute is supposed to be true');
        System.assertEquals(false, approvalHistoryToReturn.showSubmitForApproval, 'The showSubmitForApproval attribute is supposed to be false');
        
    }


}
