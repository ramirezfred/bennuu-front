import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';

//Mis imports
import { APIService } from '../services/API/API.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FormGroupDirective, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { SesionService } from '../services/sesion/sesion.service';

//import { TableData } from '../../lbd/lbd-table/lbd-table.component';

import { DomSanitizer } from '@angular/platform-browser';

import { Location } from '@angular/common';



declare var $:any;

declare interface DataTable {
    headerRow: string[];
    //footerRow: string[];
    dataRows: any[];
}


@Component({
    selector: 'cotizador-interno-cmp',
    templateUrl: 'cotizador-interno.component.html',
    styleUrls: ['./cotizador-interno.component.css'],
})


export class CotizadorInternoComponent implements OnInit, OnDestroy{
    
    user : any = null;

    servicios = [];

    myFormCotizar: FormGroup;

    @ViewChild('content_print') content_print : ElementRef;
    fecha_pdf = null;

    peso_print = null;

    constructor(
        private api_serv: APIService,
        private http: HttpClient,
        private fb: FormBuilder,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private sesion_serv: SesionService,
        private _location: Location,
    )
    {

      this.user = this.sesion_serv.getUser();
      this.crearFormCotizar();
      this.crearListenersFormCotizar();
      

    }

  ngOnInit(){
   
  }

  ngOnDestroy() {
    // acciones de destrucción
  }

  ngAfterViewInit(){

  }

  tratarError(msg : any){
      //token invalido/ausente o token expiro
      if(msg.status == 400 || msg.status == 401 || msg.status == 404){ 
        Swal.fire({
          title: 'Warning',
          text: msg.error.error,
          icon: 'warning'
        });

        //this.router.navigateByUrl('/login');
      }
      else { 
        Swal.fire({
          title: 'Error',
          text: msg.error.error,
          icon: 'error'
        });
      }

  }

  goBack(){
      this._location.back();
  }

