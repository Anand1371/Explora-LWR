public with sharing class B2B_CarouselController {
    @AuraEnabled
    public static List<B2B_Carousel_Data__mdt> getBanners(){
        try {
            List<B2B_Carousel_Data__mdt> carouselBanners = [SELECT Banner_Description__c, Banner_Title__c, Image_Link__c FROM B2B_Carousel_Data__mdt];
            return carouselBanners;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}