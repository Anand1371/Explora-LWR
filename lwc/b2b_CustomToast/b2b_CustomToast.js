import { LightningElement, api } from 'lwc';

export default class B2b_CustomToast extends LightningElement {
    @api title = '';
    @api message = '';
    @api variant = '';
    @api mode = '';
    @api autoCloseTime = 5000;
    @api autoClose = false;
    @api autoCloseErrorWarning = false;

    @api
    showCustomNotice() {
        const toastModel = this.template.querySelector('[data-id="toastModel"]');
        toastModel.className = 'slds-show';
        if(this.autoClose){
            this.delayTimeout = setTimeout(() => {
                const toastModel = this.template.querySelector('[data-id="toastModel"]');
                toastModel.className = 'slds-hide';
            }, this.autoCloseTime);
        }
    }
    
    @api
    showCustomNoticeWithParams(title,message,variant,mode,autoClose) {
        this.title = title;
        this.message = message;
        this.variant = variant;
        this.mode = mode;
        this.autoClose=autoClose;
        this.showCustomNotice();
    }

    closeModel(e) {
        const toastModel = this.template.querySelector('[data-id="toastModel"]');
        toastModel.className = 'slds-hide';
        this.closeToastEvent(e);
    }

    closeToastEvent(e){
        console.log('_____closeToastEvent_____');
        // Creates the event with the data.
        const selectedEvent = new CustomEvent("closetoast", {
        detail: false
        });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }

    get mainDivClass() { 
        return 'slds-notify slds-notify_toast slds-theme_'+this.variant;
    }

    get messageDivClass() { 
        return 'slds-icon_container slds-icon-utility-'+this.variant+' slds-icon-utility-success slds-m-right_small slds-no-flex slds-align-top';
    }
    get iconName() {
        return 'utility:'+this.variant;
    }
}