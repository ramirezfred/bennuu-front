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

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { Location } from '@angular/common';

declare var $:any;

declare interface DataTable {
    headerRow: string[];
    //footerRow: string[];
    dataRows: any[];
}


@Component({
    selector: 'mis-guias-cmp',
    templateUrl: 'mis-guias.component.html',
    styleUrls: ['./mis-guias.component.css'],
})


export class MisGuiasComponent implements OnInit, OnDestroy{
    
    public loading = false;

    objAOperar = null;
    num_guia = null;

    curp = null;

    user : any = null;

    @ViewChild('modalCurp') modalCurp : ElementRef;

    selectedTab1 = true;
    selectedTab2 = false;

    myFormCurp: FormGroup;
    myFormPersona: FormGroup;

    dias = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
    meses = [1,2,3,4,5,6,7,8,9,10,11,12];
    anios = [];
    sexos = ['Mujer','Hombre','No binario'];
    estados = ['Aguascalientes','Baja California','Baja California Sur',
      'Campeche','Coahuila','Colima','Chiapas','Chihuahua',
      'Ciudad de México','Durango','Guanajuato','Guerrero',
      'Hidalgo','Jalisco','Estado de México','Michoacán',
      'Morelos','Nayarit','Nuevo León','Oaxaca','Puebla',
      'Querétaro','Quintana Roo','San Luis Potosí','Sinaloa',
      'Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz',
      'Yucatán','Zacatecas','Nacido en el extranjero'];

    public listado: any = [];

    public page: number = 0;
    public currentPage: number = 0;
    public search: string = '';
    public filter_model: string = 'Guia';

    @ViewChild('txtSearch') txtSearch! : ElementRef;

    public rastreo_Status: any = null;
    public rastreo_TrackingData: any = [];

    //url: string = 'https://www.paquetexpress.com.mx/rastreo/';
    //url: string = 'https://www.paquetexpress.com.mx/rastreo/19167888398';
    //url: string = 'https://pxqa.paquetexpress.com.mx/rastreo/';
    url: string = 'https://api.bennuu.mx/proxy?url=https://www.paquetexpress.com.mx';
    safeUrl: SafeResourceUrl;

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

      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
      
