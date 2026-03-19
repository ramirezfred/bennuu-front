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

declare interface Aviso {
  id?: number;
  fecha_desde: string;
  fecha_hasta: string;
  titulo: string;
  mensaje?: string;
  icono: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

@Component({
    selector: 'admin-avisos-cmp',
    templateUrl: 'admin-avisos.component.html',
    styleUrls: ['./admin-avisos.component.css'],
})


export class AdminAvisosComponent implements OnInit, OnDestroy{
    
    private data:any;
    private datos:any;
    public loading = false;

    myForm: FormGroup;
    accion : any = null; //0=crear 1=editar

    public listado: any = [];

    public page: number = 0;
    public currentPage: number = 0;
    public search: string = '';
    public filter_model: string = 'Aviso';

    @ViewChild('txtSearch') txtSearch! : ElementRef;

    objAOperar = null;
    objAOperarIndex = -1;

    isEditMode = false;
    avisoId: number | null = null;
    submitted = false;

    // Iconos disponibles de la plantilla Light Bootstrap
    iconos = [
      { value: 'pe-7s-alarm', label: 'Alarma' },
      // { value: 'pe-7s-attention', label: 'Atención' },
      { value: 'pe-7s-bell', label: 'Campana' },
      { value: 'pe-7s-close-circle', label: 'Bloqueo' },
      { value: 'pe-7s-info', label: 'Información' },
      { value: 'pe-7s-attention', label: 'Advertencia' },
      { value: 'pe-7s-clock', label: 'Reloj' },
      { value: 'pe-7s-cloud-download', label: 'Descarga' },
      { value: 'pe-7s-date', label: 'Calendario' },
      { value: 'pe-7s-help1', label: 'Ayuda' },
      { value: 'pe-7s-lock', label: 'Candado' },
      { value: 'pe-7s-map-marker', label: 'Ubicación' },
      { value: 'pe-7s-plugin', label: 'Conexión' },
      { value: 'pe-7s-ribbon', label: 'Cinta' },
      { value: 'pe-7s-sun', label: 'Sol/Temporada' },
      { value: 'pe-7s-tools', label: 'Herramientas' },
      { value: 'pe-7s-volume2', label: 'Megáfono' },
      { value: 'pe-7s-way', label: 'Carretera' }
    ];

    @ViewChild('fileInputImagen') fileInputImagen : ElementRef;
    public previsualizacion: string;
    public archivos: any = [];
    imagenUrl: string | null = null;

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
      
      this.crearForm(0);
    }

  ngOnInit(){

    this.getListado();
   
  }

