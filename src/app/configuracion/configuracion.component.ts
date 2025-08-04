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
    selector: 'configuracion-cmp',
    templateUrl: 'configuracion.component.html',
    styleUrls: ['./configuracion.component.css'],
})


export class ConfiguracionComponent implements OnInit, OnDestroy{
    
    user : any = null;

    myFormFacturacion: FormGroup;

    public page: number = 0;
    public currentPage: number = 0;
    public search: string = '';
    public filter_model: string = 'Movimiento';

    @ViewChild('txtSearch') txtSearch! : ElementRef;

    nombre_empresa = null;
    flag_empresa = false;

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
      this.crearFormFacturacion();

      this.nombre_empresa = this.user.nombre;
      if(this.user?.padre_id){
        this.flag_empresa = false;
      }else{
        this.flag_empresa = true;
      }

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

  openModal(modal_id){
    $(modal_id).modal('show');
  }

  closeModal(modal_id){
    $(modal_id).modal('hide');
  }

  nextPage(){
    this.page += 5;
    this.currentPage += 1; 
  }

  prevPage(){
    if( this.page > 0 ){
      this.page -= 5;
      this.currentPage -= 1;
    }
  }

  onSearchModel( search: string ){
    this.page = 0;
    this.search = search;
  }

  
  crearFormFacturacion() {

    this.myFormFacturacion = this.fb.group({
      rfc  : ['', [ Validators.required, Validators.minLength(13), Validators.maxLength(13), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      description_regimen  : ['', [ Validators.required ] ],
      business_name  : ['', [ Validators.required ] ],
      description  : ['', [ Validators.required ] ],
      zip_code  : ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern('^[0-9]+$') ]  ],
      business_email  : ['', [ Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$')] ],
    });     
       
  }

  cargarDataFormFacturacion(){
    this.myFormFacturacion.patchValue({rfc : ''});
    this.myFormFacturacion.patchValue({description_regimen : ''});
    this.myFormFacturacion.patchValue({business_name : ''});
    this.myFormFacturacion.patchValue({description : ''});
    this.myFormFacturacion.patchValue({zip_code : ''});
    this.myFormFacturacion.patchValue({business_email : ''});
  }

  precargarDataFormFacturacion(){
    this.myFormFacturacion.patchValue({rfc : this.user.rfc});
    this.myFormFacturacion.patchValue({description_regimen : this.user.description_regimen});
    this.myFormFacturacion.patchValue({business_name : this.user.business_name});
    this.myFormFacturacion.patchValue({description : this.user.description});
    this.myFormFacturacion.patchValue({zip_code : this.user.zip_code});
    this.myFormFacturacion.patchValue({business_email : this.user.business_email});
  }

  rfcKeyup(){
    let mayus = this.myFormFacturacion.value.rfc;
    mayus = mayus.toString().toUpperCase();
    this.myFormFacturacion.patchValue({rfc : mayus});
  }
  description_regimenKeyup(){
    let mayus = this.myFormFacturacion.value.description_regimen;
    mayus = mayus.toString().toUpperCase();
    this.myFormFacturacion.patchValue({description_regimen : mayus});
  }
  business_nameKeyup(){
    let mayus = this.myFormFacturacion.value.business_name;
    mayus = mayus.toString().toUpperCase();
    this.myFormFacturacion.patchValue({business_name : mayus});
  }
  descriptionKeyup(){
    let mayus = this.myFormFacturacion.value.description;
    mayus = mayus.toString().toUpperCase();
    this.myFormFacturacion.patchValue({description : mayus});
  }
  zip_codeKeyup(){
    let mayus = this.myFormFacturacion.value.zip_code;
    mayus = mayus.toString().toUpperCase();
    this.myFormFacturacion.patchValue({zip_code : mayus});
  }
   business_emailKeyup(){
    let mayus = this.myFormFacturacion.value.business_email;
    mayus = mayus.toString().toUpperCase();
    this.myFormFacturacion.patchValue({business_email : mayus});
   }

  get rfcNoValido() {
    return this.myFormFacturacion.get('rfc').invalid && this.myFormFacturacion.get('rfc').touched
  }

  get description_regimenNoValido() {
    return this.myFormFacturacion.get('description_regimen').invalid && this.myFormFacturacion.get('description_regimen').touched
  }

  get business_nameNoValido() {
    return this.myFormFacturacion.get('business_name').invalid && this.myFormFacturacion.get('business_name').touched
  }

  get descriptionNoValido() {
    return this.myFormFacturacion.get('description').invalid && this.myFormFacturacion.get('description').touched
  }

  get zip_codeNoValido() {
    return this.myFormFacturacion.get('zip_code').invalid && this.myFormFacturacion.get('zip_code').touched
  }

  get business_emailNoValido() {
    return this.myFormFacturacion.get('business_email').invalid && this.myFormFacturacion.get('business_email').touched
  }

  guardar(){

    if ( this.myFormFacturacion.invalid ) {

      return Object.values( this.myFormFacturacion.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else{

          this.editarDatos();

    }
  }

  editarDatos(): void {

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
   
    var datos= {
      rfc: this.myFormFacturacion.value.rfc.toUpperCase(),
      description_regimen: this.myFormFacturacion.value.description_regimen.toUpperCase(),
      business_name: this.myFormFacturacion.value.business_name.toUpperCase(),
      description: this.myFormFacturacion.value.description.toUpperCase(),
      zip_code: this.myFormFacturacion.value.zip_code.toUpperCase(),
      business_email: this.myFormFacturacion.value.business_email.toUpperCase(),
    }

    var that = this;

    this.api_serv.putQuery(`usuarios/faturacion`, datos)
    .subscribe({
      next(data : any) {
           
        console.log(data);
        //that.data=data;
        
        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        });

        that.user.rfc = that.myFormFacturacion.value.rfc.toUpperCase();
        that.user.description_regimen = that.myFormFacturacion.value.description_regimen.toUpperCase();
        that.user.business_name = that.myFormFacturacion.value.business_name.toUpperCase();
        that.user.description = that.myFormFacturacion.value.description.toUpperCase();
        that.user.zip_code = that.myFormFacturacion.value.zip_code.toUpperCase();
        that.user.business_email = that.myFormFacturacion.value.business_email.toUpperCase();

        that.sesion_serv.setUser(that.user);

        that.cargarDataFormFacturacion();

        Object.values( that.myFormFacturacion.controls ).forEach( control => {
        
          if ( control instanceof FormGroup ) {
            Object.values( control.controls ).forEach( control => control.markAsUntouched() );
          } else {
            control.markAsUntouched();
          }

        });

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  editarEmpresa(): void {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea editar el nombre de empresa`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {

        var datos= {
          nombre: this.nombre_empresa
        }

        var that = this;

        this.api_serv.putQuery(`usuarios/usuario/${ this.user.id }`, datos)
        .subscribe({
          next(data : any) {
               
            console.log(data);

            that.user.nombre = that.nombre_empresa
            that.sesion_serv.setUser(that.user);
            
            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            }); 

          },
          error(msg) {
            console.log(msg);
            that.tratarError(msg);
          }
        });

      }

    });

  }
 


}
