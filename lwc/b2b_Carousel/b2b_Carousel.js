import { LightningElement } from 'lwc';

import getBanners from '@salesforce/apex/B2B_CarouselController.getBanners';

export default class B2b_Carousel extends LightningElement {

    getBanners()
    {
        getBanners({})
        .then((result)=>{
            if(result)
            {
                this.items = result;
            }
        })
        .catch((error)=> {
            console.log('error',JSON.stringify(error));
        });
    }
    
    items = [
        { src: 'https://ergo.creativezeune.com/wp-content/uploads/sites/7/2021/02/Black-bike-1.png' },
        { src: 'https://ergo.creativezeune.com/wp-content/uploads/sites/7/2021/02/White-Bike-1.png' },
        { src: 'https://ergo.creativezeune.com/wp-content/uploads/sites/7/2021/02/Black-bike-2.png' }
        // Add more items as needed
    ];
    currentItemIndex = 0;
    intervalId = null;

    connectedCallback() {
        this.getBanners();
        // Start auto-rotation on component initialization
        this.startAutoRotation();
    }

    disconnectedCallback() {
        // Stop auto-rotation when the component is removed from the DOM
        this.stopAutoRotation();
    }

    get currentItem() {
        return this.items[this.currentItemIndex];
    }

    startAutoRotation() {
        this.intervalId = setInterval(() => {
            this.nextItem();
        }, 5000); // Rotate every 5 seconds (5000 milliseconds)
    }

    stopAutoRotation() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    nextItem() {
        if (this.currentItemIndex < this.items.length - 1) {
            this.currentItemIndex++;
        } else {
            this.currentItemIndex = 0; // Loop back to the first item
        }
    }
}