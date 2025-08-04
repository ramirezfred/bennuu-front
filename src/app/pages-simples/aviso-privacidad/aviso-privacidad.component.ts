import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Location } from '@angular/common';

declare var $:any;

@Component({
    selector: 'aviso-privacidad-cmp',
    templateUrl: './aviso-privacidad.component.html'
})

export class AvisoPrivacidadComponent implements OnInit{
    

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private _location: Location,
    )
    {
        localStorage.setItem('ruta_login', '0');

    }

    checkFullPageBackgroundImage(){
        var $page = $('.full-page');
        var image_src = $page.data('image');

        if(image_src !== undefined){
            var image_container = '<div class="full-page-background" style="background-image: url(' + image_src + ') "/>'
            $page.append(image_container);
        }
    };

    ngOnInit(){
        this.checkFullPageBackgroundImage();

        setTimeout(function(){
            // after 1000 ms we add the class animated to the login/register card
            $('.card').removeClass('card-hidden');
        }, 700)

    }

    ngAfterViewInit(){

    }

    goBack(){
        this._location.back();
    }


    

    
}
