/************************************************************************************
 * CreatedBy: RafterOne
 * Apex Class: B2B_SelfRegistrationController
 * Test Class: B2B_SelfRegistrationControllerTest
 * Description: This class is used to Create Lead for Guest User and Case for Logged In User.
 *
 * Change History: 10/06/2023 
 * Date                Description                        ModifiedBy
 * 10/06/2023          INITIAL DEVELOPMENT                Pochana Anand Kumar Reddy
 * ************************************************************************************/

public with sharing class B2B_ContactUsController {

    /** 
    * This method is used to create Lead.
    * @param leadDetails The Lead Details of a user
    */
    @AuraEnabled
    public static string registerLead(Map<String, String> leadDetails){
        try {
            Lead le = new Lead(
                Firstname = leadDetails.get('firstName'),
                Lastname = leadDetails.get('lastName'),
                Email = leadDetails.get('email'),
                Company = leadDetails.get('companyName'),
                Comment__c = leadDetails.get('comment'),
                Lead_Type__c = 'B2B store'
            );
            insert le;
            return 'Successful';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /** 
    * This method is used to create Case.
    * @param comment The comment entered by User
    * @param Id The Logged In User Id
    */
    @AuraEnabled
    public static string registerCase(string comment, string Id){
        try {
            List <User> userlist = [SELECT u.Id, u.ContactId FROM User u WHERE u.Id =:Id];

            Case ca = new Case();
            ca.Comments = comment;
            ca.Origin = 'Web';
            ca.ContactId = userlist[0].ContactId;
            insert ca;
            return 'successful';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}