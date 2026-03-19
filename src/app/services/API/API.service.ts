import { Injectable } from '@angular/core';

//Mis imports
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class APIService {

  	//Local freddy
	// public api_base = 'http://localhost/proyectos/proy_bennuu/bennuuAPI/public/';
	// public images_base = 'http://localhost/proyectos/proy_bennuu/bennuuAPI/public/images_uploads/';
	// public api_public = 'http://localhost/proyectos/proy_bennuu/bennuuAPI/public/';
	// public archivos_base = 'http://localhost/proyectos/proy_bennuu/bennuuAPI/public/archivos_uploads/';

	//Remoto vps
	public api_base = `https://api.bennuu.mx/`;
	public images_base = `https://api.bennuu.mx/images_uploads/`;
	public api_public = `https://api.bennuu.mx/`;
	public archivos_base = `https://api.bennuu.mx/archivos_uploads/`;

  constructor(private http: HttpClient) { }

	getRutaApi(){
		return this.api_base;
	}

	getRutaImages(){
		return this.images_base;
	}

	getRutaArchivos(){
    return this.archivos_base;
  }

	getToken(){
		if (localStorage.getItem('token')) {
			return localStorage.getItem("token");
		}else{
			return '';
		}
	}

	setToken( token : string, expires_in : number ){
		localStorage.setItem('token', token);   // localStorage.setItem('id', noOfClicks);
		
		/* let hoy = new Date();
    	hoy.setSeconds( 3600 );

    	localStorage.setItem('expira', hoy.getTime().toString() ); */

		let hoy = new Date();
    	hoy.setSeconds( expires_in );

		localStorage.setItem('expires_in', hoy.getTime().toString());   // localStorage.setItem('id', noOfClicks);
	}

	resetToken( ){
		localStorage.removeItem('token');    // localStorage.removeItem('id');
		localStorage.removeItem('expires_in');    // localStorage.removeItem('id');
	}

	postQuery( query : string, datos ){
		
		const url = this.api_base + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*',
				'Accept': 'application/json, text/plain'
			})
		  };

		//console.log('token serv '+this.getToken());  

		return this.http.post(url, datos, httpOptions);
	}

	postQueryUpload( query : string, datos ){
		
		const url = this.api_base + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
				//'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*',
				'Accept': 'application/json, text/plain',
				'enctype': 'multipart/form-data'
			})
		  };

		//console.log('token serv '+this.getToken());  

		return this.http.post(url, datos, httpOptions);
	}

	postQueryUploadV2( query : string, datos ){
		
		const url = this.api_public + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
				//'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*',
				'Accept': 'application/json, text/plain',
				'enctype': 'multipart/form-data'
			})
		  };

		//console.log('token serv '+this.getToken());  

		return this.http.post(url, datos, httpOptions);
	}

	getQuery( query : string ){
		
		const url = this.api_base + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
			})
		  };
		
		//console.log('token serv '+this.getToken()); 

		return this.http.get(url, httpOptions);
	}

	getQueryServ( query : string ){
		
		const url = 'https://api.bennuu.mx/' + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
			})
		  };
		
		//console.log('token serv '+this.getToken()); 

		return this.http.get(url, httpOptions);
	}

	getQueryDownload( query : string ){
		
		const url = this.api_base + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
			})
		  };
		
		//console.log('token serv '+this.getToken()); 

		return this.http.get(url, { responseType: 'blob' });
	}

	deleteQuery( query : string ){
		
		const url = this.api_base + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
			})
		  };
		
		//console.log('token serv '+this.getToken()); 

		return this.http.delete(url, httpOptions);
	}

	putQuery( query : string, datos ){
		
		const url = this.api_base + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*',
				'Accept': 'application/json, text/plain'
			})
		  };

		//console.log('token serv '+this.getToken());  

		return this.http.put(url, datos, httpOptions);
	}

	putQuery2( query : string, datos, token : string ){
    
    const url = this.api_base + query;

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization' : 'Bearer '+token,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Accept': 'application/json, text/plain'
      })
      };

    //console.log('token serv '+this.getToken());  

    return this.http.put(url, datos, httpOptions);
  }
}
