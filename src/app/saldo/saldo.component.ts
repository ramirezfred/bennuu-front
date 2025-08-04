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

declare let paypal: any;

declare interface DataTable {
    headerRow: string[];
    //footerRow: string[];
    dataRows: any[];
}


@Component({
    selector: 'saldo-cmp',
    templateUrl: 'saldo.component.html',
    styleUrls: ['./saldo.component.css'],
})


export class SaldoComponent implements OnInit, OnDestroy{
    
    user : any = null;

    saldo = null;
    saldo_card = '';

    public previsualizacion: string;
    public archivos: any = [];
    imagen : any = null;

    @ViewChild('btnFile') btnFile : ElementRef;

    abono = null;
    flujoPayPal = 1;


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
      

    }

  ngOnInit(){
    this.miSaldo();
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

  miSaldo(): void {
    this.saldo_card = '...';
    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    var that = this;
    this.api_serv.getQuery(`usuario/saldo`)
    .subscribe({
      next(data : any) {
        console.log(data);
        // Swal.fire({
        //   title: 'Info',
        //   text: data.message,
        //   icon: 'info',
        // });  
        Swal.close ();      
        that.saldo = data.saldo;
        that.saldo_card = that.saldo+' MXN';   
      },
      error(msg) {
        console.log(msg);
        that.saldo_card = '';
        that.tratarError(msg);
      }
    });
  }

  miSaldo2(): void {
    this.saldo_card = '...';

    var that = this;
    this.api_serv.getQuery(`usuario/saldo`)
    .subscribe({
      next(data : any) {
        console.log(data);
             
        that.saldo = data.saldo;
        that.saldo_card = that.saldo+' MXN';   
      },
      error(msg) {
        console.log(msg);
        that.saldo_card = '';
        that.tratarError(msg);
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
  clearImage(): any {
    this.previsualizacion = '';
    this.archivos = [];
    //this.myForm.patchValue({imagen : ''});
    this.imagen = null;
  }

  nuevoArchivo($event){
    this.clearImage();
    document.getElementById("btnFile").click();
  }

  /**
   * Subir archivo
   */
  subirArchivo(): any {
    this.imagen = null;
    try {
      
      

      const formularioDeDatos = new FormData();
      /* this.archivos.forEach(archivo => {
        formularioDeDatos.append('files', archivo)
      }) */

      if (this.archivos.length > 0) {
        formularioDeDatos.append('imagen', this.archivos[0]);        
        formularioDeDatos.append('carpeta', 'recibos');      
        formularioDeDatos.append('url_imagen', this.api_serv.getRutaImages());

        Swal.fire({
          title: 'Espere',
          text: 'Subiendo imagen...',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();

        var that = this;
      
        this.api_serv.postQueryUpload('upload/imagen', formularioDeDatos)
        .subscribe({
          next(data : any) {
            //console.log(data);
            console.log('Respuesta del servidor', data);
            that.imagen = data.imagen;
            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            }); 
            that.btnFile.nativeElement.value = '';
            that.enviarEmail();
          },
          error(msg) {
            console.log(msg);
            that.clearImage();
            that.tratarError(msg);
    
          }
        });

      }else{
        //alert('Seleccione una imagen');
        Swal.fire({
          title: 'Warning',
          text: 'Seleccione una imagen',
          icon: 'warning',
        }); 

      }   

    } catch (e) {
      Swal.close ();
      console.log('ERROR', e);
    }
  }

  enviarEmail(): void {   
    var datos= {
      imagen: this.imagen,
      email: this.user.email,
    }
    var that = this;
    this.api_serv.postQuery(`email/recibo/transferencia`, datos)
    .subscribe({
      next(data : any) {         
        console.log(data);
      },
      error(msg) {
        console.log(msg);
        //that.tratarError(msg);
      }
    });
  }

  private loadExternalScript(scriptUrl: string) {
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement('script')
      scriptElement.src = scriptUrl
      scriptElement.onload = resolve
      document.body.appendChild(scriptElement)
    })
  }

  paymentSuccess(payment) {
    console.log(payment);
    if(payment.state == "approved" || payment.state == "completed" || payment.state == "COMPLETED"){
      // Swal.fire({
      //   title: 'Info',
      //   text: 'Pago completado',
      //   icon: 'info',
      // });
      this.recargarSaldoPayPal();
    }else{
      Swal.fire({
        title: 'Error',
        text: 'Error al procesar el pago.',
        icon: 'error'
      });
    }
  }

  renderButtonPayPal(cost,selectedCurreny,self,paypal_production,paypal_sandbox,paypal_env): void {

    console.log('renderButtonPayPal');

    document.getElementById("paypal-button").innerHTML = "";

    let env = null;
    if(paypal_env == 0){
      env = 'sandbox';
    }else if(paypal_env == 1){
      env = 'production';
    }

    //reset earlier inserted paypal button
    paypal.Button.render({
      style: {
        //shape:   'rect',
        shape:   'pill',
        height :   40,
      },
      env: env,
      client: {
        production: paypal_production,
        sandbox: paypal_sandbox
      },
      commit: true,
      payment: function (data, actions) {
        return actions.payment.create({
          payment: {
            transactions: [
              {
                amount: { total: cost, currency: selectedCurreny }
              }
            ]
          }
        })
      },
      onAuthorize: function (data, actions) {
        return actions.payment.execute().then(function (payment) {

          //alert('Payment Successful')
          self.paymentSuccess(payment);
          //console.log(payment)
        })
      }
    }, '#paypal-button');
  }

  mostrarBotonPayPal(){

    let comision = (this.abono * 5)/100;
    let total = this.abono + 5 + comision;

    // this.renderButtonPayPal(
    //   total,
    //   'MXN',
    //   this,
    //   'AYDm5MoqD21AUPQNoKQSWst_d1L9uB9HuD88Ak_zO_UOBoYKVDvuHtM3vTt7UpFjN0L8vwZ5f0q6J7Ry',
    //   'AYDm5MoqD21AUPQNoKQSWst_d1L9uB9HuD88Ak_zO_UOBoYKVDvuHtM3vTt7UpFjN0L8vwZ5f0q6J7Ry',
    //   0
    // );

    this.renderButtonPayPal(
      total,
      'MXN',
      this,
      'ASPCK0D1YXnxoBn75MQZvIRGH5rZovXnFTCWlHZzGISlZtA6S9aj-92by8efeCZNxJ7ODm7pk4Q7VGHi',
      'ASPCK0D1YXnxoBn75MQZvIRGH5rZovXnFTCWlHZzGISlZtA6S9aj-92by8efeCZNxJ7ODm7pk4Q7VGHi',
      1
    );

    this.flujoPayPal = 2;
  }

  atrasPayPal(){
    this.flujoPayPal = 1;
  }

  recargarSaldoPayPal(){
    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    
    var datos = {
      saldo : this.abono,
    };

    var that = this;

    this.api_serv.postQuery(`paypal/recargar/saldo`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        });
        that.abono = null;
        that.miSaldo2();

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });
  }


}
