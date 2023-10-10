/************************************************************************************
 * CreatedBy: RafterOne
 * Apex Class: B2B_SelfRegistrationController
 * Test Class: B2B_SelfRegistrationControllerTest
 * Description: This class is used to Register Guest User.
 *
 * Change History: 10/06/2023 
 * Date                Description                        ModifiedBy
 * 10/06/2023          INITIAL DEVELOPMENT                Pochana Anand Kumar Reddy
 * ************************************************************************************/

global without sharing class B2B_SelfRegistrationController {

    public static final String PROFILE_NAME = 'B2B Lightning Community Plus';
    public static final String BUYERGROUP_NAME = 'Explora Registered Buyer Group';
    public static final String PERMISSIONSETGROUP_NAME = 'Explora_Registered_Users_Permission_Sets';
    public static final String EMAILTEMPLATE_NAME = 'Welcome_Email_Notification';
    public static final String SITE_URL = 'https://training2021org1--anandp2.sandbox.my.site.com/explora/';

    /** 
    * This method is used to check for Duplicate Email and Phone.
    * @param phone The phone number entered by Guest user
    * @param email The email entered by Guest user
    */
    @AuraEnabled
    public static Map<String, Boolean> isPhoneEmailExist(String phone, String email){
        try
        {
            Map<String, Boolean> duplicateData = new Map<String, Boolean>();
            List<Contact> duplicateContact = [SELECT Id,Email, Phone FROM Contact WHERE Email =:email OR Phone=:phone];
            if(!duplicateContact.isEmpty())
            {
                for(Contact con : duplicateContact)
                {
                    if(con.Email.equals(email))
                    {
                        duplicateData.put('isEmailExist', true);
                    }
                    else if(con.Phone.equals(phone))
                    {
                        duplicateData.put('isPhoneExist', true);
                    }
                }
            }
            return duplicateData;
        } 
        catch (Exception e) 
        {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /** 
    * This method is used to register User.
    * @param userDetails all the Data entered by User
    */
    @AuraEnabled
    public static Map<String, String> registerUser(Map<String, String> userDetails)
    {
        try {

            String pass = userDetails.get('password');
            System.debug('pass'+pass);
            Map<String, String> registerUserMap = new Map<String, String>();
            //Create New Account and Enable assign to Buyer Group
            Account acc = createNewAccount(userDetails);
            Contact con = createNewContact(userDetails, acc.Id);

            // generating a random number:
            String currentDateTime = String.valueOf(DateTime.now().getTime());

            Id prodileId = [SELECT Id FROM Profile WHERE Name =:PROFILE_NAME].Id;
            String uAlias = userDetails.get('firstName').SubString(0,1) + userDetails.get('lastName').SubString(0,2) + currentDateTime.SubString(0,4);

            
            //Create a New User
            User u = new User(
                TimeZoneSidKey='America/Los_Angeles',
                LocaleSidKey='en_US',
                LanguageLocaleKey='en_US',
                ProfileId = prodileId,   
                EmailEncodingKey='ISO-8859-1',
                Alias =uAlias,
                Username = userDetails.get('email'),
                Email = userDetails.get('email'),
                FirstName = userDetails.get('firstName'), 
                LastName=userDetails.get('lastName'),
                ContactId = con.Id,
                CommunityNickName = userDetails.get('firstName') +' '+ userDetails.get('lastName') + currentDateTime.SubString(0,3)
            );

            String accountId = acc.Id;
            System.debug('accountId'+accountId);

            try
            {
                String userId = Site.createExternalUser(u, accountId, pass);
                if(userId != null)
                {
                    String emailResult = sendWelcomeMail(userId);
                    //Assign User to Permission Set
                    assignPermissionSetToUser(userId);
                    ApexPages.PageReference pageRef = Site.login(u.Username,userDetails.get('password'),SITE_URL);
                    registerUserMap.put('pageRef',pageRef.getURL());
                }
            }
            catch(Site.ExternalUserCreateException e)
            {
                List <String> errors = e.getDisplayMessages();
                for(String error:errors)
                {
                    System.debug('error:' +error);
                }
            }

            return registerUserMap;
            // end of function 
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());  
        }
    }

    /** 
    * This method is used to create Account, Buyer Account and assign it to Buyer Group.
    * @param userDetails all the Data entered by User
    */
    @AuraEnabled
    public static Account createNewAccount(Map<String, String> userDetails)
    {
        try 
        {
            //Create New Account
            Account acc = new Account();
            acc.Name = userDetails.get('firstName') + ' ' + userDetails.get('lastName');
            acc.Phone = userDetails.get('phone');
            insert acc;
            acc.IsPartner = true;
            update acc;

            //Create Buyer Account
            BuyerAccount buyerAccount = new BuyerAccount();
            buyerAccount.BuyerId = acc.Id;
            buyerAccount.Name = acc.Name;
            buyerAccount.IsActive = true;
            insert buyerAccount;

            //Retrieve Buyer Group Id with Name
            BuyerGroup bg = [SELECT Id, Name FROM BuyerGroup WHERE Name=:BUYERGROUP_NAME];

            //Create Buyer Group Member
            BuyerGroupMember bgm = new BuyerGroupMember();
            bgm.buyerId = acc.Id;
            bgm.BuyerGroupId = bg.Id;
            insert bgm;

            return acc;
        } 
        catch (Exception e) 
        {
            throw new AuraHandledException(e.getMessage());  
        }
    }

    /** 
    * This method is used to create Contact.
    * @param userDetails all the Data entered by User
    * @param accountId The accountId created for User
    */
    @AuraEnabled
    public static Contact createNewContact(Map<String, String> userDetails, String accountId){
        try {
            //Create New Contact
            Contact con = new Contact(
                FirstName = userDetails.get('firstName'),
                LastName = userDetails.get('lastName'),
                Email = userDetails.get('email'),
                Phone = userDetails.get('phone'),
                AccountId = accountId
            );
            insert con;
            return con;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    /** 
    * This method is used to assign User to the Permission Set Group.
    * @param userId Newly created User Id
    */
    @future
    public static void assignPermissionSetToUser(String userId)
    {
        try {
            Id setId = [select Id FROM PermissionSetGroup WHERE DeveloperName =:PERMISSIONSETGROUP_NAME].Id;

            List<PermissionSetAssignment> psAssignments= new List<PermissionSetAssignment>();
            PermissionSetAssignment assignment = new PermissionSetAssignment(
                PermissionSetGroupId = setId, 
                AssigneeId = userId
            );
            psAssignments.add(assignment);
            upsert psAssignments;
        } catch (Exception e) {            
            throw new AuraHandledException(e.getMessage());
        }
        
    }

    /** 
    * This method is used to Send Welcome Email.
    * @param userId Newly created User Id
    */
    @AuraEnabled
    public static String sendWelcomeMail(String userId){
        try {

            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

            List<EmailTemplate> welcomeTemplate = new List<EmailTemplate>([Select Id from EmailTemplate where DeveloperName =:EMAILTEMPLATE_NAME]);
                     
            mail.setSenderDisplayName('Explora');
            mail.setTargetObjectId(userId);
            mail.setTemplateId(welcomeTemplate[0].Id);
            mail.setSaveAsActivity(false);

            Messaging.sendEmail( new List<Messaging.SingleEmailMessage>{mail} );

            return 'success';

        } catch (Exception e) {            
            throw new AuraHandledException(e.getMessage());
        }
    }
}