      this.user = this.sesion_serv.getUser();
      this.crearFormCurp();
      this.crearFormPersona();

    }

  ngOnInit(){

    this.getListado();
   
  }

  ngOnDestroy() {
    // acciones de destrucción
    this.closeAllModals();
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

  closeAllModals(){
    this.closeModal('#myModalCurp');
    this.closeModal('#modalRastreoTeiker');
    this.closeModal('#modalRastreoIframe');
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

  getListado(): void {

    this.listado = [];

    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
  
    var datos = {};
    
    var that = this;

    this.api_serv.getQuery(`guias/mis/guias`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado = data.guias;
        for(var i = 0; i < that.listado.length; i++){
          // if(that.listado[i].estado==1){
          //   that.listado[i].estado = 'Creada';
          // }else if(that.listado[i].estado==2){
          //   that.listado[i].estado = 'Cancelada';
          // }
          if(that.listado[i].guia == null){
            that.listado[i].guia = '';
          }
        }
        
        Swal.close ();

        if(that.listado.length == 0){
          Swal.fire({
            title: 'Info',
            text: 'Actualmente no tienes guías emitidas.',
            icon: 'info',
          });
        }else{
          that.currentPage = 1;
        }

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  aCancelar(obj): void {
    this.objAOperar = obj;
    this.num_guia = this.objAOperar.guia;

    this.cancelarGuia();
  }

  cancelarGuia(){
    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea cancelar la guía ${this.num_guia}`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {

        Swal.fire({
          title: 'Espere',
          text: 'Ejecutando',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();
        
        var datos = {
          guia : this.num_guia,
        };

        var that = this;

        this.api_serv.postQuery(`guias/cancelar`, datos)
        .subscribe({
          next(data : any) {
            console.log(data);

            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });

            that.objAOperar.estado = 'Cancelación solicitada';
            that.objAOperar = null;
            that.num_guia = null;

          },
          error(msg) {
            console.log(msg);
            that.tratarError(msg);
          }
        });

      }

    });
  }

  descargarGuia(guia){

    Swal.fire({
      title: 'Espere',
      text: 'Generando PDF...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    
    var datos = {
      guia : guia,
    };

    var that = this;

    this.api_serv.postQuery(`guias/descargar`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        Swal.close ();

        setTimeout(()=>{

          //base 64
          if(data.bandera_metodo == 1){
            that.printPdf(data.pdf);
          }
          //link
          else if(data.bandera_metodo == 2){
            let anchor = document.createElement("a");
            anchor.href = data.pdf;
            anchor.target = "_blank"
            anchor.click();
          }

        },600);

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });
  }

  b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  printPdf(your_base64){
    var fileblob = this.b64toBlob(your_base64, 'application/pdf');
    var url = window.URL.createObjectURL(fileblob); 

    let anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank"
    anchor.click();
  }

  getCurp(guia): void {

    this.num_guia = guia;
     this.curp = null;

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    
    var that = this;

    this.api_serv.getQuery(`curp/${this.user.id}`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.curp = data.curp;
        Swal.close (); 

        if(that.curp){
          that.descargarGuia(guia);
        }else{
          that.cargarDataFormCurp();
          that.cargarDataFormPersona();
          that.openModal('#myModalCurp');
        }

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }


  selectTab(index){
    if(index == 1){
      this.selectedTab1 = true;
      this.selectedTab2 = false;
    }else if(index == 2){
      this.selectedTab1 = false;
      this.selectedTab2 = true;
    }
  }

  crearFormCurp() {
    this.myFormCurp = this.fb.group({
      curp  : ['', [ Validators.required, Validators.minLength(17), Validators.maxLength(17), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
    });         
  }

  cargarDataFormCurp(){
    this.myFormCurp.patchValue({curp : ''});

    Object.values( this.myFormCurp.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });

  }

  get curpNoValido() {
    return this.myFormCurp.get('curp').invalid && this.myFormCurp.get('curp').touched
  }

  guardarCurp(){

    if ( this.myFormCurp.invalid ) {

      return Object.values( this.myFormCurp.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else{
      this.crearCrup();
    }
  }

  crearFormPersona() {
    this.myFormPersona = this.fb.group({
      nombre  : ['', [ Validators.required ]  ],
      apellido1  : ['', [ Validators.required ]  ],
      apellido2  : ['', [ Validators.required ]  ],
      dia  : ['', [ Validators.required ]  ],
      mes  : ['', [ Validators.required ]  ],
      anio  : ['', [ Validators.required ]  ],
      sexo  : ['', [ Validators.required ]  ],
      estado  : ['', [ Validators.required ]  ],
    });         
  }

  cargarDataFormPersona(){
    this.myFormPersona.patchValue({nombre : ''});
    this.myFormPersona.patchValue({apellido1 : ''});
    this.myFormPersona.patchValue({apellido2 : ''});
    this.myFormPersona.patchValue({dia : ''});
    this.myFormPersona.patchValue({mes : ''});
    this.myFormPersona.patchValue({anio : ''});
    this.myFormPersona.patchValue({sexo : ''});
    this.myFormPersona.patchValue({estado : ''});

    Object.values( this.myFormPersona.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });
  }

  get nombreNoValido() {
    return this.myFormPersona.get('nombre').invalid && this.myFormPersona.get('nombre').touched
  }

  get apellido1NoValido() {
    return this.myFormPersona.get('apellido1').invalid && this.myFormPersona.get('apellido1').touched
  }

  get apellido2NoValido() {
    return this.myFormPersona.get('apellido2').invalid && this.myFormPersona.get('apellido2').touched
  }

  get diaNoValido() {
    return this.myFormPersona.get('dia').invalid && this.myFormPersona.get('dia').touched
  }

  get mesNoValido() {
    return this.myFormPersona.get('mes').invalid && this.myFormPersona.get('mes').touched
  }

  get anioNoValido() {
    return this.myFormPersona.get('anio').invalid && this.myFormPersona.get('anio').touched
  }

  get sexoNoValido() {
    return this.myFormPersona.get('sexo').invalid && this.myFormPersona.get('sexo').touched
  }

  get estadoNoValido() {
    return this.myFormPersona.get('estado').invalid && this.myFormPersona.get('estado').touched
  }

  guardarPersona(){

    if ( this.myFormPersona.invalid ) {

      return Object.values( this.myFormPersona.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else{
      this.crearPersona();
    }
  }

  crearCrup(){
    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    
    var datos = {
      curp : this.myFormCurp.value.curp,
    };

    var that = this;

    this.api_serv.postQuery(`curp`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        });

        that.descargarGuia(that.num_guia);

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });
  }

  crearPersona(){
    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    
    var datos = {
      nombre : this.myFormPersona.value.nombre,
      apellido1 : this.myFormPersona.value.apellido1,
      apellido2 : this.myFormPersona.value.apellido2,
      dia : this.myFormPersona.value.dia,
      mes : this.myFormPersona.value.mes,
      anio : this.myFormPersona.value.anio,
      sexo : this.myFormPersona.value.sexo,
      estado : this.myFormPersona.value.estado,
    };

    var that = this;

    this.api_serv.postQuery(`curp`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        });

        that.descargarGuia(that.num_guia);

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });
  }

  aRastrearGuia(obj): void {
    this.objAOperar = obj;
    this.num_guia = this.objAOperar.guia;

    this.closeAllModals();

    if(this.objAOperar.api == 5 || this.objAOperar.api == 7 || this.objAOperar.api == 4){
      this.rastrearGuia(this.num_guia);
    }/*else if(this.objAOperar.api == 7){
      setTimeout(()=>{
        this.openModal('#modalRastreoIframe');
      },60);
    }*/else{
      Swal.fire({
        title: 'Info',
        text: 'Rastreo no disponible para esta API',
        icon: 'info',
      });
    }

  }

  rastrearGuia(guia){

    this.rastreo_Status = null;
    this.rastreo_TrackingData = [];

    Swal.fire({
      title: 'Espere',
      text: 'Rastreando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`guias/rastrear?guia=${guia}`)
    .subscribe({
      next(data : any) {
        console.log(data);

        Swal.close ();
        that.loading = false;

        that.closeAllModals();

        if(data.api == 5 || data.api == 4){

          if(!data.flag_rastreo){
            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });
          }else{
            that.rastreo_Status = data.Status;
            that.rastreo_TrackingData = data.TrackingData;
            setTimeout(()=>{
              that.openModal('#modalRastreoTeiker');
            },60);
          }
          
        }else if(data.api == 7){

          if(!data.flag_rastreo){
            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });
          }else{
            that.rastreo_Status = data.Status;
            that.rastreo_TrackingData = data.TrackingData;
            setTimeout(()=>{
              that.openModal('#modalRastreoTeiker');
            },60);
          }
          
        }

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  esFechaValida(createdAt: string): boolean {
    const fechaCreacion = new Date(createdAt);
    const fechaLimite = new Date('2025-06-01T00:00:00Z'); // 1 de junio de 2025, 00:00:00 UTC

    // Retorna true si fechaCreacion es mayor o igual que fechaLimite
    return fechaCreacion >= fechaLimite;
  }

  aEliminar(obj): void {
    this.objAOperar = obj;
    this.num_guia = this.objAOperar.id;

    this.eliminarGuia();
  }

  eliminarGuia(){
    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea eliminar la orden #${this.num_guia}`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {

        Swal.fire({
          title: 'Espere',
          text: 'Ejecutando',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();

        var that = this;

        this.api_serv.deleteQuery(`guias/eliminar_pendiente/${this.num_guia}`)
        .subscribe({
          next(data : any) {
            console.log(data);

            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });

            
            // Actualizar la lista después de eliminar el elemento
            that.listado = that.listado.filter((item : any) => item.id !== that.num_guia);

            that.objAOperar = null;
            that.num_guia = null;

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
