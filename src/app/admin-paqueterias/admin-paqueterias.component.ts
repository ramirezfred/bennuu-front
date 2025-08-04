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
    selector: 'admin-paqueterias-cmp',
    templateUrl: 'admin-paqueterias.component.html',
    styleUrls: ['./admin-paqueterias.component.css'],
})


export class AdminPaqueteriasComponent implements OnInit, OnDestroy{
    
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
    public filter_model: string = 'PaqueteriaServicio';

    @ViewChild('txtSearch') txtSearch! : ElementRef;

    termino_selector = '';


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

  initComponent(){

    this.getListado();
    
  }

  getListado(): void {

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

    this.api_serv.getQuery(`paqueteria_sevicios`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado = data.data;

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

  async aEditar(servicio : any){ 
          
      const { value: formValues, isConfirmed } = await Swal.fire({
        title: "Ingresa un nombre para el servicio",
        html:
          `
          <h4">${servicio.nombre_transportista} ${servicio.tipo_servicio}</h4><br>
          <input id="swal-input1" class="swal2-input" placeholder="Nombre" maxlength="200" value="${servicio.nombre_mostrar || ''}">
          `,
        focusConfirm: false,
        showCancelButton: true, // Habilitar botón de cancelar
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          const nombre = (document.getElementById('swal-input1') as HTMLInputElement).value;
      
          // if (!nombre || nombre.length > 200) {
          //   Swal.showValidationMessage("El campo Nombre es obligatorio y debe tener un máximo de 200 caracteres");
          //   return null;
          // }

          if (nombre.length > 200) {
            Swal.showValidationMessage("El campo Nombre debe tener un máximo de 200 caracteres");
            return null;
          }
      
          return [nombre];
        }
      });
      
      if (isConfirmed && formValues) {
        const [nombre] = formValues;
        // Llamas a la función que necesitas pasando los valores

        Swal.fire({
          title: '¿Está seguro?',
          text: `Realmente desea cambiar el nombre del servicio`,
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
              api : servicio.api,
              api_proveedor : servicio.api_proveedor,
              nombre_transportista : servicio.nombre_transportista,
              tipo_servicio : servicio.tipo_servicio,
              nombre_mostrar : nombre,
            };

            var that = this;

            this.api_serv.postQuery(`paqueteria_sevicios`, datos)
            .subscribe({
              next(data : any) {
                console.log(data);

                Swal.fire({
                  title: 'Info',
                  text: data.message,
                  icon: 'info',
                });

                servicio.nombre_mostrar = nombre;

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

  ChangeValueFiltro(termino){

    if(this.listado && this.listado.length > 0){

      if(termino != ""){
        this.onSearchModel(termino);
      }else{
        this.onSearchModel(termino);
      }  
    }   
  }

}
