import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';

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
    selector: 'mis-guias-cmp',
    templateUrl: 'admin-guias.component.html',
    styleUrls: ['./admin-guias.component.css'],
})


export class AdminGuiasComponent implements OnInit, OnDestroy {
    
    private data:any;
    private datos:any;
    public loading = false;

    objAOperar = null;
    num_guia = null;

    // Initialized to specific date (09/10/2018).
    //public model: any = { date: { year: 2018, month: 10, day: 9 } };
    public model: any;
    public model2: any;
    //DatePicker----->
    
    f_desde = null;
    isValidDateDesdeFormat: boolean;
    f_hasta = null;
    isValidDateHastaFormat: boolean;

    @ViewChild('dateInputA') dateInputA! : ElementRef;
    @ViewChild('dateInputB') dateInputB! : ElementRef;

    total = null;
    observaciones = null;

    public previsualizacion: string;
    public archivos: any = [];
    archivo : any = null;

    termino_selector = '';

    buscar_guia = '';
    @ViewChild('txtSearchGuia') txtSearchGuia! : ElementRef;

    saldo_api1 = '';
    saldo_api2 = '';
    saldo_api3 = '';
    saldo_api4 = '';

    saldo_actual = null;
    password = null;
    abono = null;
    api_proveedor = null;
    id_api_proveedor = null;

    @ViewChild('fileInputGuia') fileInputGuia : ElementRef;

    public listado: any = [];

    public page: number = 0;
    public currentPage: number = 0;
    public search: string = '';
    public filter_model: string = 'GuiaAdmin';

    @ViewChild('txtSearch') txtSearch! : ElementRef;

