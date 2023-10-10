import { LightningElement, track } from 'lwc';

import cycleGif from '@salesforce/resourceUrl/cycleGif';
import ToastContainer from 'lightning/toastContainer';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import basePath from '@salesforce/community/basePath';
import { NavigationMixin } from 'lightning/navigation';

import isPhoneEmailExist from '@salesforce/apex/B2B_SelfRegistrationController.isPhoneEmailExist';
import registerUser from '@salesforce/apex/B2B_SelfRegistrationController.registerUser';

//Custom Labels
import First_Name from '@salesforce/label/c.First_Name';
import Last_Name from '@salesforce/label/c.Last_Name';
import Email from '@salesforce/label/c.Email';
import Close from '@salesforce/label/c.Close';
import Phone from '@salesforce/label/c.Phone';
import Password from '@salesforce/label/c.Password';
import Confirm_Password from '@salesforce/label/c.Confirm_Password';
import Account_Exist from '@salesforce/label/c.Account_Exist';
import Register from '@salesforce/label/c.Register';
import Password_Mismatch_Error from '@salesforce/label/c.Password_Mismatch_Error';
import Mail_Exist_Error from '@salesforce/label/c.Mail_Exist_Error';
import Phone_Exists_Error from '@salesforce/label/c.Phone_Exists_Error';
import Explora_Title from '@salesforce/label/c.Explora_Title';
import Pass_ToolTip from '@salesforce/label/c.Pass_ToolTip';

export default class B2b_SelfRegistration extends NavigationMixin(LightningElement) {

    @track userDetails = {};
    isLoading = false;
    cycleGifForRegistrationPage = cycleGif;
    errorMessage;
    isPasswordExist = false;

    labels = {
        First_Name,
        Last_Name,
        Email,
        Close,
        Phone,
        Password,
        Confirm_Password,
        Account_Exist,
        Register,
        Password_Mismatch_Error,
        Mail_Exist_Error,
        Phone_Exists_Error,
        Explora_Title,
        Pass_ToolTip
    }

    passStrengthBar1 = 'strength-bar1';
    passStrengthBar2 = 'strength-bar2';
    passStrengthBar3 = 'strength-bar3';

    connectedCallback()
    {
        const toastContainer = ToastContainer.instance();
        toastContainer.maxShown = 5;
        toastContainer.toastPosition = 'top-center';
    }

    handleUserDetails(event)
    {
        if(event.target.dataset.id === 'firstName'){
            this.userDetails.firstName = event.target.value;
        }else if(event.target.dataset.id === 'lastName'){
            this.userDetails.lastName = event.target.value;
        }else if(event.target.dataset.id === 'phone'){
            this.userDetails.phone = event.target.value;
        }else if(event.target.dataset.id === 'email'){
            this.userDetails.email = event.target.value;  
        }else if(event.target.dataset.id === 'confirmPassword'){
            this.userDetails.confirmpassword = event.target.value;
        }
    }


    checkPasswordStrength(event) {
        const password = event.target.value;
        this.userDetails.password = password;
        if(password.length > 0)
        {
            this.isPasswordExist = true;

            // Use regular expressions to check for at least one number, one capital letter, and one lowercase letter
            const hasNumber = /\d/.test(password);
            const hasCapitalLetter = /[A-Z]/.test(password);
            const hasLowercaseLetter = /[a-z]/.test(password);
            const hasMinLength = password.length >= 8; // Minimum length requirement

            if (hasNumber && hasCapitalLetter && hasLowercaseLetter && hasMinLength) {
                this.passStrengthBar1 = 'strength-bar1 green';
                this.passStrengthBar2 = 'strength-bar2 green';
                this.passStrengthBar3 = 'strength-bar3 green';
                
            } else if (hasNumber && (hasCapitalLetter || hasLowercaseLetter) && hasMinLength) {
                this.passStrengthBar1 = 'strength-bar1 yellow';
                this.passStrengthBar2 = 'strength-bar2 yellow';
                this.passStrengthBar3 = 'strength-bar3 white';
                
            } else {
                this.passStrengthBar1 = 'strength-bar1 red';
                this.passStrengthBar2 = 'strength-bar2 white';
                this.passStrengthBar3 = 'strength-bar3 white';
                
            }
        }
        else{
            this.isPasswordExist = false;
        }
    }

    closeErrorMessage(){
        this.errorMessage = '';
    }

    goToLogin()
    {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: basePath + '/login'
            }
        });
    }

    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
    
        inputFields.forEach(inputField => {
            if(!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }

    register()
    {
        
        if(this.isInputValid())
        {
            this.isLoading = true;
            if(this.userDetails.password !== this.userDetails.confirmpassword)
            {
                this.isLoading = false;
                this.errorMessage = this.labels.Password_Mismatch_Error;
                return;
            }
            else{
                debugger;
                isPhoneEmailExist({phone : this.userDetails.phone, email : this.userDetails.email})
                .then(result=> {
                    if(result.hasOwnProperty('isEmailExist'))
                    {
                        this.isLoading = false;
                        this.errorMessage = this.labels.Mail_Exist_Error;
                    }
                    else if(result.hasOwnProperty('isPhoneExist'))
                    {
                        this.isLoading = false;
                        this.errorMessage = this.labels.Phone_Exists_Error;
                    }
                    else{
                        registerUser({userDetails : this.userDetails})
                        .then((result1)=> {
                            this.isLoading = false;
                            if(result1.hasOwnProperty('pageRef'))
                            {
                                window.location.href = result1.pageRef;
                            }
                        })
                        .catch(error=> {
                            console.log('error', JSON.stringify(error));
                            this.isLoading = false;
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Error!',
                                    message: error.body.message,
                                    variant: 'error'
                                })
                            );
                        });
                    }
                })
                .catch(error=> {
                    this.isLoading = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error!',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
            }
        }
    }
}