  ngOnDestroy() {
    // acciones de destrucción
    this.closeModal('#modalAviso');
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
    this.closeModal('#modalAviso');
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

    this.api_serv.getQuery(`avisos`)
    .subscribe({
      next(response : any) {
        console.log(response);

        that.listado = response.avisos;
        
        Swal.close ();

        if(that.listado.length > 0){
          that.currentPage = 1;
        }

        that.txtSearch.nativeElement.value = '';
        that.onSearchModel('');

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  nuevo(): void {
    this.router.navigate(['/admin/avisos/nuevo']);
  }

  showNotification(type: string, message: string): void {
    $.notify({
      icon: 'pe-7s-info',
      message: message
    }, {
      type: type,
      timer: 3000,
      placement: {
        from: 'top',
        align: 'right'
      }
    });
  }

  isVigente(aviso: Aviso): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const desde = new Date(aviso.fecha_desde);
    const hasta = new Date(aviso.fecha_hasta);
    return hoy >= desde && hoy <= hasta;
  }

  //accion 0=crear 1=editar
  crearForm(accion : number = 0) {

    this.accion = accion;
    this.myForm = this.fb.group({
      fecha_desde: ['', Validators.required],
      fecha_hasta: ['', Validators.required],
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      mensaje: [''],
      icono: ['pe-7s-info', Validators.required],
      activo: [true],
      imagen: [null],
    });
        
       
  }

  cargarDataForm(){
    this.myForm.patchValue({fecha_desde : ''});
    this.myForm.patchValue({fecha_hasta : ''});
    this.myForm.patchValue({titulo : ''});
    this.myForm.patchValue({mensaje : ''});
    this.myForm.patchValue({icono : 'pe-7s-info'});
    this.myForm.patchValue({activo : true});
    this.myForm.patchValue({imagen : null});

    Object.values( this.myForm.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });
  }

  get f() {
    return this.myForm.controls;
  }

  get fecha_desdeNoValido() {
    return this.myForm.get('fecha_desde').invalid && this.myForm.get('fecha_desde').touched
  }

  get fecha_hastaNoValido() {
    return this.myForm.get('fecha_hasta').invalid && this.myForm.get('fecha_hasta').touched
  }

  get tituloNoValido() {
    return this.myForm.get('titulo').invalid && this.myForm.get('titulo').touched
  }

  get mensajeNoValido() {
    return this.myForm.get('mensaje').invalid && this.myForm.get('mensaje').touched
  }

  get iconoNoValido() {
    return this.myForm.get('icono').invalid && this.myForm.get('icono').touched
  }

  get activoNoValido() {
    return this.myForm.get('activo').invalid && this.myForm.get('activo').touched
  }

  aCrear(): void {
    this.submitted = false;
    this.crearForm(0);
    this.imagenUrl = null;

    this.closeAllModals();
    setTimeout(()=>{
      this.openModal('#modalAviso');
      
    },60);
  }

  aEditar(obj): void {
    this.submitted = false;
    this.crearForm(1);

    this.objAOperar = obj;

    // Función auxiliar para limpiar la fecha
    const formatFecha = (fecha) => {
        if (!fecha) return '';
        // Si viene como "YYYY-MM-DD HH:mm:ss", cortamos para dejar solo "YYYY-MM-DD"
        return fecha.split(' ')[0]; 
    };

    this.myForm.patchValue({
        fecha_desde: formatFecha(this.objAOperar.fecha_desde),
        fecha_hasta: formatFecha(this.objAOperar.fecha_hasta),
        titulo: this.objAOperar.titulo,
        mensaje: this.objAOperar.mensaje || '',
        icono: this.objAOperar.icono,
        activo: this.objAOperar.activo,
        imagen: this.objAOperar.imagen
    });

    this.imagenUrl = this.objAOperar.imagen;

    this.closeAllModals();
    setTimeout(()=>{
      this.openModal('#modalAviso');
    },60);
    
  }

  aEliminar(item : any, index: number): void {
    //this.selectObj = Object.assign({},obj);
    this.objAOperar = JSON.parse(JSON.stringify(item));
    this.objAOperarIndex = index;

    this.eliminar();

  }

  guardar(){

    this.submitted = true;
    
    if ( this.myForm.invalid ) {

      Swal.fire({
        title: 'warning',
        text: 'Por favor complete todos los campos requeridos',
        icon: 'warning',
      }); 

      return Object.values( this.myForm.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
  
      });
      
    }else{

      if (this.accion == 0) {
        this.crear();
      }else if (this.accion == 1) {
        this.editar();
      }

    }
  }

  crear(): void {
  
    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea crear el aviso`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {

        Swal.fire({
          title: 'Espere',
          text: 'Ejecutando...',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();

        this.loading = false;
        
        var datos= {
          fecha_desde: this.myForm.value.fecha_desde,
          fecha_hasta: this.myForm.value.fecha_hasta,
          titulo: this.myForm.value.titulo,
          mensaje: this.myForm.value.mensaje,
          icono: this.myForm.value.icono,
          activo: this.myForm.value.activo,
          imagen: this.myForm.value.imagen,
        }

        var that = this;

        this.api_serv.postQuery(`avisos`, datos)
        .subscribe({
          next(response : any) {
                
            console.log(response);
            
            Swal.fire({
              title: 'Info',
              text: response.message,
              icon: 'info',
            }); 
            that.loading = false;

            // Actualizar la lista después de agregar el elemento
            that.listado = [response.aviso,...that.listado];

            that.closeModal('#modalAviso');
            that.objAOperar = null;
            that.imagenUrl = null;

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

  editar(): void {
  
    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea editar el aviso`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {

        Swal.fire({
          title: 'Espere',
          text: 'Ejecutando...',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();

        this.loading = true;
        
        var datos= {
          fecha_desde: this.myForm.value.fecha_desde,
          fecha_hasta: this.myForm.value.fecha_hasta,
          titulo: this.myForm.value.titulo,
          mensaje: this.myForm.value.mensaje,
          icono: this.myForm.value.icono,
          activo: this.myForm.value.activo,
          imagen: this.myForm.value.imagen,
        }

        var that = this;

        this.api_serv.putQuery(`avisos/${ this.objAOperar.id }`, datos)
        .subscribe({
          next(response : any) {
                
            console.log(response);
            
            Swal.fire({
              title: 'Info',
              text: response.message,
              icon: 'info',
            }); 
            that.loading = false;

            // Actualizar el elemento en listado
            const index = that.listado.findIndex((item:any) => item.id === that.objAOperar.id);
            if (index !== -1) {
              that.listado[index] = { ...that.listado[index], ...response.aviso };
              that.listado = [...that.listado]; // <-- esto fuerza la actualización visual
            }

            that.closeModal('#modalAviso');
            that.objAOperar = null;
            that.imagenUrl = null;

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

  eliminar(): void {
  
    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea eliminar el aviso "${this.objAOperar.titulo}"`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {

        Swal.fire({
          title: 'Espere',
          text: 'Ejecutando...',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();

        this.loading = false;
        
        var datos= {
        }

        var that = this;

        this.api_serv.deleteQuery(`avisos/${ this.objAOperar.id }`)
        .subscribe({
          next(response : any) {
                
            console.log(response);
            
            Swal.fire({
              title: 'Info',
              text: response.message,
              icon: 'info',
            }); 
            that.loading = false;

            // Actualizar la lista después de eliminar el elemento
            that.listado = that.listado.filter((item : any) => item.id !== that.objAOperar.id);

            that.objAOperar = null;
            that.imagenUrl = null;

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

  cargarImagen(){

    this.fileInputImagen.nativeElement.value = '';
    setTimeout(()=>{
        this.fileInputImagen.nativeElement.click();
    },50);

  }

  capturarFile(event): any {

    this.archivos = [];
    const archivoCapturado = event.target.files[0]
    this.extraerBase64(archivoCapturado).then((imagen: any) => {
      this.previsualizacion = imagen.base;
    })
    this.archivos.push(archivoCapturado)

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
   * Subir archivo
   */
  subirArchivo(): any {
    try {
      const formularioDeDatos = new FormData();
      /* this.archivos.forEach(archivo => {
        formularioDeDatos.append('files', archivo)
      }) */

      if (this.archivos.length > 0) {
        formularioDeDatos.append('archivo', this.archivos[0]); 

        Swal.fire({
          title: 'Espere',
          text: 'Subiendo archivo...',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();

        var that = this;
      
        this.api_serv.postQueryUpload('avisos/store_archivo', formularioDeDatos)
        .subscribe({
          next(data : any) {
            console.log(data);

            that.imagenUrl = data.url;
            that.myForm.patchValue({imagen : data.url});

            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });

            that.fileInputImagen.nativeElement.value = '';
            
          },
          error(msg) {
            console.log(msg);
            that.tratarError(msg);
    
          }
        });

      }else{
        //alert('Seleccione una imagen');

        Swal.fire({
          title: 'Warning',
          text: 'Seleccione una imagen',
          icon: 'warning'
        });

      }

      

    } catch (e) {
      console.log('ERROR', e);
    }
  }

  verImagen() {
    window.open(this.imagenUrl!, '_blank');
  }

  eliminarImagen() {
    this.imagenUrl = null;
    this.myForm.patchValue({ imagen: null });
  }


}
