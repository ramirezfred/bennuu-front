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
    selector: 'facturacion-cmp',
    templateUrl: 'facturacion.component.html',
    styleUrls: ['./facturacion.component.css'],
})


export class FacturacionComponent implements OnInit, OnDestroy{
    
    objAOperar = null;
    num_guia = null;

    curp = null;

    user : any = null;

    @ViewChild('myModalConfigurar') myModalConfigurar : ElementRef;

    public listado: any = [];

    public page: number = 0;
    public currentPage: number = 0;
    public search: string = '';
    public filter_model: string = 'Movimiento';

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
    this.closeModal('#myModalConfigurar');
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

    this.api_serv.getQuery(`movimientos/mis/movimientos`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado = data.movimientos;
        /*for(var i = 0; i < that.listado.length; i++){
          if(that.listado[i].estado==1){
            that.listado[i].estado = 'Creada';
          }else if(that.listado[i].estado==2){
            that.listado[i].estado = 'Cancelada';
          }
        }*/
        
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

  aFacturar(obj): void {
    this.objAOperar = obj;
    //this.num_guia = this.objAOperar.guia;

    if(this.sesion_serv.puedeFacturar()){
      //this.open(this.modalFacturar);
      this.facturarMov();
    }else{
      this.openModal('#myModalConfigurar');
    }

  }

  facturarMov(){

    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea facturar este movimiento`,
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
          movimiento_id : this.objAOperar.id,
        };

        var that = this;

        this.api_serv.postQuery(`movimientos/facturar`, datos)
        .subscribe({
          next(data : any) {
            console.log(data);

            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });

            that.objAOperar.facturar = 1;
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

  irConfiguracion(){
    this.router.navigateByUrl('/configuracion');
  }

 


}
