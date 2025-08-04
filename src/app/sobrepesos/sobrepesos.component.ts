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
    selector: 'sobrepesos-cmp',
    templateUrl: 'sobrepesos.component.html',
    styleUrls: ['./sobrepesos.component.css'],
})


export class SobrepesosComponent implements OnInit, OnDestroy{
    
    objAOperar = null;
    num_guia = null;

    saldo = null;

    user : any = null;

    @ViewChild('modalRecargar') modalRecargar : ElementRef;

    public listado: any = [];

    public page: number = 0;
    public currentPage: number = 0;
    public search: string = '';
    public filter_model: string = 'Sobrepeso';

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

    this.getListado();
   
  }

  ngOnDestroy() {
    // acciones de destrucción
    this.closeModal('#myModalRecargar');
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

    this.api_serv.getQuery(`sobrepesos/mis/sobrepesos`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado = data.sobrepesos;
        
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

  miSaldo(): void {

    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
  
    var datos = {};
    
    var that = this;

    this.api_serv.getQuery(`usuario/saldo`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.saldo = data.saldo;
        
        Swal.close ();

        if(that.saldo >= that.objAOperar.total){
          //that.open(that.modalPagar);
          that.pagar();
        }else{
          that.openModal('#myModalRecargar');
        }

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }


  aPagar(obj): void {
    this.objAOperar = obj;
    //this.num_guia = this.objAOperar.guia;

    this.miSaldo();

  }

  pagar(){

    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea pagar este sobrepeso`,
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
          sobrepeso_id : this.objAOperar.id,
        };

        var that = this;

        this.api_serv.postQuery(`sobrepesos/pagar`, datos)
        .subscribe({
          next(data : any) {
            console.log(data);

            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });

            that.objAOperar.estado = 'Pagado';
            that.objAOperar = null;
            //that.num_guia = null;

          },
          error(msg) {
            console.log(msg);
            that.tratarError(msg);
          }
        });

      }

    });
  }

  irRecargar(){
    this.router.navigateByUrl('/saldo');
  }

 


}
