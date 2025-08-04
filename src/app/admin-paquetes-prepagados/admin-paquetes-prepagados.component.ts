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
    selector: 'admin-paquetes-prepagados-cmp',
    templateUrl: 'admin-paquetes-prepagados.component.html',
    styleUrls: ['./admin-paquetes-prepagados.component.css'],
})


export class AdminPaquetesPrepagadosComponent implements OnInit, OnDestroy{
    
    private data:any;
    private datos:any;
    public loading = false;

    objAOperar = null;
    num_guia = null;

    bandera_init = null;

    public listado: any = [];

    public page: number = 0;
    public currentPage: number = 0;
    public search: string = '';
    public filter_model: string = 'PaquetePrepagado';

    @ViewChild('txtSearch') txtSearch! : ElementRef;

    flujo = 1;
    myFormPaquete: FormGroup;
    myFormCliente: FormGroup;

    servicios = [];

    public resumenPago = {
      "proveedor" : null,
      "imagen" : null,
      "servicio_tipo_aux" : null,
      "detalle" : null,
      "total" : null,

      "tipo": null,   
      "alto": null,
      "ancho": null,
      "largo": null,
      "peso": null,

      "cpR": null,
      "cpD": null,
    };

    public servSel = {
      "id" : null,
      "api" : null,
      "api_proveedor" : null,
      "comision" : null,
      "cotizacion_id": null,   
      "detalle": null,
      "imagen": null,
      "precio": null,
      "proveedor": null,
      "servicio_tipo": null,
      "servicio_tipo_aux": null,
      "total": null,
    };

    catalogoClientes = [];


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

