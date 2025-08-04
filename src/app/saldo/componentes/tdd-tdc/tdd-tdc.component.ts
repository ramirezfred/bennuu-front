import { Component, OnInit, ElementRef, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';

//Mis imports
import { APIService } from '../../../services/API/API.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FormGroupDirective, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { SesionService } from '../../../services/sesion/sesion.service';

//import { TableData } from '../../lbd/lbd-table/lbd-table.component';

import { DomSanitizer } from '@angular/platform-browser';

import { Location } from '@angular/common';

declare var Conekta: any;

@Component({
  selector: 'app-tdd-tdc',
  templateUrl: './tdd-tdc.component.html',
  styleUrls: ['./tdd-tdc.component.css']
})
export class TddTdcComponent implements OnInit {

  private data:any;
  private datos:any;
  public loading = false;

  paymentForm: FormGroup;

  formErrors = {
      "number":"",
      "name":"",
      "exp_year":"",
      "exp_month":"",
      "cvc":""
  };
  public cargo = {
    "usuario_id" : null,
    "name" : "",
    "email" : "",
    "phone": "",   
    "reference": 0,
    "random_key": 0,
    "token_id": "",
    "name_order": "Recarga Saldo Bennuu",
    "unit_price": 0,
    "quantity": "1",
    "amount": 0,
    "carrier": "Guias",
    "street1": "Av. Central 111 2",
    "postal_code": "43612",
    "more_info": "pago Bennuu",
    "servicio_id": "",
    "last4": null,
    "brand": "",
    "cvv": "",
    "titular": "",
    "total": 0,
  };

  @Output() verMiSaldo: EventEmitter<boolean>;

  constructor(
        private api_serv: APIService,
        private http: HttpClient,
        private fb: FormBuilder,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private sesion_serv: SesionService,
        private _location: Location,
  ) {

    //produccion
    Conekta.setPublicKey('key_Xk0m8Uxj0sI9qxIfLhMhf1U');
    //pruebas
    //Conekta.setPublicKey('key_LPgvccXbEvtt7tGH2Zzw94Q');

    this.crearFormPago();
    this.crearListenersFormPago();

    this.verMiSaldo = new EventEmitter();

  }

  ngOnInit() {
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

  crearFormPago() {
    this.paymentForm = this.fb.group({
      number: ['', [Validators.required]],
      name: ['', [Validators.required]],
      exp_year: ['', [Validators.required]],
      exp_month: ['', [Validators.required]],
      cvc: ['', [Validators.required]],
      check: [false],
      monto: ['', [Validators.required, Validators.min(1)]],
    });
  }

  crearListenersFormPago(){
    this.paymentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();

    this.cargo.usuario_id = this.sesion_serv.getUserId();
    this.cargo.name = this.sesion_serv.getUserNombre();
    this.cargo.phone = this.sesion_serv.getUserTelefono();
    this.cargo.email = this.sesion_serv.getUserEmail();
    this.cargo.reference = new Date().getTime();
    this.cargo.random_key = new Date().getTime();

    this.paymentForm.get('monto').valueChanges.subscribe( valor => {

      // //4% del total
      // let comision = (valor * 4)/100;

      // //this.cargo.unit_price = (parseFloat(this.order.costo)-1)*100;
      // this.cargo.unit_price = ((valor+comision) - 1)*100; //costo del serv seleccionado
      // this.cargo.amount = 100;
      this.cargo.total = valor;  

      //console.log(this.cargo);   
    });

    this.paymentForm.controls['number'].valueChanges.subscribe(
        (selectedValue) => {
          var target = selectedValue;
          if (selectedValue.toString().length > 16) {
            this.paymentForm.patchValue({number: selectedValue.substr(0, 16)});
            target = selectedValue.substr(0, 16);
          }
          var tgt = Conekta.card.validateNumber(target);
          if (!tgt) {
            this.paymentForm.controls['number'].setErrors({'incorrect': true});
          }
          var yr = Conekta.card.getBrand(selectedValue);
          if (yr) {
            this.cargo.brand = yr;
          }
        }
      );
      this.paymentForm.controls['cvc'].valueChanges.subscribe(
        (selectedValue) => {
          var cvv = selectedValue;
          if (selectedValue.toString().length > 4) {
            this.paymentForm.patchValue({cvc: selectedValue.substr(0, 4)});
            cvv = selectedValue.substr(0, 4);
          }
          var cv = Conekta.card.validateCVC(cvv);
          if (!cv) {
            this.paymentForm.controls['cvc'].setErrors({'incorrect': true});
          }
        }
      );
      this.paymentForm.controls['exp_month'].valueChanges.subscribe(
        (selectedValue) => {
          var month = selectedValue;
          if (selectedValue.toString().length > 2) {
            this.paymentForm.patchValue({exp_month: selectedValue.substr(0, 2)});
            month = selectedValue.substr(0, 2);
          }
          var mt = Conekta.card.validateExpirationDate(month, this.paymentForm.value.exp_year);
          if (this.paymentForm.value.exp_year != '') {
            if (!mt) {
              this.paymentForm.controls['exp_month'].setErrors({'incorrect': true});
              this.paymentForm.controls['exp_year'].setErrors({'incorrect': true});
            } else {
              this.paymentForm.controls['exp_year'].setErrors(null);
            }
          }          
        }
      );
      this.paymentForm.controls['exp_year'].valueChanges.subscribe(
        (selectedValue) => {
          var year = selectedValue;
          if (selectedValue.toString().length > 4) {
            this.paymentForm.patchValue({exp_year: selectedValue.substr(0, 4)});
            year = selectedValue.substr(0, 4);
          }
          var yr = Conekta.card.validateExpirationDate(this.paymentForm.value.exp_month,year);
          if (!yr) {
            this.paymentForm.controls['exp_month'].setErrors({'incorrect': true});
            this.paymentForm.controls['exp_year'].setErrors({'incorrect': true});
          } else {
            this.paymentForm.controls['exp_month'].setErrors(null);
          }
        }
      );
  }

  cargarDataFormPayment() {
    // this.paymentForm.patchValue({number : ''});
    // this.paymentForm.patchValue({name : ''});
    // this.paymentForm.patchValue({exp_year : ''});
    // this.paymentForm.patchValue({exp_month : ''});
    // this.paymentForm.patchValue({cvc : ''});
    // this.paymentForm.patchValue({check : false});
    this.paymentForm.patchValue({monto : ''});

    this.paymentForm.get('monto').markAsUntouched();

    // Object.values( this.paymentForm.controls ).forEach( control => {
        
    //   if ( control instanceof FormGroup ) {
    //     Object.values( control.controls ).forEach( control => control.markAsUntouched() );
    //   } else {
    //     control.markAsUntouched();
    //   }

    // });
  }

  get montoNoValido() {
    return this.paymentForm.get('monto').invalid && this.paymentForm.get('monto').touched
  }

  onValueChanged(data?: any) {
    if (!this.paymentForm) { return; }
    const form = this.paymentForm;

    for (const field in this.formErrors) { 
      const control = form.get(field);
      this.formErrors[field] = '';
      if (control && control.dirty && !control.valid) {
        for (const key in control.errors) {
          this.formErrors[field] += true;
          console.log(key);
        }
      } 
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsDirty({ onlySelf:true });
        this.onValueChanged();
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });

    return Object.values( this.paymentForm.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsTouched() );
      } else {
        control.markAsTouched();
      }

    });
  }

  pagar(form){

    if (this.paymentForm.valid) {
      Swal.fire({
        title: 'Espere',
        text: 'Validando información...',
        icon: 'info',
        allowOutsideClick: false
      });
      Swal.showLoading();
      var that = this;
      let pay = { "card": form.value};
      Conekta.Token.create(pay, function SuccessCallback(response) {
        console.log(response);
        that.cargo.token_id = response.id;           
        that.paymentCharge();
      }
      , function ErrorCallback(response) {
        console.log(response);
        Swal.fire({
          title: 'Error',
          text: response.message_to_purchaser,
          icon: 'error'
        });
      });
      
    } else {
      this.validateAllFormFields(this.paymentForm);
      Swal.fire({
        title: 'Error',
        text: 'Faltan datos de la tarjeta',
        icon: 'error'
      });
    };
  };

  paymentCharge(): void {

    Swal.fire({
      title: 'Espere',
      text: 'Generando el pago...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    this.api_serv.postQuery(`conekta/order/recargar/saldo`, this.cargo)
    .subscribe({
      next(data : any) {
        console.log(data);
          
        that.datos = data;
        if (that.datos.conekta.object === 'order') {
          if (that.datos.conekta.payment_status === "paid") {

            that.cargarDataFormPayment();
            Swal.fire({
              title: 'Info',
              text: 'Saldo recargado exitosamente',
              icon: 'info',
            });

            //Actualizar mi saldo
            that.verMiSaldo.emit( true );

          }          
        }
        if (that.datos.conekta.object === 'error') {
          Swal.fire({
            title: 'Error',
            text: that.datos.conekta.details[0].message,
            icon: 'error'
          });
        }  

        //Swal.close ();   

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
        //that.showToast('error', 'Erro!', msg.error.conekta.details[0].message);
      }
    });

  }

}