  scroll_to(id_scroll_to): void {

      setTimeout(()=>{
          
        // Hack: Scrolls to top of Page after page view initialized
        let id_scroll = document.getElementById(id_scroll_to);
        if (id_scroll !== null) {
          id_scroll.scrollIntoView();
          id_scroll = null;
        }  

      },350);
  }

  
  crearFormCotizar() {

    this.myFormCotizar = this.fb.group({
      depth  : ['', [ Validators.required, Validators.min(1) ]  ],
      width  : ['', [ Validators.required, Validators.min(1) ]  ],
      height  : ['', [ Validators.required, Validators.min(1) ]  ],
      weight  : [{value:'', disabled: false}, [ Validators.required, Validators.min(1) ]  ],
      origin_codePostal  : ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(5) ]  ],
      destination_codePostal  : ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(5) ]  ],
      type : ['Caja', [ Validators.required ]  ],
      zipcodeO_valid  : [false],
      zipcodeD_valid  : [false],
    });     
       
  }

  crearListenersFormCotizar(){
    this.myFormCotizar.valueChanges.subscribe( valor => {
      this.servicios = [];
      //this.ressetServSel();
    });

    this.myFormCotizar.get('origin_codePostal').valueChanges.subscribe( valor => {

      if(valor.length == 5){
        //this.validarZipcode(valor,0); 
        this.validarZipcodeCfdi(valor,0);        
      }else{
        this.myFormCotizar.patchValue({zipcodeO_valid : false});
      }

    });

    this.myFormCotizar.get('destination_codePostal').valueChanges.subscribe( valor => {

      if(valor.length == 5){
        this.validarZipcodeCfdi(valor,1);
      }else{
        this.myFormCotizar.patchValue({zipcodeD_valid : false});
      }

    });
  }

  get origin_codePostalNoValido() {
    return this.myFormCotizar.get('origin_codePostal').invalid && this.myFormCotizar.get('origin_codePostal').touched
  }

  get destination_codePostalNoValido() {
    return this.myFormCotizar.get('destination_codePostal').invalid && this.myFormCotizar.get('destination_codePostal').touched
  }

  get depthNoValido() {
    return this.myFormCotizar.get('depth').invalid && this.myFormCotizar.get('depth').touched
  }

  get widthNoValido() {
    return this.myFormCotizar.get('width').invalid && this.myFormCotizar.get('width').touched
  }

  get heightNoValido() {
    return this.myFormCotizar.get('height').invalid && this.myFormCotizar.get('height').touched
  }

  get weightNoValido() {
    return this.myFormCotizar.get('weight').invalid && this.myFormCotizar.get('weight').touched
  }

  changeType(event){
    //console.log('event '+event);
    if(event == 'Sobre'){
      this.myFormCotizar.patchValue({depth : 1});
      this.myFormCotizar.patchValue({width : 1});
      this.myFormCotizar.patchValue({height : 1});
      this.myFormCotizar.patchValue({weight : 1});
      this.myFormCotizar.controls['weight'].disable();
    }else if(event == 'Caja' || event == 'Tarima'){
      this.myFormCotizar.patchValue({depth : ''});
      this.myFormCotizar.patchValue({width : ''});
      this.myFormCotizar.patchValue({height : ''});
      this.myFormCotizar.patchValue({weight : ''});
      this.myFormCotizar.controls['weight'].enable();
    }

    //this.servicios = [];
    //this.ressetServSel();

    return Object.values( this.myFormCotizar.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsUntouched() );
        } else {
          control.markAsUntouched();
        }
 
      });

  }

  cotizarAhora(){
    //console.log( this.myFormCotizar ); 

    if ( this.myFormCotizar.invalid ) {

      return Object.values( this.myFormCotizar.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else if(!this.myFormCotizar.value.zipcodeO_valid){
      Swal.fire({
        title: 'Error',
        text: 'Origen Inválido',
        icon: 'error'
      });
    }else if(!this.myFormCotizar.value.zipcodeD_valid){
      Swal.fire({
        title: 'Error',
        text: 'Destino Inválido',
        icon: 'error'
      });
    }else{

      this.servicios = [];

      //this.ressetServSel();

      Swal.fire({
        title: 'Espere',
        text: 'Ejecutando',
        icon: 'info',
        allowOutsideClick: false
      });
      Swal.showLoading();

      let peso = null;
      if(this.myFormCotizar.value.type == 'Sobre'){
        peso = 1;
      }else{
        peso = this.myFormCotizar.value.weight;
      }

      this.peso_print = peso;

      var datos= {
        largo: this.myFormCotizar.value.depth,
        ancho: this.myFormCotizar.value.width,
        alto: this.myFormCotizar.value.height,
        peso: peso,
        cpR: this.myFormCotizar.value.origin_codePostal,
        cpD: this.myFormCotizar.value.destination_codePostal,
        type: this.myFormCotizar.value.type,
      }
      //console.log(datos);

      var that = this;

      this.api_serv.postQuery(`cotizador/generico/cotizar`,datos)
      //this.api_serv.postQuery(`cotizador/cotizacion/generica`,datos)
      .subscribe({
        next(data : any) {
          
          console.log(data);

          that.servicios = data.servicios;
          
          Swal.fire({
            title: 'Info',
            text: that.servicios.length+' servicios disponibles',
            icon: 'info',
          });

        },
        error(msg) {
          console.log(msg);
          that.tratarError(msg);          
        }
      });
    }
  }

  aCotizar(){
    this.servicios = [];
  }

  validarZipcode (zipcode, bandera) {

    if(bandera == 0){
      this.myFormCotizar.patchValue({zipcodeO_valid : false});
    }

    if(bandera == 1){ 
      this.myFormCotizar.patchValue({zipcodeD_valid : false});     
    }

    Swal.fire({
      title: 'Espere',
      text: 'Validando Código Paostal',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    this.api_serv.getQuery(`cotizador/generico/zipcodes/${ zipcode }?country=MX`)
    //this.api_serv.getQuery(`cotizador/zipcodes/${ zipcode }?country=MX`)
    .subscribe({
      next(data : any) {
        
        console.log(data);

         Swal.close ();

          if(bandera == 0){
            that.myFormCotizar.patchValue({zipcodeO_valid : true});
          }

          if(bandera == 1){
            that.myFormCotizar.patchValue({zipcodeD_valid : true});      
          }   

      },
      error(msg) {

         that.tratarError(msg);
          
      }
    });
  }

  validarZipcodeCfdi (zipcode, bandera) {

    if(bandera == 0){
      this.myFormCotizar.patchValue({zipcodeO_valid : false});
    }

    if(bandera == 1){ 
      this.myFormCotizar.patchValue({zipcodeD_valid : false});     
    }

    Swal.fire({
      title: 'Espere',
      text: 'Validando Código Paostal',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    this.api_serv.getQuery(`cotizador/generico/get_codigo_postal/${ zipcode }`)
    //this.api_serv.getQuery(`cotizador/zipcodes/${ zipcode }?country=MX`)
    .subscribe({
      next(data : any) {
        
        console.log(data);

         Swal.close ();

          if(bandera == 0){
            that.myFormCotizar.patchValue({zipcodeO_valid : true});
          }

          if(bandera == 1){
            that.myFormCotizar.patchValue({zipcodeD_valid : true});      
          }   

      },
      error(msg) {

         that.tratarError(msg);
          
      }
    });
  }

  initfecha(){

    var fecha = new Date();
    //var fecha = Date.now();
    let diaActual = fecha.getDate();
    let mesActual = fecha.getMonth() + 1;
    let anioActual = fecha.getFullYear();

    this.fecha_pdf = diaActual+'/'+mesActual+'/'+anioActual;

  }

  print(): void {
    let printContents, popupWin;
    //printContents = document.getElementById('print-section').innerHTML;
    printContents = this.content_print.nativeElement.innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
          
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1.6cm; }
              .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12 {
                    float: left;
               }
               .col-sm-12 {
                    width: 100%;
               }
               .col-sm-9 {
                    width: 75%;
               }
               .col-sm-3 {
                    width: 25%;
               }
               .form-control-static {
                 margin-bottom: 0px;
               }
            }
          </style>

        </head>

      <body onload="window.focus();window.print();window.close()"> ${printContents} </body>
      </html>`
    );
    //popupWin.document.close();
  }

  printPdf(){
    this.initfecha();
    setTimeout(()=>{
      this.print();
    },100);
  }
  
  
 


}
