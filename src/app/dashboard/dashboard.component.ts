import { Component, OnInit, AfterViewInit, HostListener, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { TableData } from '../lbd/lbd-table/lbd-table.component';
import { LegendItem, ChartType } from '../lbd/lbd-chart/lbd-chart.component';
import { Task } from '../lbd/lbd-task-list/lbd-task-list.component';

import * as Chartist from 'chartist';

//Mis imports
import { APIService } from '../services/API/API.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FormGroupDirective, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { SesionService } from '../services/sesion/sesion.service';
//import { Map, marker, tileLayer, icon } from 'leaflet';

//import * as jspdf from 'jspdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

declare var $:any;

declare interface DataTable {
    headerRow: string[];
    //footerRow: string[];
    dataRows: any[];
}


@Component({
  selector: 'dashboard-cmp',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit, OnDestroy {

    months = [
      { name: 'Enero', value: 1 },
      { name: 'Febrero', value: 2 },
      { name: 'Marzo', value: 3 },
      { name: 'Abril', value: 4 },
      { name: 'Mayo', value: 5 },
      { name: 'Junio', value: 6 },
      { name: 'Julio', value: 7 },
      { name: 'Agosto', value: 8 },
      { name: 'Septiembre', value: 9 },
      { name: 'Octubre', value: 10 },
      { name: 'Noviembre', value: 11 },
      { name: 'Diciembre', value: 12 }
    ];

    years = [];

    selectedMonth: number;
    selectedYear: number;

    //Pie chart
    //single: any[];
    view: any[] = [700, 400];

    // options
    gradient: boolean = true;
    showLegend: boolean = true;
    showLabels: boolean = true;
    isDoughnut: boolean = false;

    //number card chart
    colorScheme1 = {
      domain: ['#331335', '#552147', '#743777', '#a055a0']
    };

    single1 = [
      {
        "name": "Cargando...",
        "value": 0
      },
      {
        "name": "Cargando...",
        "value": 0
      },
      {
        "name": "Cargando...",
        "value": 0
      },
      {
        "name": "Cargando...",
        "value": 0
      }
    ];

    //Vertical bar chart
    //single2: any[];
    //multi2: any[];

    single2 = [
      {"name": "1", "value": 0},
      {"name": "2", "value": 0},
      {"name": "3", "value": 0},
      {"name": "4", "value": 0},
      {"name": "5", "value": 0},
      {"name": "6", "value": 0},
      {"name": "7", "value": 0},
      {"name": "8", "value": 0},
      {"name": "9", "value": 0},
      {"name": "10", "value": 0},
      {"name": "11", "value": 0},
      {"name": "12", "value": 0},
      {"name": "13", "value": 0},
      {"name": "14", "value": 0},
      {"name": "15", "value": 0},
      {"name": "16", "value": 0},
      {"name": "17", "value": 0},
      {"name": "18", "value": 0},
      {"name": "19", "value": 0},
      {"name": "20", "value": 0},
      {"name": "21", "value": 0},
      {"name": "22", "value": 0},
      {"name": "23", "value": 0},
      {"name": "24", "value": 0},
      {"name": "25", "value": 0},
      {"name": "26", "value": 0},
      {"name": "27", "value": 0},
      {"name": "28", "value": 0},
      {"name": "29", "value": 0},
      {"name": "30", "value": 0},
      {"name": "31", "value": 0}
    ];

    // options
    showXAxis2 = true;
    showYAxis2 = true;
    gradient2 = false;
    showLegend2 = false;
    showXAxisLabel2 = false;
    xAxisLabel2 = 'Country';
    showYAxisLabel2 = false;
    yAxisLabel2 = 'Population';

    colorScheme2 = {
      domain: ['#743777']
    };

    user_rol = null;

    //Ventas por hora
    guias = [];
    loadDiagram4 = false;
    diagram4 = false;
    radioModelD4 = 'right';
    diaD4: any;
    mesD4: any;
    anioD4: any;

    meses = [1,2,3,4,5,6,7,8,9,10,11,12];

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

      var fecha = new Date();
      //var fecha = Date.now();
      //this.selectedDay = fecha.getDate();
      this.selectedMonth = fecha.getMonth() + 1;
      this.selectedYear = fecha.getFullYear();

      this.years.push(this.selectedYear);
      for (var i = 1; i < 3; i++) {
        this.years.push(this.selectedYear - i);
      }

      //this.diaD4 = this.selectedDay;
      this.mesD4 = this.selectedMonth;
      this.anioD4 = this.selectedYear;

      this.user_rol  =  this.sesion_serv.getUserRol();

    }

    ngOnInit(){

      // Bloquear el comportamiento predeterminado del botón de retroceso
      // history.pushState(null, null, location.href);
      // window.onpopstate = function(event) {
      //   history.go(1);
      // };

      this.getContadores();
      setTimeout(()=>{
        this.getDiagram4();
      },100);

      console.log(this.user_rol);


    }

    ngOnDestroy() {
      // acciones de destrucción
      //this.closeModal('#myModalImg');
    }

    ngAfterViewInit(){

    }

    /* ---- Auto resize chart ---- */
    // resizeChart(width: any): void {
    //   this.view2 = [width, 300]
    // }

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

      this.logout();
      // if(localStorage.getItem('ruta_login') && localStorage.getItem('ruta_login') == '1'){
      //   this.logout();
      // }else{
      //   this._location.back();
      // }

    }

    logout() {
        
        Swal.fire({
          title: '¿Está seguro?',
          text: `Está seguro que desea cerrar sesión`,
          icon: 'question',
          showConfirmButton: true,
          showCancelButton: true
        }).then( resp => {

            if ( resp.value ) {

                this.sesion_serv.resetSesion();
                this.router.navigateByUrl('/pages/login');  

            }

        });
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

    atras(): void {

      this.scroll_to('id_scroll');

    }

    getContadores(){

      this.colorScheme1 = {
        domain: ['#331335', '#552147', '#743777', '#a055a0']
      };

      this.single1 = [];

      // Swal.fire({
      //   title: 'Espere',
      //   text: 'Cargando',
      //   icon: 'info',
      //   allowOutsideClick: false
      // });
      // Swal.showLoading();
    
      var datos = {};

      var that = this;

      let end_point = '';
      if(this.user_rol == '1'){
        end_point = `dashboard/admin/contadores`;
      }else if(this.user_rol == '2'){
        end_point = `dashboard/contadores`;
      }

      this.api_serv.getQuery(end_point)
      .subscribe({
        next(data : any) {
          console.log(data);

          that.single1 = [
            {
              "name": "Saldo actual",
              "value": data.saldo
            },
            {
              "name": "Envíos en el mes",
              "value": data.guias
            },
            {
              "name": "Sobrepesos en el mes",
              "value": data.sobrepesos
            },
            {
              "name": "Costo total en el mes",
              "value": data.costo_total
            }
          ];

          //Swal.close ();

        },
        error(msg) {
          console.log(msg);
          that.tratarError(msg);
        }
      });

    }


  //Obtener las guias por dia
  getDiagram4() {

    this.single2 = [
    ]

    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var dia = null;
    var mes = this.mesD4;
    var anio = this.anioD4;

    this.diagram4 = false;
    this.loadDiagram4 = true;
    this.guias = [];
    var that = this;

    let end_point = '';
    if(this.user_rol == '1'){
      end_point = `dashboard/admin/guias/filter/mes?dia=${dia}&mes=${mes}&anio=${anio}`;
    }else if(this.user_rol == '2'){
      end_point = `dashboard/guias/filter/mes?dia=${dia}&mes=${mes}&anio=${anio}`;
    }
      
    this.api_serv.getQuery(end_point)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.guias = data.guias;


        that.loadDiagram4 = false;

        if (that.guias.length > 0) {
          that.diagram4 = true;

          that.single2 = [
            {"name": "1", "value": that.guias[0].count_guias},
            {"name": "2", "value": that.guias[1].count_guias},
            {"name": "3", "value": that.guias[2].count_guias},
            {"name": "4", "value": that.guias[3].count_guias},
            {"name": "5", "value": that.guias[4].count_guias},
            {"name": "6", "value": that.guias[5].count_guias},
            {"name": "7", "value": that.guias[6].count_guias},
            {"name": "8", "value": that.guias[7].count_guias},
            {"name": "9", "value": that.guias[8].count_guias},
            {"name": "10", "value": that.guias[9].count_guias},
            {"name": "11", "value": that.guias[10].count_guias},
            {"name": "12", "value": that.guias[11].count_guias},
            {"name": "13", "value": that.guias[12].count_guias},
            {"name": "14", "value": that.guias[13].count_guias},
            {"name": "15", "value": that.guias[14].count_guias},
            {"name": "16", "value": that.guias[15].count_guias},
            {"name": "17", "value": that.guias[16].count_guias},
            {"name": "18", "value": that.guias[17].count_guias},
            {"name": "19", "value": that.guias[18].count_guias},
            {"name": "20", "value": that.guias[19].count_guias},
            {"name": "21", "value": that.guias[20].count_guias},
            {"name": "22", "value": that.guias[21].count_guias},
            {"name": "23", "value": that.guias[22].count_guias},
            {"name": "24", "value": that.guias[23].count_guias},
            {"name": "25", "value": that.guias[24].count_guias},
            {"name": "26", "value": that.guias[25].count_guias},
            {"name": "27", "value": that.guias[26].count_guias},
            {"name": "28", "value": that.guias[27].count_guias},
            {"name": "29", "value": that.guias[28].count_guias},
            {"name": "30", "value": that.guias[29].count_guias},
            {"name": "31", "value": that.guias[30].count_guias}
          ];
        }else{
          that.diagram4 = false;
        } 

        Swal.close ();    
      },
      error(msg) {
        console.log(msg);
        that.loadDiagram4 = false;
        that.tratarError(msg);
      }
    });
  }


}