    public rastreo_Status: any = null;
    public rastreo_TrackingData: any = [];

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
    this.closeModal('#modalSobrepeso');
    this.closeModal('#modalAdjuntar');
    this.closeModal('#modalSaldo');
    this.closeModal('#modalRastreoTeiker');
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
    //this.getBalance();
    
  }

  onDesdeChange(newDate: string): void {
    this.isValidDateDesdeFormat = this.validateDateFormat(newDate);
    if (this.isValidDateDesdeFormat) {
      console.log('Fecha válida:', newDate);
    } else {
      console.error('Formato de fecha inválido');
    }
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

    this.api_serv.getQuery(`guias/filter/fecha?desde=${ this.f_desde }&hasta=${ this.f_hasta }`)
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
            text: 'No hay guías emitidas en esta fecha.',
            icon: 'info',
          });
        }else{
          that.currentPage = 1;
        }

        that.txtSearchGuia.nativeElement.value = '';

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  getListadoBuscar(): void {

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

    this.api_serv.getQuery(`guias/filter/fecha?desde=${ this.dateInputA.nativeElement.value }&hasta=${ this.dateInputB.nativeElement.value }`)
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
            text: 'No hay guías emitidas en esta fecha.',
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

  aSobrepeso(obj): void {
    this.total = null;
    this.observaciones = null;
    this.objAOperar = obj;
    this.num_guia = this.objAOperar.guia;
  }

  crearSobrepeso(){

    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea crear el sobrepeso`,
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
        this.loading = true;
        
        var datos = {
          guia_id : this.objAOperar.id,
          total : this.total,
          observaciones : this.observaciones,
        };

        var that = this;

        this.api_serv.postQuery(`sobrepesos`, datos)
        .subscribe({
          next(data : any) {
            console.log(data);

            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });
            that.loading = false;

            /*let sobrepeso = {
              estado : 'Pendiente',
              total : that.total,
              observaciones : that.observaciones
            }*/

            that.objAOperar.sobrepeso = data.sobrepeso; 
            that.objAOperar = null;
            that.num_guia = null;

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

  aAprobarCancelacion(obj): void {
    this.objAOperar = obj;
    this.num_guia = this.objAOperar.guia;

    this.aprobarCancelacion();
  }

  aprobarCancelacion(){

    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea aprobar la cancelación de la guía ${this.num_guia}`,
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
        this.loading = true;
        
        var datos = {
          guia : this.num_guia,
        };

        var that = this;

        this.api_serv.postQuery(`guias/aprobar/cancelacion`, datos)
        .subscribe({
          next(data : any) {
            console.log(data);

            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });
            that.loading = false;

            that.objAOperar.estado = 'Cancelada'; 
            that.objAOperar = null;
            that.num_guia = null;

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

  capturarFile(event): any {
    const archivoCapturado = event.target.files[0]
    this.extraerBase64(archivoCapturado).then((imagen: any) => {
      this.previsualizacion = imagen.base;
      console.log(imagen);

    })
    this.archivos.push(archivoCapturado)
    // 
    // console.log(event.target.files);

    setTimeout(()=>{
      this.subirArchivo();
    },200);

  }

  extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
    try {
      const unsafeImg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
      const reader = new FileReader();
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };
      reader.onerror = error => {
        resolve({
          base: null
        });
      };

    } catch (e) {
      return null;
    }
  })


  /**
   * Limpiar imagen
   */
  clearArchivo(): any {
    this.previsualizacion = '';
    this.archivos = [];
    this.archivo = null;
  }

  /**
   * Subir archivo
   */
  subirArchivo(): any {
    this.archivo = null;
    try {
      this.loading = true;
      const formularioDeDatos = new FormData();
      /* this.archivos.forEach(archivo => {
        formularioDeDatos.append('files', archivo)
      }) */

      if (this.archivos.length > 0) {
        formularioDeDatos.append('archivo', this.archivos[0]);        
        formularioDeDatos.append('carpeta', 'guias_pdf');      
        formularioDeDatos.append('url_archivo', this.api_serv.getRutaArchivos());

        Swal.fire({
          title: 'Espere',
          text: 'Subiendo archivo...',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();

        var that = this;
      
        this.api_serv.postQueryUpload('upload/archivo', formularioDeDatos)
        .subscribe({
          next(data : any) {
            //console.log(data);
            console.log('Respuesta del servidor', data);
            that.archivo = data.archivo;
            that.loading = false;
            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });
          },
          error(msg) {
            console.log(msg);
            that.loading = false;

            that.tratarError(msg);
    
          }
        });

      }else{
        //alert('Seleccione un archivo');
        that.loading = false;
        Swal.fire({
          title: 'Warning',
          text: 'Seleccione un archivo',
          icon: 'warning'
        });

      }   

    } catch (e) {
      this.loading = false;
      console.log('ERROR', e);
      Swal.close ();
    }
  }

  aAdjuntar(obj): void {
    this.objAOperar = obj;
    this.num_guia = null;
    this.clearArchivo();
    this.fileInputGuia.nativeElement.value = '';
  }

  adjuntar(){

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;
    
    var datos = {
      guia_id : this.objAOperar.id,
      guia : this.num_guia,
      pdf : this.archivo
    };

    var that = this;

    this.api_serv.postQuery(`guias/adjuntar`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        });
        that.loading = false;

        that.objAOperar.estado = 'Creada';
        that.objAOperar.guia = that.num_guia;
        that.objAOperar.rastreo = data.rastreo; 
        that.objAOperar = null;
        that.num_guia = null;

        that.fileInputGuia.nativeElement.value = '';
        that.closeModal('#modalAdjuntar');

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
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

  filtrarGuia(){

    //resset de selector
    this.termino_selector = '';
    this.ChangeValueFiltro('');

    let termino = this.buscar_guia;
    let esta = false;
    if(this.listado && this.listado.length > 0){
      if(termino != ""){
        for (var i = 0; i < this.listado.length; ++i) {
          if(!this.listado[i].guia){
            this.listado[i].guia = '';
          }

          if (this.listado[i].guia.toUpperCase().indexOf(termino.toUpperCase())>=0) {
             esta = true;
             this.onSearchModel(termino);
          }
        }
      }else{
        this.onSearchModel(termino);
      } 
    }

    if(!esta){
      //buscar en la BD
      this.buscarGuia();
    } 
  }

  buscarGuia(){

    Swal.fire({
      title: 'Espere',
      text: 'Consultando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`guias/buscar?guia=${this.buscar_guia}`)
    .subscribe({
      next(data : any) {
        console.log(data);

        //that.listado.unshift(data.guia);

        const nuevoListado = [data.guia, ...that.listado];
        that.listado = nuevoListado;
        that.currentPage = 1;

        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        });
        that.loading = false;

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  getBalance(): void {

    this.saldo_api1 = 'Cargando...';
    this.saldo_api2 = 'Cargando...';
    this.saldo_api3 = 'Cargando...';
    this.saldo_api4 = 'Cargando...';

    this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`sistema/balance`)
    .subscribe({
      next(data : any) {
        console.log(data); 
        that.loading = false;   
        //that.showToast('success', 'Success!', that.data.message); 

        that.saldo_api1 = data.balance[0].saldo;
        that.saldo_api2 = data.balance[1].saldo;
        that.saldo_api3 = data.balance[2].saldo;
        that.saldo_api4 = data.balance[3].saldo;

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  aRecargarApi(id,api_proveedor): void {
    this.saldo_actual = null;
    this.password = null;
    this.abono = null;
    this.id_api_proveedor = id;
    this.api_proveedor = api_proveedor;

    if(id == 1){
      this.saldo_actual = this.saldo_api1;
    }else if(id == 2){
      this.saldo_actual = this.saldo_api2;      
    }else if(id == 3){
      this.saldo_actual = this.saldo_api3;      
    }else if(id == 4){
      this.saldo_actual = this.saldo_api4;      
    }
  }

  recargarSaldoApi(){

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;
    
    
    var datos = {
      api_id : this.id_api_proveedor,
      saldo : this.abono,
      pass_config : this.password,
    };

    var that = this;

    this.api_serv.postQuery(`sistema/recargar/saldo/api`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        that.loading = false;
        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        });
         
        that.id_api_proveedor = null;
        that.getBalance();
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
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

  

 


}
