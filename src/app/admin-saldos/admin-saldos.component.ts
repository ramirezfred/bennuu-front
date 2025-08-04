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
    selector: 'admin-saldos-cmp',
    templateUrl: 'admin-saldos.component.html',
    styleUrls: ['./admin-saldos.component.css'],
})


export class AdminSaldosComponent implements OnInit, OnDestroy{
    
    private data:any;
    private datos:any;
    public loading = false;

    objAOperar = null;
    num_guia = null;

    bandera_init = null;
    bandera_init2 = null;

    selectedTab1 = true;
    selectedTab2 = false;

    public listado: any = [];

    public page: number = 0;
    public currentPage: number = 0;
    public search: string = '';
    public filter_model: string = 'SaldoApi';

    @ViewChild('txtSearch') txtSearch! : ElementRef;

    public listado2: any = [];

    public page2: number = 0;
    public currentPage2: number = 0;
    public search2: string = '';
    public filter_model2: string = 'SaldoUser';

    @ViewChild('txtSearch2') txtSearch2! : ElementRef;

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

   this.initComponent();

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

  nextPage2(){
    this.page2 += 5;
    this.currentPage2 += 1; 
  }

  prevPage2(){
    if( this.page2 > 0 ){
      this.page2 -= 5;
      this.currentPage2 -= 1;
    }
  }

  onSearchModel2( search: string ){
    this.page2 = 0;
    this.search2 = search;
  }

  initComponent(){

    /*if(!this.bandera_init){
      this.bandera_init = 1;
      this.getListado();
    }*/

    if(!this.bandera_init2){
      this.bandera_init2 = 1;
      this.getListado2();
    }
    
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

    this.api_serv.getQuery(`saldos`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado = data.saldos;

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

  getListado2(): void {

    this.listado2 = [];

    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
  
    var datos = {};
    
    var that = this;

    this.api_serv.getQuery(`movimientos/recargas`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado2 = data.movimientos;

        Swal.close ();

        if(that.listado2.length > 0){
          that.currentPage2 = 1;
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
      if(!this.bandera_init2){
        this.bandera_init2 = 1;
        this.getListado2();
      }
    }
  }

  

 

 


}
