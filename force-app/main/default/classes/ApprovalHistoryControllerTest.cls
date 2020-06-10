@isTest
private class ApprovalHistoryControllerTest {
    
    @testSetup static void methodName() {
        Account newAccount = new Account(Name = 'Test Account');
        insert newAccount;
    }
    
    @isTest static void searchUsersEmptyListTest(){
        List<LookupSearchResult> result = ApprovalHistoryController.searchUsers(null);
        System.assertEquals(0,result.size());
    }

    @isTest static void searchUsersNotEmptyListTest(){
        List<User> users = [SELECT Id, FirstName, LastName FROM User LIMIT 1];
        Id [] fixedSearchResults= new Id[1];
        fixedSearchResults[0] = users.get(0).Id;
        Test.setFixedSearchResults(fixedSearchResults);
        List<LookupSearchResult> result = ApprovalHistoryController.searchUsers(users.get(0).LastName);
        System.assertNotEquals(0,result.size());
    }

    @isTest static void submitForApprovalNoNextApproverTest(){
        List<Account> accounts = [SELECT Id FROM Account LIMIT 1];
        try{
            ApprovalHistoryController.submitForApproval(accounts.get(0).Id, 'string comments', '');
        }catch(Exception e){
        }
    }

    @isTest static void submitForApprovalWithNextApproverTest(){
        List<User> users = [SELECT Id, FirstName, LastName FROM User LIMIT 1];
        List<Account> accounts = [SELECT Id FROM Account LIMIT 1];
        try{
            ApprovalHistoryController.submitForApproval(accounts.get(0).Id, 'string comments', users.get(0).Id);
        }catch(Exception e){
        }
    }

    @isTest static void getApprovalHistoryTest(){
        List<Account> accounts = [SELECT Id FROM Account LIMIT 1];
        ApprovalHistoryController.getApprovalHistory(accounts.get(0).Id);
    }

    @isTest static void processStepTest(){
        List<User> users = [select Id, FirstName, LastName FROM User LIMIT 1];
        List<Account> accounts = [SELECT Id FROM Account LIMIT 1];

        ApprovalHistoryController.processStep(accounts.get(0).Id, 'comments', null, 'approve');

    } 

    @isTest static void reassignStepTest(){
        try{
            List<User> users = [SELECT Id, FirstName, LastName FROM User LIMIT 1];
            List<Account> accounts = [SELECT Id FROM Account LIMIT 1];
            ApprovalHistoryController.reassignStep(accounts.get(0).Id,users.get(0).Id );
        }catch(Exception e){
        }
       
    }

}
