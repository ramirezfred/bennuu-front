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
    selector: 'admin-facturas-cmp',
    templateUrl: 'admin-facturas.component.html',
    styleUrls: ['./admin-facturas.component.css'],
})


export class AdminFacturasComponent implements OnInit, OnDestroy{
    
    private data:any;
    private datos:any;
    public loading = false;

    objAOperar = null;
    num_guia = null;

    f_desde = null;
    isValidDateDesdeFormat: boolean;
    f_hasta = null;
    isValidDateHastaFormat: boolean;

    @ViewChild('dateInputA') dateInputA! : ElementRef;
    @ViewChild('dateInputB') dateInputB! : ElementRef;

    termino_selector = '';

    noFacturadas = [];

    public listado: any = [];

    public page: number = 0;
    public currentPage: number = 0;
    public search: string = '';
    public filter_model: string = 'MovimientoAdmin';

    @ViewChild('txtSearch') txtSearch! : ElementRef;

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
      

    }

  ngOnInit(){

   //  Activate the tooltips
    $('[rel="tooltip"]').tooltip();


    $('.datepicker').datetimepicker({
        format: 'DD/MM/YYYY',    //use this format if you want the 12hours timpiecker with AM/PM toggle
        icons: {
            time: "fa fa-clock-o",
            date: "fa fa-calendar",
            up: "fa fa-chevron-up",
            down: "fa fa-chevron-down",
            previous: 'fa fa-chevron-left',
            next: 'fa fa-chevron-right',
            today: 'fa fa-screenshot',
            clear: 'fa fa-trash',
            close: 'fa fa-remove'
        }
     });

    setTimeout(()=>{
          
        this.initComponent();

    },350);

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

  initComponent(){

    let fecha = new Date();
    let diaA : any = fecha.getDate();
    let mesS : any = fecha.getMonth() + 1;
    let anioO : any = fecha.getFullYear();

    if(diaA < 10){
      diaA = '0'+ diaA;
    }

    if(mesS < 10){
      mesS = '0'+ mesS;
    }

    this.f_desde = diaA+'/'+mesS+'/'+anioO;
    this.f_hasta = diaA+'/'+mesS+'/'+anioO;

    this.isValidDateDesdeFormat = true;
    this.isValidDateHastaFormat = true;

    this.getListado();
    
  }

  validateDateFormat(date: string): boolean {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(date);
  }

  buscar(){
    this.isValidDateDesdeFormat = this.validateDateFormat(this.dateInputA.nativeElement.value);
    this.isValidDateHastaFormat = this.validateDateFormat(this.dateInputB.nativeElement.value);

    if (!this.isValidDateDesdeFormat) {
      Swal.fire({
          title: 'Warning',
          text: 'Las fechas deben tener el formato DD/MM/YYYY',
          icon: 'warning'
        });
    } else if (!this.isValidDateHastaFormat) {
      Swal.fire({
          title: 'Warning',
          text: 'Las fechas deben tener el formato DD/MM/YYYY',
          icon: 'warning'
        });
    }else{
      console.log(this.dateInputA.nativeElement.value);
      console.log(this.dateInputB.nativeElement.value);
      this.getListadoBuscar();
    }
  }

  getListado(): void {

    this.noFacturadas = [];

    this.termino_selector = '';

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

    this.api_serv.getQuery(`movimientos/filter/fecha?desde=${ this.f_desde }&hasta=${ this.f_hasta }`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado = data.movimientos;
        
        //preparar los movimientos a facturar
        for (var i = 0; i < data.movimientos.length; ++i) {
          if(data.movimientos[i].facturado == 'No'){
            that.noFacturadas.push(data.movimientos[i]);
          }  
        }
        
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

  getListadoBuscar(): void {

    this.noFacturadas = [];

    this.termino_selector = '';

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

    this.api_serv.getQuery(`movimientos/filter/fecha?desde=${ this.dateInputA.nativeElement.value }&hasta=${ this.dateInputB.nativeElement.value }`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado = data.movimientos;
        
        //preparar los movimientos a facturar
        for (var i = 0; i < data.movimientos.length; ++i) {
          if(data.movimientos[i].facturado == 'No'){
            that.noFacturadas.push(data.movimientos[i]);
          }  
        }
        
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

  ChangeValueFiltro(termino){

    if(this.listado && this.listado.length > 0){
      if(termino != ""){
        this.onSearchModel(termino);
      }else{
        this.onSearchModel(termino);
      } 
    }   
  }

  facturar(){
    if(this.noFacturadas.length == 0){
      Swal.fire({
        title: 'Info',
        text: 'No hay movimientos por facturar.',
        icon: 'info',
      });
    }else{
      //this.saveFile();
      this.facturarMovimientos();
    }
  }

  // public saveFile(){
  //   //var FileSaver = require('file-saver');
  //   var blob = new Blob ([document.getElementById('exportable').innerHTML],{
  //     type: "application/vnd.openxmlfortmats-officedocument.spreadsheetml.sheet;charset=ISO-8859-1"
  //   });

  //   var fecha = new Date();
  //   //saveAs(blob,'facturas__'+fecha+'.xls');

  //   //saveAs(blob,'finalizados__'+inicio+'__'+final+'.xls');

  //   /*var archivo = new File([document.getElementById('exportable').innerHTML], 'prueba.xls', {
  //     type: "application/vnd.openxmlfortmats-officedocument.spreadsheetml.sheet;charset=utf-8"
  //   });*/
  //   //saveAs(archivo);
  // }

  facturarMovimientos(){

    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea marcar movimientos como facturados`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {

        let facturas = [];

        for (var i = 0; i < this.noFacturadas.length; ++i) {
          facturas.push({id:this.noFacturadas[i].id});
        }

        Swal.fire({
          title: 'Espere',
          text: 'Ejecutando',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();
        this.loading = true;
        
        var datos = {
          facturas : JSON.stringify(facturas),
        };

        var that = this;

        this.api_serv.postQuery(`movimientos/generar/facturas`, datos)
        .subscribe({
          next(data : any) {
            console.log(data);

            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });
            that.loading = false;

            that.getListadoBuscar();

          },
          error(msg) {
            console.log(msg);
            that.loading = false;
            that.tratarError(msg);
          }
        });

      }

    });
  }

 

 


}
