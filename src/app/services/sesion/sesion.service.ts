import { Injectable } from '@angular/core';
import { APIService } from '../API/API.service';

@Injectable({
  providedIn: 'root'
})
export class SesionService {

  public color_a : string = '#f99502';
  public color_b : string = '#170c66';

  constructor(private api_serv: APIService,) { }

  setUser( user : any ){
		localStorage.setItem('user', JSON.stringify(user));
	}

  getUser(){
    if (localStorage.getItem('user')) {
      let user = JSON.parse(localStorage.getItem("user"));
      return user;
    }else{
      return null;
    }
  }

  getUserId(){
		if (localStorage.getItem('user')) {
      let user = JSON.parse(localStorage.getItem("user"));
      return user.id;
    }else{
      return null;
    }
	}

  getUserEmail(){
    if (localStorage.getItem('user')) {
      let user = JSON.parse(localStorage.getItem("user"));
      return user.email;
    }else{
      return null;
    }
  }

  getUserRol(){
		if (localStorage.getItem('user')) {
      let user = JSON.parse(localStorage.getItem("user"));
      return user.tipo_usuario;
      //return 1;
    }else{
      return null;
    }
	}

  getUserNombre(){
		if (localStorage.getItem('user')) {
      let user = JSON.parse(localStorage.getItem("user"));
      return user.nombre;
      //return 'Admin';
    }else{
      return null;
    }
	}

  getUserImagen(){
		if (localStorage.getItem('cfdi_user')) {
      let user = JSON.parse(localStorage.getItem("cfdi_user"));
      return user.logo;
      //return 'assets/img/brand/Logointernowsocial.png';
    }else{
      return null;
    }
	}

  getUserTelefono(){
    if (localStorage.getItem('cfdi_user')) {
      let user = JSON.parse(localStorage.getItem("cfdi_user"));
      return user.telefono;
    }else{
      return null;
    }
  }

  getUserValidado(){
    if (localStorage.getItem('user')) {
      let user = JSON.parse(localStorage.getItem("user"));
      return user.validado;
    }else{
      return null;
    }
  }

  getUserSubUsuario(){
		if (localStorage.getItem('user')) {
      let user = JSON.parse(localStorage.getItem("user"));
      return user.padre_id;
      //return 1;
    }else{
      return null;
    }
	}

  resetSesion(){

    let email = '';
    if(localStorage.getItem('email')){
      email = localStorage.getItem('email');
    }
    let password = '';
    if(localStorage.getItem('pass')){
      password = localStorage.getItem('pass');
    }

    let aviso_privacidad = null;
    if(localStorage.getItem('aviso_privacidad')){
      aviso_privacidad = localStorage.getItem('aviso_privacidad');
    }
    // let terminos_condiciones = null;
    // if(localStorage.getItem('terminos_condiciones')){
    //   terminos_condiciones = localStorage.getItem('terminos_condiciones');
    // }

		//sessionStorage.removeItem('id');    // localStorage.removeItem('id');

    localStorage.clear();   // localStorage.clear();

    this.api_serv.resetToken();

    localStorage.setItem('email', email);
    localStorage.setItem('pass', password);

    if(aviso_privacidad){
      localStorage.setItem('aviso_privacidad', '1');
    }
    // if(terminos_condiciones){
    //   localStorage.setItem('terminos_condiciones', '1');
    // }
	}

  estaAutenticado(): boolean {

    if ( this.api_serv.getToken().length < 2 ) {
      return false;
    }else{
      return true;
    }

    // const expira = Number(localStorage.getItem('expires_in'));
    // const expiraDate = new Date();
    // expiraDate.setTime(expira);

    // if ( expiraDate > new Date() ) {
    //   return true;
    // } else {
    //   return false;
    // }


  }

  puedeFacturar() : boolean{
    if (localStorage.getItem('user')) {
      let user = JSON.parse(localStorage.getItem("user"));

      if (
        user.rfc == null || user.rfc == '' ||
        user.business_name == null || user.business_name == '' ||
        //user.regimen == null || user.regimen == '' ||
        user.zip_code == null || user.zip_code == '' ||
        //user.provided_id == null || user.provided_id == '' ||
        user.description == null || user.description == '' ||
        //user.provided_id_regimen == null || user.provided_id_regimen == '' ||
        user.description_regimen == null || user.description_regimen == '' ||
        user.business_email == null || user.business_email == ''
        ) {

        return false;
      }else{
        return true;
      }
      
    }else{
      return false;
    }
  }

  setFacturar(
    rfc,business_name,regimen,zip_code,
    provided_id,description,physical,moral,
    provided_id_regimen,description_regimen,business_email
  ) {

    if (sessionStorage.getItem('user')) {
      let user = JSON.parse(sessionStorage.getItem("user"));

      user.rfc = rfc;
      user.business_name = business_name;
      user.regimen = regimen;
      user.zip_code = zip_code;
      user.provided_id = provided_id;
      user.description = description;
      user.provided_id_regimen = provided_id_regimen;
      user.description_regimen = description_regimen;
      user.business_email = business_email;
         
      sessionStorage.setItem('user', JSON.stringify(user));
    }
    
  }

}