      this.crearFormPaquete();
      this.crearListenersFormPaquete(); 
      this.crearFormCliente();
      this.crearListenersFormCliente(); 
      
    }

  ngOnInit(){

    this.getListado();
   
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

    this.api_serv.getQuery(`paquetes_prepagados`)
    .subscribe({
      next(data : any) {
        console.log(data);

        that.listado = data.coleccion;
        
        Swal.close ();

        if(that.listado.length > 0){
          that.currentPage = 1;
        }


      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  crearFormPaquete() {

    this.myFormPaquete = this.fb.group({
      largo  : ['', [ Validators.required, Validators.min(1), Validators.max(100) ]  ],
      ancho  : ['', [ Validators.required, Validators.min(1), Validators.max(100) ]  ],
      alto  : ['', [ Validators.required, Validators.min(1), Validators.max(100) ]  ],
      peso  : [{value:'', disabled: false}, [ Validators.required, Validators.min(1), Validators.max(70) ]  ],
      peso_volumetrico  : ['', [ Validators.required, Validators.min(1), Validators.max(70) ]  ],
      peso_cotizar  : ['', [ Validators.required, Validators.min(1), Validators.max(70) ]  ],
      tipo : ['Caja', [ Validators.required ]  ],
      cantidad  : [1, [ Validators.required, Validators.min(1) ]  ],
      descripcion  : ['', [ Validators.required, Validators.minLength(3), Validators.maxLength(25), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      valor_mercancia  : ['', [ Validators.required, Validators.min(100), Validators.max(10000) ]  ],
      claveProdServ  : ['01010101', [ Validators.required, Validators.minLength(3), Validators.maxLength(8) ]  ],
      descripcion_producto  : ['No existe en el catálogo', [ Validators.required, Validators.minLength(3), Validators.maxLength(100) ]  ],
      clave_unidad  : ['H87', [ Validators.required, Validators.minLength(3), Validators.maxLength(3) ]  ],
      nombre_unidad  : ['Pieza', [ Validators.required, Validators.minLength(3), Validators.maxLength(105) ]  ],
      carta_porteA  : ['01010101-No existe en el catálogo', [ Validators.required, Validators.minLength(3), Validators.maxLength(100) ]  ],
      carta_porteB  : ['H87-Pieza', [ Validators.required, Validators.minLength(3), Validators.maxLength(110) ]  ],
      alias  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],

      api : ['', [ Validators.required ]  ],

      cpR  : ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern('^[0-9]+$') ]  ],
      cpD  : ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern('^[0-9]+$') ]  ],
    
    });     
       
  }

  cargarDataFormPaquete(){
    this.myFormPaquete.patchValue({largo : ''});
    this.myFormPaquete.patchValue({ancho : ''});
    this.myFormPaquete.patchValue({alto : ''});
    this.myFormPaquete.patchValue({peso : ''});
    this.myFormPaquete.patchValue({peso_volumetrico : ''});
    this.myFormPaquete.patchValue({peso_cotizar : ''});
    this.myFormPaquete.patchValue({tipo : 'Caja'});
    this.myFormPaquete.patchValue({cantidad : 1});
    this.myFormPaquete.patchValue({descripcion : ''});
    this.myFormPaquete.patchValue({valor_mercancia : ''});
    this.myFormPaquete.patchValue({claveProdServ : '01010101'});
    this.myFormPaquete.patchValue({descripcion_producto : 'No existe en el catálogo'});
    this.myFormPaquete.patchValue({clave_unidad : 'H87'});
    this.myFormPaquete.patchValue({nombre_unidad : 'Pieza'});
    this.myFormPaquete.patchValue({cotizacion_id : ''});
    this.myFormPaquete.patchValue({carta_porteA : '01010101-No existe en el catálogo'});
    this.myFormPaquete.patchValue({carta_porteB : 'H87-Pieza'});
    this.myFormPaquete.patchValue({alias : ''});

    this.myFormPaquete.patchValue({api : ''});
    this.myFormPaquete.patchValue({cpR : ''});
    this.myFormPaquete.patchValue({cpD : ''});
  }

  crearListenersFormPaquete(){
    /*this.myFormPaquete.valueChanges.subscribe( valor => {
      this.servicios = [];
      //this.ressetServSel();
    });*/

    this.myFormPaquete.get('largo').valueChanges.subscribe( valor => {
      this.calcularPesoCotizar();
    });
    this.myFormPaquete.get('ancho').valueChanges.subscribe( valor => {
      this.calcularPesoCotizar();
    });
    this.myFormPaquete.get('alto').valueChanges.subscribe( valor => {
      this.calcularPesoCotizar();
    });
    this.myFormPaquete.get('peso').valueChanges.subscribe( valor => {
      this.calcularPesoCotizar();
    });

  
    this.myFormPaquete.get('tipo').valueChanges.subscribe(value => {
      const largoControl = this.myFormPaquete.get('largo');
      const anchoControl = this.myFormPaquete.get('ancho');
      const altoControl = this.myFormPaquete.get('alto');
      const pesoControl = this.myFormPaquete.get('peso');
      const peso_volumetricoControl = this.myFormPaquete.get('peso_volumetrico');
      const peso_cotizarControl = this.myFormPaquete.get('peso_cotizar');

      if (value === 'Tarima') {
        largoControl.setValidators([Validators.required, Validators.min(110), Validators.max(1000)]);
        anchoControl.setValidators([Validators.required, Validators.min(110), Validators.max(1000)]);
        altoControl.setValidators([Validators.required, Validators.min(110), Validators.max(1000)]);
        pesoControl.setValidators([Validators.required, Validators.min(70), Validators.max(1000)]);
        peso_volumetricoControl.setValidators([Validators.required, Validators.min(70), Validators.max(1000)]);
        peso_cotizarControl.setValidators([Validators.required, Validators.min(70), Validators.max(1000)]);
      } else {
        largoControl.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
        anchoControl.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
        altoControl.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
        pesoControl.setValidators([Validators.required, Validators.min(1), Validators.max(70)]);
        peso_volumetricoControl.setValidators([Validators.required, Validators.min(1), Validators.max(70)]);
        peso_cotizarControl.setValidators([Validators.required, Validators.min(1), Validators.max(70)]);
      }

      // Actualiza la validación y el estado del formulario
      largoControl.updateValueAndValidity();
      anchoControl.updateValueAndValidity();
      altoControl.updateValueAndValidity();
      pesoControl.updateValueAndValidity();
      peso_volumetricoControl.updateValueAndValidity();
      peso_cotizarControl.updateValueAndValidity();
    });
  

  }

  get largoNoValido() {
    return this.myFormPaquete.get('largo').invalid && this.myFormPaquete.get('largo').touched
  }

  get anchoNoValido() {
    return this.myFormPaquete.get('ancho').invalid && this.myFormPaquete.get('ancho').touched
  }

  get altoNoValido() {
    return this.myFormPaquete.get('alto').invalid && this.myFormPaquete.get('alto').touched
  }

  get pesoNoValido() {
    return this.myFormPaquete.get('peso').invalid && this.myFormPaquete.get('peso').touched
  }

  get cantidadNoValido() {
    return this.myFormPaquete.get('cantidad').invalid && this.myFormPaquete.get('cantidad').touched
  }

  get descripcionNoValido() {
    return this.myFormPaquete.get('descripcion').invalid && this.myFormPaquete.get('descripcion').touched
  }

  get valor_mercanciaNoValido() {
    return this.myFormPaquete.get('valor_mercancia').invalid && this.myFormPaquete.get('valor_mercancia').touched
  }

  get claveProdServNoValido() {
    return this.myFormPaquete.get('claveProdServ').invalid && this.myFormPaquete.get('claveProdServ').touched
  }

  get descripcion_productoNoValido() {
    return this.myFormPaquete.get('descripcion_producto').invalid && this.myFormPaquete.get('descripcion_producto').touched
  }

  get clave_unidadNoValido() {
    return this.myFormPaquete.get('clave_unidad').invalid && this.myFormPaquete.get('clave_unidad').touched
  }

  get nombre_unidadNoValido() {
    return this.myFormPaquete.get('nombre_unidad').invalid && this.myFormPaquete.get('nombre_unidad').touched
  }

  get carta_porteANoValido() {
    return this.myFormPaquete.get('carta_porteA').invalid && this.myFormPaquete.get('carta_porteA').touched
  }

  get carta_porteBNoValido() {
    return this.myFormPaquete.get('carta_porteB').invalid && this.myFormPaquete.get('carta_porteB').touched
  }

  get aliasNoValido() {
    return this.myFormPaquete.get('alias').invalid && this.myFormPaquete.get('alias').touched
  }

  get apiNoValido() {
    return this.myFormPaquete.get('api').invalid && this.myFormPaquete.get('api').touched
  }

  get cpRNoValido() {
    return this.myFormPaquete.get('cpR').invalid && this.myFormPaquete.get('cpR').touched
  }

  get cpDNoValido() {
    return this.myFormPaquete.get('cpD').invalid && this.myFormPaquete.get('cpD').touched
  }

  changeType(event){
    //console.log('event '+event);
    if(event == 'Sobre'){
      this.myFormPaquete.patchValue({largo : 1});
      this.myFormPaquete.patchValue({ancho : 1});
      this.myFormPaquete.patchValue({alto : 1});
      this.myFormPaquete.patchValue({peso : 1});
      this.myFormPaquete.controls['peso'].disable();
      this.calcularPesoCotizar();
    }else if(event == 'Caja' || event == 'Tarima'){
      this.myFormPaquete.patchValue({largo : ''});
      this.myFormPaquete.patchValue({ancho : ''});
      this.myFormPaquete.patchValue({alto : ''});
      this.myFormPaquete.patchValue({peso : ''});
      this.myFormPaquete.controls['peso'].enable();
    }

    return Object.values( this.myFormPaquete.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsUntouched() );
        } else {
          control.markAsUntouched();
        }
 
      });

  }

  calcularPesoCotizar(){
    let peso_masa = this.myFormPaquete.value.peso;
    let peso_volumetrico = 0;
    this.myFormPaquete.patchValue({peso_volumetrico : 0});
    let peso_cotizar = 0;
    this.myFormPaquete.patchValue({peso_cotizar : 0});

    peso_volumetrico = 
      (this.myFormPaquete.value.largo * this.myFormPaquete.value.ancho * this.myFormPaquete.value.alto) / 5000;
    peso_volumetrico = Math.ceil(peso_volumetrico);

    this.myFormPaquete.patchValue({peso_volumetrico : peso_volumetrico});

    if(peso_masa >= peso_volumetrico){
      peso_cotizar = peso_masa;
      this.myFormPaquete.patchValue({peso_cotizar : peso_masa});
    }else{
      peso_cotizar = peso_volumetrico;
      this.myFormPaquete.patchValue({peso_cotizar : peso_volumetrico});
    }

    // console.log('peso_masa '+peso_masa);
    // console.log('peso_volumetrico '+peso_volumetrico);
    // console.log('peso_cotizar '+peso_cotizar);

  }

  validarPaquete(){
    console.log( this.myFormPaquete ); 

    if ( this.myFormPaquete.invalid ) {

      Swal.fire({
        title: 'Warning',
        text: 'Completa los campos requeridos',
        icon: 'warning'
      });

      return Object.values( this.myFormPaquete.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else{
      this.cotizar();
    }

  }

  cotizar(): void {

    this.servicios = [];

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    let peso_masa = this.myFormPaquete.value.peso;

    if(this.myFormPaquete.value.tipo == "Sobre"){
      peso_masa = 1;
    }
    
    var datos = {
      largo  : this.myFormPaquete.value.largo,
      ancho  : this.myFormPaquete.value.ancho,
      alto  : this.myFormPaquete.value.alto,
      peso  : this.myFormPaquete.value.peso_cotizar,
      peso_masa  : peso_masa,
      peso_vol  : this.myFormPaquete.value.peso_volumetrico,
      tipo  : this.myFormPaquete.value.tipo,
      cantidad  : this.myFormPaquete.value.cantidad,
      descripcion  : this.myFormPaquete.value.descripcion,
      valor_mercancia  : this.myFormPaquete.value.valor_mercancia,
      claveProdServ  : this.myFormPaquete.value.claveProdServ,
      descripcion_producto  : this.myFormPaquete.value.descripcion_producto,
      clave_unidad  : this.myFormPaquete.value.clave_unidad,
      nombre_unidad  : this.myFormPaquete.value.nombre_unidad,
      alias  : this.myFormPaquete.value.alias,

      api  : this.myFormPaquete.value.api,
      cpR  : this.myFormPaquete.value.cpR,
      cpD  : this.myFormPaquete.value.cpD,
    };
    console.log(datos);

    var that = this;

    this.api_serv.postQuery(`cotizador/generico/cotizar_prepagado`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        that.servicios = data.servicios;
          
        Swal.fire({
          title: 'Info',
          text: that.servicios.length+' servicios disponibles',
          icon: 'info',
        });

        that.flujo = 3;
        that.scroll_to('id_scroll');

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  seleccionarServicio(servicio): void {

    this.servSel = {
      "id" : servicio.id,
      "api" : servicio.api,
      "api_proveedor" : servicio.api_proveedor,
      "comision" : servicio.comision,  
      "cotizacion_id": null,
      "detalle": servicio.detalle,
      "imagen": servicio.imagen,
      "precio": servicio.precio,
      "proveedor": servicio.proveedor,
      "servicio_tipo": servicio.servicio_tipo,
      "servicio_tipo_aux": servicio.servicio_tipo_aux,
      "total": servicio.total,
    };

    this.setResumenPagoFront();

    this.cargarDataFormCliente();

    this.flujo = 4;
    this.scroll_to('id_scroll');

  }

  setResumenPagoFront(){
    this.resumenPago = {
      "proveedor" : this.servSel.proveedor,
      "imagen" : this.servSel.imagen,
      "servicio_tipo_aux" : this.servSel.servicio_tipo_aux,
      "detalle" : this.servSel.detalle,
      "total" : this.servSel.total,

      "tipo": this.myFormPaquete.value.tipo,   
      "alto": this.myFormPaquete.value.alto,
      "ancho": this.myFormPaquete.value.ancho,
      "largo": this.myFormPaquete.value.largo,
      "peso": this.myFormPaquete.value.peso_cotizar,

      "cpR": this.myFormPaquete.value.cpR,

      "cpD": this.myFormPaquete.value.cpD,
    };
  }


  reiniciarCotizacion(){

    this.flujo = 2;
    this.scroll_to('id_scroll');

    Object.values( this.myFormPaquete.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });
    
    this.servicios = [];
    
    this.cargarDataFormPaquete();

    this.servSel = {
      "id" : null,
      "api" : null,
      "api_proveedor" : null,
      "comision" : null,
      "cotizacion_id": null,   
      "detalle": null,
      "imagen": null,
      "precio": null,
      "proveedor": null,
      "servicio_tipo": null,
      "servicio_tipo_aux": null,
      "total": null,
    };

    this.resumenPago = {
      "proveedor" : null,
      "imagen" : null,
      "servicio_tipo_aux" : null,
      "detalle" : null,
      "total" : null,

      "tipo": null,   
      "alto": null,
      "ancho": null,
      "largo": null,
      "peso": null,

      "cpR": null,

      "cpD": null,
    };

  }

  crearFormCliente() {

    this.myFormCliente = this.fb.group({
      
      usuario_id : ['', [ Validators.required ]  ],
      email : [{value:'', disabled: true}, [ Validators.required ]  ],
      precio  : ['', [ Validators.required, Validators.min(0) ]  ],
      count_asignadas  : ['', [ Validators.required, Validators.min(1) ]  ],
      buscar  : [''],

    });     
       
  }

  crearListenersFormCliente(){
    
    this.myFormCliente.get('buscar').valueChanges.subscribe( valor => {
      if(valor.length >= 2){

        this.getCatalogoClientes(valor);

      }else{
        this.catalogoClientes = [];
      }
    });

  }

  get emailNoValido() {
    return this.myFormCliente.get('usuario_id').invalid && this.myFormCliente.get('usuario_id').touched
  }

  get count_asignadasNoValido() {
    return this.myFormCliente.get('count_asignadas').invalid && this.myFormCliente.get('count_asignadas').touched
  }

  get precioNoValido() {
    return this.myFormCliente.get('precio').invalid && this.myFormCliente.get('precio').touched
  }

  cargarDataFormCliente(){

    this.catalogoClientes = [];

    this.myFormCliente.patchValue({usuario_id : ''});
    this.myFormCliente.patchValue({email : ''});
    this.myFormCliente.patchValue({precio : ''});
    this.myFormCliente.patchValue({count_asignadas : ''});
    this.myFormCliente.patchValue({buscar : ''});

    Object.values( this.myFormCliente.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });

  }

  getCatalogoClientes(termino): void {

    //this.loading = true;    
    var that = this;
    this.api_serv.getQuery(`usuarios/catalogo/clientes?termino=${ termino }`)
    .subscribe({
      next(data : any) {
        console.log(data);         
        that.catalogoClientes = data.clientes;   
        //that.loading = false;    
      },
      error(msg) {
        console.log(msg);
        //that.loading = false;
        //that.tratarError(msg);
      }
    });

  }

  changeSetCliente(id){
    console.log(id);    
    for (var i = 0; i < this.catalogoClientes.length; ++i) {
      if(id == this.catalogoClientes[i].id){
        
        this.myFormCliente.patchValue({usuario_id : this.catalogoClientes[i].id});
        this.myFormCliente.patchValue({email : this.catalogoClientes[i].email});
        this.myFormCliente.patchValue({buscar : ''});

        this.catalogoClientes = [];

      }
    }
  }

  validarCliente(){
    console.log( this.myFormCliente ); 

    if ( this.myFormCliente.invalid ) {

      Swal.fire({
        title: 'Warning',
        text: 'Completa los campos requeridos',
        icon: 'warning'
      });

      return Object.values( this.myFormCliente.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else{
      this.crearPaquete();
    }

  }

  aCrear(){
    this.reiniciarCotizacion();
  }

  toFlujo(flujo){

    this.flujo = flujo;
    this.scroll_to('id_scroll');

  }

  crearPaquete(): void {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea crear el paquete`,
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

        let peso_masa = this.myFormPaquete.value.peso;

        if(this.myFormPaquete.value.tipo == "Sobre"){
          peso_masa = 1;
        }
        
        var datos = {
          largo  : this.myFormPaquete.value.largo,
          ancho  : this.myFormPaquete.value.ancho,
          alto  : this.myFormPaquete.value.alto,
          peso  : this.myFormPaquete.value.peso_cotizar,
          peso_masa  : peso_masa,
          peso_vol  : this.myFormPaquete.value.peso_volumetrico,
          tipo  : this.myFormPaquete.value.tipo,
          cantidad  : this.myFormPaquete.value.cantidad,
          descripcion  : this.myFormPaquete.value.descripcion,
          valor_mercancia  : this.myFormPaquete.value.valor_mercancia,
          claveProdServ  : this.myFormPaquete.value.claveProdServ,
          descripcion_producto  : this.myFormPaquete.value.descripcion_producto,
          clave_unidad  : this.myFormPaquete.value.clave_unidad,
          nombre_unidad  : this.myFormPaquete.value.nombre_unidad,
          alias  : this.myFormPaquete.value.alias,

          cpR  : this.myFormPaquete.value.cpR,
          cpD  : this.myFormPaquete.value.cpD,

          api  : this.servSel.api,
          api_proveedor  : this.servSel.api_proveedor,
          proveedor  : this.servSel.proveedor,
          servicio_tipo  : this.servSel.servicio_tipo,
          servicio_tipo_aux  : this.servSel.servicio_tipo_aux,

          usuario_id  : this.myFormCliente.value.usuario_id,
          precio  : this.myFormCliente.value.precio,
          count_asignadas  : this.myFormCliente.value.count_asignadas,

        };
        //console.log(datos);

        var that = this;

        this.api_serv.postQuery(`paquetes_prepagados`, datos)
        .subscribe({
          next(data : any) {
            console.log(data);

            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            }); 

            that.flujo = 1;
            that.scroll_to('id_scroll');
            that.getListado();

          },
          error(msg) {
            console.log(msg);
            that.tratarError(msg);
          }
        });

      }

    });

  }

  aEliminar(obj): void {

    this.objAOperar = obj;

    this.eliminar();
    
  }

  eliminar(){

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea eliminar el paquete`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

        if ( resp.value ) {

            var datos= {
            };

            Swal.fire({
              title: 'Espere',
              text: 'Ejecutando...',
              icon: 'info',
              allowOutsideClick: false
            });
            Swal.showLoading();

            var that = this;

            this.api_serv.deleteQuery(`paquetes_prepagados/${ this.objAOperar.id }`)
            .subscribe({
              next(data : any) {
                console.log(data);

                Swal.fire({
                  title: 'Info',
                  text: data.message,
                  icon: 'info',
                });

                // Actualizar la lista después de eliminar el elemento
                that.listado = that.listado.filter((item : any) => item.id !== that.objAOperar.id);


              },
              error(msg) {
                console.log(msg);
                //console.log(msg.error.error);
                that.tratarError(msg);

              }
            });

        }

    });

  }
            
}

