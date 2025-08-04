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

declare var Conekta: any;

declare let paypal: any;

declare var $:any;

declare interface DataTable {
    headerRow: string[];
    //footerRow: string[];
    dataRows: any[];
}


@Component({
    selector: 'nuevo-envio-prepagado-cmp',
    templateUrl: 'nuevo-envio-prepagado.component.html',
    styleUrls: ['./nuevo-envio-prepagado.component.css'],
})


export class NuevoEnvioPrepagadoComponent implements OnInit, OnDestroy{
    
  private data:any;
  private datos:any;
  public loading = false;

  cotizacion_id = null;

  corregir = false;
  origenes = [];
  destinos = [];

  myFormRemitente: FormGroup;
  myFormDestino: FormGroup;

  coloniasR = [];
  coloniasD = [];

  flujo = 1;

  user : any = null;

  origenesFilter = [];
  destinosFilter = [];

  paquetes = [];
  paquetesFilter = [];

  paquete_id = null;
  paquete_alias = null;
  paquete_guias = null;
  paquete_precio = null;
  flag_recoleccion = false;

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

      this.crearFormRemitente();
      this.crearListenersFormRemitente();
      this.crearFormDestino();
      this.crearListenersFormDestino();

      setTimeout(()=>{
        //this.misRemitentes();
        this.misPaquetes();
      },500);
      

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
    $(modal_id).modal({ keyboard: false, backdrop: 'static' });   
    $(modal_id).modal('show');           
  }

  openModal2(modal_id){  
    $(modal_id).modal('show');           
  }

  closeModal(modal_id){
    $(modal_id).modal('hide');
  }

  misRemitentes(): void {

    this.origenes = [];
    this.destinos = [];

    //this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`direcciones/mis/remitentes`)
    .subscribe({
      next(data : any) {
        console.log(data);
          
        that.origenes = data.direcciones;
        that.destinos = data.direcciones;   
        //that.loading = false;    

      },
      error(msg) {
        console.log(msg);
        // that.loading = false;
        // that.tratarError(msg);
      }
    });

  }

  crearFormRemitente() {

    let rfc = 'XAXX010101000';
    if(this.user.validado == 1 && this.user.rfc != null && this.user.rfc != ''){
      rfc = this.user.rfc;
    }

    this.myFormRemitente = this.fb.group({
      cp  : ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern('^[0-9]+$') ]  ],
      alias  : ['', [ Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      calle  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(24), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      colonia  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      referencia  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(25), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      num_interior  : ['', [ Validators.minLength(2), Validators.maxLength(5), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      num_exterior  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(5), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      ciudad  : [{value:'', disabled: true}, [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      ciudad2  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      estado  : [{value:'', disabled: true}, [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      estado_code  : ['', [ Validators.required ]  ],
      estado2  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      empresa  : ['', [ Validators.minLength(2), Validators.maxLength(28), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      nombre  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(14), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      apellido  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(14), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      email  : ['atn@nennuu.mx', [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$') ]  ],
      telefono  : ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$') ]  ],
      rfc  : [rfc, [ Validators.required, Validators.minLength(13), Validators.maxLength(13), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      cotizacion_id  : [''],
      zipcode_valid  : [false],
      guardar  : [false],
      rfc_bandera  : [false],
      actualizar  : [false],
      id  : [''],
      actualizar_bandera  : [false],
      radios_dir  : [''],
      buscar  : [''],
    });     
       
  }

  crearListenersFormRemitente(){

    this.myFormRemitente.get('cp').valueChanges.subscribe( valor => {
      if(valor.length == 5){
        this.validarZipcode(valor, 0);        
      }else{
        this.myFormRemitente.patchValue({zipcode_valid : false});
      }
    }); 

    this.myFormRemitente.get('rfc_bandera').valueChanges.subscribe( valor => {
      if(!valor){
        let rfc = 'XAXX010101000';
        if(this.user.validado == 1 && this.user.rfc != null && this.user.rfc != ''){
          rfc = this.user.rfc;
        }
        this.myFormRemitente.patchValue({rfc : rfc});        
      }else{
        let rfc2 = '';
        if(this.user.validado == 1 && this.user.rfc != null && this.user.rfc != ''){
          rfc2 = this.user.rfc;
        }
        this.myFormRemitente.patchValue({rfc : rfc2});
      }
    });

    this.myFormRemitente.get('radios_dir').valueChanges.subscribe( valor => {
      if(valor == '1'){
        //console.log('actualizar');
        this.myFormRemitente.patchValue({actualizar : true});
        this.myFormRemitente.patchValue({guardar : false});
      }
      if(valor == '2'){
        //console.log('guardar');
        this.myFormRemitente.patchValue({actualizar : false});
        this.myFormRemitente.patchValue({guardar : true});
      } 
    });

    this.myFormRemitente.get('buscar').valueChanges.subscribe( valor => {
      if(valor.length >= 1){

        let searchLowerCase = valor.toLowerCase();

        this.origenesFilter = this.origenes.filter( item =>
          item.nombre.toLowerCase().includes( searchLowerCase ) ||
          item.apellido.toLowerCase().includes( searchLowerCase ) ||
          item.cp.toLowerCase().includes( searchLowerCase )
        );

      }else{
        this.origenesFilter = [];
      }
    });

  }

  cargarDataFormRemitente() {
    let rfc = 'XAXX010101000';
    if(this.user.validado == 1 && this.user.rfc != null && this.user.rfc != ''){
      rfc = this.user.rfc;
    }

    this.myFormRemitente.patchValue({cp : ''});
    this.myFormRemitente.patchValue({alias : ''});
    this.myFormRemitente.patchValue({calle : ''});
    this.myFormRemitente.patchValue({colonia : ''});
    this.myFormRemitente.patchValue({referencia : ''});
    this.myFormRemitente.patchValue({num_interior : ''});
    this.myFormRemitente.patchValue({num_exterior : ''});
    this.myFormRemitente.patchValue({ciudad : ''});
    this.myFormRemitente.patchValue({ciudad2 : ''});
    this.myFormRemitente.patchValue({estado : ''});
    this.myFormRemitente.patchValue({estado_code : ''});
    this.myFormRemitente.patchValue({estado2 : ''});
    this.myFormRemitente.patchValue({empresa : ''});
    this.myFormRemitente.patchValue({nombre : ''});
    this.myFormRemitente.patchValue({apellido : ''});
    this.myFormRemitente.patchValue({email : 'atn@nennuu.mx'});
    this.myFormRemitente.patchValue({telefono : ''});
    this.myFormRemitente.patchValue({rfc : rfc});
    this.myFormRemitente.patchValue({cotizacion_id : ''});
    this.myFormRemitente.patchValue({zipcode_valid : false});
    this.myFormRemitente.patchValue({guardar : false});
    this.myFormRemitente.patchValue({rfc_bandera : false});
    this.myFormRemitente.patchValue({actualizar : false});
    this.myFormRemitente.patchValue({id : ''});
    this.myFormRemitente.patchValue({actualizar_bandera : false});
    this.myFormRemitente.patchValue({radios_dir : ''});
    this.myFormRemitente.patchValue({buscar : ''});
  }

  get r_cpNoValido() {
    return this.myFormRemitente.get('cp').invalid && this.myFormRemitente.get('cp').touched
  }

  get r_aliasNoValido() {
    return this.myFormRemitente.get('alias').invalid && this.myFormRemitente.get('alias').touched
  }

  get r_calleNoValido() {
    return this.myFormRemitente.get('calle').invalid && this.myFormRemitente.get('calle').touched
  }

  get r_coloniaNoValido() {
    return this.myFormRemitente.get('colonia').invalid && this.myFormRemitente.get('colonia').touched
  }

  get r_referenciaNoValido() {
    return this.myFormRemitente.get('referencia').invalid && this.myFormRemitente.get('referencia').touched
  }

  get r_num_interiorNoValido() {
    return this.myFormRemitente.get('num_interior').invalid && this.myFormRemitente.get('num_interior').touched
  }

  get r_num_exteriorNoValido() {
    return this.myFormRemitente.get('num_exterior').invalid && this.myFormRemitente.get('num_exterior').touched
  }

  get r_ciudadNoValido() {
    return this.myFormRemitente.get('ciudad').invalid && this.myFormRemitente.get('ciudad').touched
  }

  get r_estadoNoValido() {
    return this.myFormRemitente.get('estado').invalid && this.myFormRemitente.get('estado').touched
  }

  get r_empresaNoValido() {
    return this.myFormRemitente.get('empresa').invalid && this.myFormRemitente.get('empresa').touched
  }

  get r_nombreNoValido() {
    return this.myFormRemitente.get('nombre').invalid && this.myFormRemitente.get('nombre').touched
  }

  get r_apellidoNoValido() {
    return this.myFormRemitente.get('apellido').invalid && this.myFormRemitente.get('apellido').touched
  }

  get r_emailNoValido() {
    return this.myFormRemitente.get('email').invalid && this.myFormRemitente.get('email').touched
  }

  get r_telefonoNoValido() {
    return this.myFormRemitente.get('telefono').invalid && this.myFormRemitente.get('telefono').touched
  }

  get r_rfcNoValido() {
    return this.myFormRemitente.get('rfc').invalid && this.myFormRemitente.get('rfc').touched
  }

  changeSetOrigen(id){
    console.log(id);
    let colonia = null;
    for (var i = 0; i < this.origenes.length; ++i) {
      if(id == this.origenes[i].id){
        this.myFormRemitente.patchValue({cp : this.origenes[i].cp});
        this.myFormRemitente.patchValue({alias : this.origenes[i].alias});
        this.myFormRemitente.patchValue({calle : this.origenes[i].calle});
        //this.myFormRemitente.patchValue({colonia : this.origenes[i].colonia});
        this.myFormRemitente.patchValue({referencia : this.origenes[i].referencia});
        this.myFormRemitente.patchValue({num_interior : this.origenes[i].num_interior});
        this.myFormRemitente.patchValue({num_exterior : this.origenes[i].num_exterior});
        this.myFormRemitente.patchValue({ciudad : this.origenes[i].ciudad});
        this.myFormRemitente.patchValue({ciudad2 : this.origenes[i].ciudad});
        this.myFormRemitente.patchValue({estado : this.origenes[i].estado});
        this.myFormRemitente.patchValue({estado_code : this.origenes[i].estado_code});
        this.myFormRemitente.patchValue({estado2 : this.origenes[i].estado});
        this.myFormRemitente.patchValue({empresa : this.origenes[i].empresa});
        this.myFormRemitente.patchValue({nombre : this.origenes[i].nombre});
        this.myFormRemitente.patchValue({apellido : this.origenes[i].apellido});
        // this.myFormRemitente.patchValue({email : this.origenes[i].email});
        this.myFormRemitente.patchValue({telefono : this.origenes[i].telefono});
        this.myFormRemitente.patchValue({rfc : this.origenes[i].rfc});
        this.myFormRemitente.patchValue({cotizacion_id : ''});
        this.myFormRemitente.patchValue({zipcode_valid : true});
        this.myFormRemitente.patchValue({guardar : false});
        if (this.origenes[i].rfc == 'XAXX010101000') {
          this.myFormRemitente.patchValue({rfc_bandera : false});
        }else{
          this.myFormRemitente.patchValue({rfc_bandera : true});
        }
        colonia = this.origenes[i].colonia;
        this.myFormRemitente.patchValue({actualizar : false});
        this.myFormRemitente.patchValue({id : this.origenes[i].id});
        this.myFormRemitente.patchValue({actualizar_bandera : true});
        this.myFormRemitente.patchValue({radios_dir : ''});

        this.origenesFilter = [];
        this.myFormRemitente.patchValue({buscar : ''});
      }
    }

    setTimeout(()=>{
      for (var j = 0; j < this.coloniasR.length; ++j) {
        if(colonia == this.coloniasR[j]){
          this.myFormRemitente.patchValue({colonia : this.coloniasR[j]});
        }
      }
    },2000);
    
  }

  changeSetColoniaR(event){
    console.log(event);
  }

  crearFormDestino() {

    this.myFormDestino = this.fb.group({
      cp  : ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern('^[0-9]+$') ]  ],
      alias  : ['', [ Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      calle  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(24), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      colonia  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      referencia  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(25), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      num_interior  : ['', [ Validators.minLength(2), Validators.maxLength(5), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      num_exterior  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(5), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      ciudad  : [{value:'', disabled: true}, [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      ciudad2  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      estado  : [{value:'', disabled: true}, [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      estado_code  : ['', [ Validators.required ]  ],
      estado2  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      empresa  : ['', [ Validators.minLength(2), Validators.maxLength(28), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      nombre  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(14), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      apellido  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(14), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      email  : ['atn@nennuu.mx', [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$') ]  ],
      telefono  : ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$') ]  ],
      rfc  : ['XAXX010101000', [ Validators.required, Validators.minLength(13), Validators.maxLength(13), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      cotizacion_id  : [''],
      zipcode_valid  : [false],
      guardar  : [false],
      rfc_bandera  : [false],
      actualizar  : [false],
      id  : [''],
      actualizar_bandera  : [false],
      radios_dir  : [''],
      buscar  : [''],
    });     
       
  }

  cargarDataFormDestino() {
    this.myFormDestino.patchValue({cp : ''});
    this.myFormDestino.patchValue({alias : ''});
    this.myFormDestino.patchValue({calle : ''});
    this.myFormDestino.patchValue({colonia : ''});
    this.myFormDestino.patchValue({referencia : ''});
    this.myFormDestino.patchValue({num_interior : ''});
    this.myFormDestino.patchValue({num_exterior : ''});
    this.myFormDestino.patchValue({ciudad : ''});
    this.myFormDestino.patchValue({ciudad2 : ''});
    this.myFormDestino.patchValue({estado : ''});
    this.myFormDestino.patchValue({estado_code : ''});
    this.myFormDestino.patchValue({estado2 : ''});
    this.myFormDestino.patchValue({empresa : ''});
    this.myFormDestino.patchValue({nombre : ''});
    this.myFormDestino.patchValue({apellido : ''});
    this.myFormDestino.patchValue({email : 'atn@nennuu.mx'});
    this.myFormDestino.patchValue({telefono : ''});
    this.myFormDestino.patchValue({rfc : 'XAXX010101000'});
    this.myFormDestino.patchValue({cotizacion_id : ''});
    this.myFormDestino.patchValue({zipcode_valid : false});
    this.myFormDestino.patchValue({guardar : false});
    this.myFormDestino.patchValue({rfc_bandera : false});
    this.myFormDestino.patchValue({actualizar : false});
    this.myFormDestino.patchValue({id : ''});
    this.myFormDestino.patchValue({actualizar_bandera : false});
    this.myFormDestino.patchValue({radios_dir : ''});
    this.myFormDestino.patchValue({buscar : ''});
  }

  crearListenersFormDestino(){

    this.myFormDestino.get('cp').valueChanges.subscribe( valor => {
      if(valor.length == 5){
        this.validarZipcode(valor, 1);        
      }else{
        this.myFormDestino.patchValue({zipcode_valid : false});
      }
    }); 

    this.myFormDestino.get('rfc_bandera').valueChanges.subscribe( valor => {
      if(!valor){
        this.myFormDestino.patchValue({rfc : 'XAXX010101000'});        
      }else{
        this.myFormDestino.patchValue({rfc : ''});
      }
    });

    this.myFormDestino.get('radios_dir').valueChanges.subscribe( valor => {
      if(valor == '1'){
        //console.log('actualizar');
        this.myFormDestino.patchValue({actualizar : true});
        this.myFormDestino.patchValue({guardar : false});
      }
      if(valor == '2'){
        //console.log('guardar');
        this.myFormDestino.patchValue({actualizar : false});
        this.myFormDestino.patchValue({guardar : true});
      } 
    });

    this.myFormDestino.get('buscar').valueChanges.subscribe( valor => {
      if(valor.length >= 1){

        let searchLowerCase = valor.toLowerCase();

        this.destinosFilter = this.destinos.filter( item =>
          item.nombre.toLowerCase().includes( searchLowerCase ) ||
          item.apellido.toLowerCase().includes( searchLowerCase ) ||
          item.cp.toLowerCase().includes( searchLowerCase )
        );

      }else{
        this.destinosFilter = [];
      }
    });

  }

  get d_cpNoValido() {
    return this.myFormDestino.get('cp').invalid && this.myFormDestino.get('cp').touched
  }

  get d_aliasNoValido() {
    return this.myFormDestino.get('alias').invalid && this.myFormDestino.get('alias').touched
  }

  get d_calleNoValido() {
    return this.myFormDestino.get('calle').invalid && this.myFormDestino.get('calle').touched
  }

  get d_coloniaNoValido() {
    return this.myFormDestino.get('colonia').invalid && this.myFormDestino.get('colonia').touched
  }

  get d_referenciaNoValido() {
    return this.myFormDestino.get('referencia').invalid && this.myFormDestino.get('referencia').touched
  }

  get d_num_interiorNoValido() {
    return this.myFormDestino.get('num_interior').invalid && this.myFormDestino.get('num_interior').touched
  }

  get d_num_exteriorNoValido() {
    return this.myFormDestino.get('num_exterior').invalid && this.myFormDestino.get('num_exterior').touched
  }

  get d_ciudadNoValido() {
    return this.myFormDestino.get('ciudad').invalid && this.myFormDestino.get('ciudad').touched
  }

  get d_estadoNoValido() {
    return this.myFormDestino.get('estado').invalid && this.myFormDestino.get('estado').touched
  }

  get d_empresaNoValido() {
    return this.myFormDestino.get('empresa').invalid && this.myFormDestino.get('empresa').touched
  }

  get d_nombreNoValido() {
    return this.myFormDestino.get('nombre').invalid && this.myFormDestino.get('nombre').touched
  }

  get d_apellidoNoValido() {
    return this.myFormDestino.get('apellido').invalid && this.myFormDestino.get('apellido').touched
  }

  get d_emailNoValido() {
    return this.myFormDestino.get('email').invalid && this.myFormDestino.get('email').touched
  }

  get d_telefonoNoValido() {
    return this.myFormDestino.get('telefono').invalid && this.myFormDestino.get('telefono').touched
  }

  get d_rfcNoValido() {
    return this.myFormDestino.get('rfc').invalid && this.myFormDestino.get('rfc').touched
  }

  changeSetDestino(id){
    console.log(id);
    let colonia = null;
    for (var i = 0; i < this.destinos.length; ++i) {
      if(id == this.destinos[i].id){
        this.myFormDestino.patchValue({cp : this.destinos[i].cp});
        this.myFormDestino.patchValue({alias : this.destinos[i].alias});
        this.myFormDestino.patchValue({calle : this.destinos[i].calle});
        //this.myFormDestino.patchValue({colonia : this.destinos[i].colonia});
        this.myFormDestino.patchValue({referencia : this.destinos[i].referencia});
        this.myFormDestino.patchValue({num_interior : this.destinos[i].num_interior});
        this.myFormDestino.patchValue({num_exterior : this.destinos[i].num_exterior});
        this.myFormDestino.patchValue({ciudad : this.destinos[i].ciudad});
        this.myFormDestino.patchValue({ciudad2 : this.destinos[i].ciudad});
        this.myFormDestino.patchValue({estado : this.destinos[i].estado});
        this.myFormDestino.patchValue({estado_code : this.destinos[i].estado_code});
        this.myFormDestino.patchValue({estado2 : this.destinos[i].estado});
        this.myFormDestino.patchValue({empresa : this.destinos[i].empresa});
        this.myFormDestino.patchValue({nombre : this.destinos[i].nombre});
        this.myFormDestino.patchValue({apellido : this.destinos[i].apellido});
        // this.myFormDestino.patchValue({email : this.destinos[i].email});
        this.myFormDestino.patchValue({telefono : this.destinos[i].telefono});
        this.myFormDestino.patchValue({rfc : this.destinos[i].rfc});
        this.myFormDestino.patchValue({cotizacion_id : ''});
        this.myFormDestino.patchValue({zipcode_valid : true});
        this.myFormDestino.patchValue({guardar : false});
        if (this.destinos[i].rfc == 'XAXX010101000') {
          this.myFormDestino.patchValue({rfc_bandera : false});
        }else{
          this.myFormDestino.patchValue({rfc_bandera : true});
        }
        colonia = this.destinos[i].colonia;
        this.myFormDestino.patchValue({actualizar : false});
        this.myFormDestino.patchValue({id : this.destinos[i].id});
        this.myFormDestino.patchValue({actualizar_bandera : true});
        this.myFormDestino.patchValue({radios_dir : ''});

        this.destinosFilter = [];
        this.myFormDestino.patchValue({buscar : ''});
      }
    }

    setTimeout(()=>{
      for (var j = 0; j < this.coloniasD.length; ++j) {
        if(colonia == this.coloniasD[j]){
          this.myFormDestino.patchValue({colonia : this.coloniasD[j]});
        }
      }
    },2000);

  }

  validarDirecciones(){

    if(!this.paquete_id){
      Swal.fire({
        title: 'Warning',
        text: 'Seleccione un paquete',
        icon: 'warning'
      });
    }else{

      console.log( this.myFormRemitente ); 
      console.log( this.myFormDestino );

      this.myFormRemitente.patchValue({cotizacion_id : this.cotizacion_id});
      this.myFormDestino.patchValue({cotizacion_id : this.cotizacion_id});

      if(!this.myFormRemitente.value.guardar && !this.myFormRemitente.value.actualizar){
        if(this.myFormRemitente.value.alias.length < 2){
          this.myFormRemitente.patchValue({alias : 'Remitente'});
        }  
      }
      if(!this.myFormDestino.value.guardar && !this.myFormDestino.value.actualizar){
        if(this.myFormDestino.value.alias.length < 2){
          this.myFormDestino.patchValue({alias : 'Destino'});
        }     
      }

      if(this.myFormRemitente.value.empresa == ''){
        this.myFormRemitente.patchValue({empresa : 'Particular'});
      }
      if(this.myFormDestino.value.empresa == ''){
        this.myFormDestino.patchValue({empresa : 'Particular'});
      }
      
      if((this.myFormRemitente.value.guardar || this.myFormRemitente.value.actualizar) &&
        (this.myFormRemitente.value.alias == '' || this.myFormRemitente.value.alias.length < 2)){
        Swal.fire({
          title: 'Warning',
          text: 'Álias Remitente Inválido',
          icon: 'warning'
        });
      }else if(!this.myFormRemitente.value.zipcode_valid){
        Swal.fire({
          title: 'Warning',
          text: 'CP Remitente Inválido',
          icon: 'warning'
        });
      }else if ( this.myFormRemitente.invalid ) {

        Swal.fire({
          title: 'Warning',
          text: 'Campos Inválidos en Origen',
          icon: 'warning'
        });

        return Object.values( this.myFormRemitente.controls ).forEach( control => {
          
          if ( control instanceof FormGroup ) {
            Object.values( control.controls ).forEach( control => control.markAsTouched() );
          } else {
            control.markAsTouched();
          }
   
        });
       
      }else if((this.myFormDestino.value.guardar || this.myFormDestino.value.actualizar) &&
        (this.myFormDestino.value.alias == '' || this.myFormDestino.value.alias.length < 2)){
        Swal.fire({
          title: 'Warning',
          text: 'Álias Destino Inválido',
          icon: 'warning'
        });
      }else if(!this.myFormDestino.value.zipcode_valid){
        Swal.fire({
          title: 'Warning',
          text: 'CP Destino Inválido',
          icon: 'warning'
        });
      }else if ( this.myFormDestino.invalid ) {

        Swal.fire({
          title: 'Warning',
          text: 'Campos Inválidos en Destino',
          icon: 'warning'
        });

        return Object.values( this.myFormDestino.controls ).forEach( control => {
          
          if ( control instanceof FormGroup ) {
            Object.values( control.controls ).forEach( control => control.markAsTouched() );
          } else {
            control.markAsTouched();
          }
   
        });
       
      }else{
        this.crearGuia();
      }
    }

  }

  validarZipcode (zipcode, bandera) {

    if(bandera == 0){
      this.coloniasR = [];
      this.myFormRemitente.patchValue({colonia : ''});
      this.myFormRemitente.patchValue({ciudad : ''});
      this.myFormRemitente.patchValue({ciudad2 : ''});
      this.myFormRemitente.patchValue({estado : ''});
      this.myFormRemitente.patchValue({estado_code : ''});
      this.myFormRemitente.patchValue({estado2 : ''});
      this.myFormRemitente.patchValue({zipcode_valid : false});
    }

    if(bandera == 1){
      this.coloniasD = [];
      this.myFormDestino.patchValue({colonia : ''});
      this.myFormDestino.patchValue({ciudad : ''});
      this.myFormDestino.patchValue({ciudad2 : ''}); 
      this.myFormDestino.patchValue({estado : ''});
      this.myFormDestino.patchValue({estado_code : ''});
      this.myFormDestino.patchValue({estado2 : ''});
      this.myFormDestino.patchValue({zipcode_valid : false});     
    }

    Swal.fire({
      title: 'Espere',
      text: 'Validando Código Postal',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    //this.api_serv.getQuery(`cotizador/generico/zipcodes/${ zipcode }?country=MX`)
    this.api_serv.getQueryServ(`cotizador/generico/zipcodes/${ zipcode }?country=MX`)
    //this.api_serv.getQueryGoopy(`cotizador/zipcodes/${ zipcode }?country=MX`)
    .subscribe({
      next(data : any) {
        
        console.log(data);
         that.data=data;

         Swal.close ();

           if(bandera == 0){
            that.coloniasR = that.data.mi_envio.neighborhoods_list;
            that.myFormRemitente.patchValue({colonia : that.coloniasR[0]});
            that.myFormRemitente.patchValue({ciudad : that.data.mi_envio.municipality});
            that.myFormRemitente.patchValue({estado : that.data.mi_envio.state.name});
            that.myFormRemitente.patchValue({estado_code : that.data.mi_envio.state.code});
            that.myFormRemitente.patchValue({ciudad2 : that.data.mi_envio.municipality});
            that.myFormRemitente.patchValue({estado2 : that.data.mi_envio.state.name});
            that.myFormRemitente.patchValue({zipcode_valid : true});
          }

          if(bandera == 1){
            that.coloniasD = that.data.mi_envio.neighborhoods_list;
            that.myFormDestino.patchValue({colonia : that.coloniasD[0]});
            that.myFormDestino.patchValue({ciudad : that.data.mi_envio.municipality});
            that.myFormDestino.patchValue({estado : that.data.mi_envio.state.name});
            that.myFormDestino.patchValue({estado_code : that.data.mi_envio.state.code});
            that.myFormDestino.patchValue({ciudad2 : that.data.mi_envio.municipality});
            that.myFormDestino.patchValue({estado2 : that.data.mi_envio.state.name});
            that.myFormDestino.patchValue({zipcode_valid : true});      
          }   

      },
      error(msg) {

         that.tratarError(msg);
          
      }
    });
  }

  misPaquetes(): void {

    this.paquetes = [];

    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    //this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`paquetes_prepagados/mis/paquetes`)
    .subscribe({
      next(data : any) {
        console.log(data);
          
        that.paquetes = data.coleccion;   
        //that.loading = false;
        
        if(that.paquetes.length > 0){
          Swal.close ();
          that.misRemitentes();
        }else{
          Swal.fire({
            title: 'Info',
            text: 'No tienes paquetes prepagados',
            icon: 'info',
          }); 
        } 

      },
      error(msg) {
        console.log(msg);
        // that.loading = false;
        // that.tratarError(msg);
      }
    });

  }

  changeSetPaquete(id){
    console.log(id);    
    this.flag_recoleccion = false;

    for (let index = 0; index < this.paquetes.length; index++) {
      if(this.paquetes[index].id == id){
        this.paquete_alias = this.paquetes[index].alias;
        this.paquete_guias = this.paquetes[index].count_disponibles;
        this.paquete_precio = this.paquetes[index].precio;
      }
      
    }
  }

  reiniciarCotizacion(){

    this.flujo = 1;
    this.scroll_to('id_scroll');

    let coti_id = this.cotizacion_id;


    Object.values( this.myFormRemitente.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });

    Object.values( this.myFormDestino.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });

    this.corregir = true;
    this.coloniasR = [];
    this.coloniasD = [];
    
    this.cargarDataFormRemitente();
    this.cargarDataFormDestino();
    

    setTimeout(()=>{
      this.corregir = false;
    },400);

    
  }

  crearGuia(): void {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea generar la guía`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

        if ( resp.value ) {

          Swal.fire({
            title: 'Espere',
            text: 'Generando la guía...',
            icon: 'info',
            allowOutsideClick: false
          });
          Swal.showLoading();
          this.loading = true;
          
          var datos = {
            
            O_cp  : this.myFormRemitente.value.cp,
            O_alias  : this.myFormRemitente.value.alias,
            O_calle  : this.myFormRemitente.value.calle,
            O_colonia  : this.myFormRemitente.value.colonia,
            O_referencia  : this.myFormRemitente.value.referencia,
            O_num_interior  : this.myFormRemitente.value.num_interior,
            O_num_exterior  : this.myFormRemitente.value.num_exterior,
            O_ciudad  : this.myFormRemitente.value.ciudad2,
            O_estado  : this.myFormRemitente.value.estado2,
            O_estado_code  : this.myFormRemitente.value.estado_code,
            O_empresa  : this.myFormRemitente.value.empresa,
            O_nombre  : this.myFormRemitente.value.nombre,
            O_apellido  : this.myFormRemitente.value.apellido,
            O_email  : this.myFormRemitente.value.email,
            O_telefono  : this.myFormRemitente.value.telefono,
            O_rfc  : this.myFormRemitente.value.rfc,
            // O_cotizacion_id  : this.myFormRemitente.value.cotizacion_id,
            O_guardar  : this.myFormRemitente.value.guardar,
            O_actualizar  : this.myFormRemitente.value.actualizar,
            O_id  : this.myFormRemitente.value.id,

            D_cp  : this.myFormDestino.value.cp,
            D_alias  : this.myFormDestino.value.alias,
            D_calle  : this.myFormDestino.value.calle,
            D_colonia  : this.myFormDestino.value.colonia,
            D_referencia  : this.myFormDestino.value.referencia,
            D_num_interior  : this.myFormDestino.value.num_interior,
            D_num_exterior  : this.myFormDestino.value.num_exterior,
            D_ciudad  : this.myFormDestino.value.ciudad2,
            D_estado  : this.myFormDestino.value.estado2,
            D_estado_code  : this.myFormDestino.value.estado_code,
            D_empresa  : this.myFormDestino.value.empresa,
            D_nombre  : this.myFormDestino.value.nombre,
            D_apellido  : this.myFormDestino.value.apellido,
            D_email  : this.myFormDestino.value.email,
            D_telefono  : this.myFormDestino.value.telefono,
            D_rfc  : this.myFormDestino.value.rfc,
            // D_cotizacion_id  : this.myFormDestino.value.cotizacion_id,
            D_guardar  : this.myFormDestino.value.guardar,
            D_actualizar  : this.myFormDestino.value.actualizar,
            D_id  : this.myFormDestino.value.id,

            paquete_id  : this.paquete_id,
            flag_recoleccion  : this.flag_recoleccion,

          };
          //console.log(datos);

          var that = this;

          this.api_serv.postQuery(`cotizador/crear/guia/prepagada`, datos)
          .subscribe({
            next(data : any) {
              console.log(data);
              /*Swal.fire({
                title: 'Info',
                text: data.message,
                icon: 'info',
              }); 
              that.loading = false; 
              //that.miSaldo(); 
              setTimeout(()=>{
                that.router.navigateByUrl('/mis-guias');
              },1000);*/

              that.descargarGuia(data.guia);

            },
            error(msg) {
              console.log(msg);
              that.loading = false;
              that.tratarError(msg);
              // setTimeout(()=>{
              //   that.router.navigateByUrl('/mis-guias');
              // },1000);
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


        //base 64
        if(data.bandera_metodo == 1){
          that.printPdfGuia(data.pdf);
        }
        //link
        else if(data.bandera_metodo == 2){
          let anchor = document.createElement("a");
          anchor.href = data.pdf;
          anchor.target = "_blank"
          anchor.click();
        }

        setTimeout(()=>{
          that.router.navigateByUrl('/dashboard');
        },800);

        

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

  printPdfGuia(your_base64){
    var fileblob = this.b64toBlob(your_base64, 'application/pdf');
    var url = window.URL.createObjectURL(fileblob); 

    let anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank"
    anchor.click();
  }

  async aCrearColonia(tipo) {
          
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: "Ingresa una colonia",
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Colonia" maxlength="30">`,
      focusConfirm: false,
      showCancelButton: true, // Habilitar botón de cancelar
      confirmButtonText: "Agregar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const colonia = (document.getElementById('swal-input1') as HTMLInputElement).value;
    
        if (!colonia || colonia.length > 30) {
          Swal.showValidationMessage("El campo Colonia es obligatorio y debe tener un máximo de 30 caracteres");
          return null;
        }
    
        return [colonia];
      }
    });
    
    if (isConfirmed && formValues) {
      const [colonia] = formValues;
      // Llamas a la función que necesitas pasando los valores

      //origen
      if(tipo == 1){
        let esta = false;

        for (let i = 0; i < this.coloniasR.length; i++) {
          if(colonia.toLowerCase() == this.coloniasR[i].toLowerCase()){
            this.myFormRemitente.patchValue({colonia : this.coloniasR[i]});
            esta = true;
          }
        }

        if(!esta){
          this.coloniasR.push(colonia);
          this.myFormRemitente.patchValue({colonia : colonia});
        }
      }

      //destino
      if(tipo == 2){
        let esta = false;

        for (let i = 0; i < this.coloniasD.length; i++) {
          if(colonia.toLowerCase() == this.coloniasD[i].toLowerCase()){
            this.myFormDestino.patchValue({colonia : this.coloniasD[i]});
            esta = true;
          }
        }

        if(!esta){
          this.coloniasD.push(colonia);
          this.myFormDestino.patchValue({colonia : colonia});
        }
      }

      
    }
  
  }

  

}
