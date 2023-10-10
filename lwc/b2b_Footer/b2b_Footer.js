import { LightningElement } from 'lwc';
import ToastContainer from 'lightning/toastContainer';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import socialLinks from '@salesforce/resourceUrl/SocialLinks';
import isguest from '@salesforce/user/isGuest';
import Id from '@salesforce/user/Id';
import registerLead from '@salesforce/apex/B2B_ContactUsController.registerLead';
import registerCase from '@salesforce/apex/B2B_ContactUsController.registerCase';

//Custom Labels
import First_Name from '@salesforce/label/c.First_Name';
import Last_Name from '@salesforce/label/c.Last_Name';
import Email from '@salesforce/label/c.Email';
import Company_Name from '@salesforce/label/c.Company_Name';
import Comments from '@salesforce/label/c.Comments';
import Submit from '@salesforce/label/c.Submit';
import Close from '@salesforce/label/c.Close';
import Contact_Us from '@salesforce/label/c.Contact_Us';
import Contact_Info from '@salesforce/label/c.Contact_Info';
import Submitted_Successfully from '@salesforce/label/c.Submitted_Successfully';
import Contact_Form from '@salesforce/label/c.Contact_Form';
import Home from '@salesforce/label/c.Home';
import About from '@salesforce/label/c.About';
import News from '@salesforce/label/c.News';
import Privacy_Policy from '@salesforce/label/c.Privacy_Policy';
import Blog from '@salesforce/label/c.Blog';
import Explora_Title from '@salesforce/label/c.Explora_Title';
import Enter_Your_Message from '@salesforce/label/c.Enter_Your_Message';

export default class B2b_Footer extends LightningElement {

    leadDetails = {};
    comment;
    isModalOpen = false;
    isGuestUser = isguest;
    isLoading = false;

    labels = {
        First_Name,
        Last_Name,
        Email,
        Company_Name,
        Comments,
        Submit,
        Close,
        Contact_Us,
        Contact_Info,
        Contact_Form,
        Submitted_Successfully,
        Home,
        About,
        News,
        Privacy_Policy,
        Blog,
        Explora_Title,
        Enter_Your_Message
    }

    connectedCallback()
    {
        const toastContainer = ToastContainer.instance();
        toastContainer.maxShown = 5;
        toastContainer.toastPosition = 'top-center';
    }


    socialLinks=[
        {
            link:"https://twitter.com/Spartan",
            icon:socialLinks+'/SOCIAL/twitter.svg'
        },
        {
            link: "https://facebook.com/Spartan",
            icon: socialLinks + '/SOCIAL/facebook.svg'
        },
        {
            link: "https://www.linkedin.com/in/Spartan/",
            icon: socialLinks + '/SOCIAL/linkedin.svg'
        },
    ]

    ABOUT_COMPANY={
        EMAIL:'anand@explora.com',
        PHONE:'+918790242342',
    }

    addLeadDataHandler(event)
    {
        if(event.target.dataset.id === 'inputFirstName'){
            this.leadDetails.firstName = event.target.value;
        }else if(event.target.dataset.id === 'inputLastName'){
            this.leadDetails.lastName = event.target.value;
        }else if(event.target.dataset.id === 'inputEmail'){
            this.leadDetails.email = event.target.value;
        }else if(event.target.dataset.id === 'inputCompanyName'){
            this.leadDetails.companyName = event.target.value;
        }else if(event.target.dataset.id === 'inputComment'){
            this.leadDetails.comment = event.target.value;
        }
    }

    addCaseDataHandler(event)
    {
        if(event.target.dataset.id === 'inputComment'){
            this.comment = event.target.value;
        }
    }

    handleSubmitLead() {
        if(this.isInputValid())
        {
            this.isLoading = true;
            registerLead({leadDetails : this.leadDetails})
            .then((result) =>
            {
                this.isLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success!',
                        message: this.labels.Submitted_Successfully,
                        variant: 'success'
                    })
                );
            })
            .catch((error)=> {
                this.isLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
            this.closeModal();
        }
    }


    handleSubmitCase() {
        if(this.isInputValid())
        {
            this.isLoading = true;
            registerCase({comment : this.comment, Id : Id})
            .then((result1) =>
            {
                this.isLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success!',
                        message: this.labels.Submitted_Successfully,
                        variant: 'success'
                    })
                );
            })
            .catch((error)=> {
                this.isLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
            this.closeModal();
        }
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

    openModal()
    {
        this.isModalOpen = true;
    }

    closeModal()
    {
        this.isModalOpen = false;
    }
}