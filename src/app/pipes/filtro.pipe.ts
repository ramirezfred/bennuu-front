import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtro'
})
export class FiltroPipe implements PipeTransform {

  transform(listado: any[], page: number = 0, search: string = '', model: string = ''): any[] {

    if( search.length === 0 ){
      return listado.slice(page, page + 5);
    }

    let searchLowerCase = search.toLowerCase();

    if( model == 'Guia' ){
      const filteredListado = listado.filter( item =>
        item.id.toString().includes( searchLowerCase ) ||
        item.created_at.toLowerCase().includes( searchLowerCase ) ||
        item.usuario.email.toLowerCase().includes( searchLowerCase ) ||
        item.remitente.nombre.toLowerCase().includes( searchLowerCase ) ||
        item.remitente.apellido.toLowerCase().includes( searchLowerCase ) ||
        item.remitente.cp.toString().includes( searchLowerCase ) ||
        item.destino.nombre.toLowerCase().includes( searchLowerCase ) ||
        item.destino.apellido.toLowerCase().includes( searchLowerCase ) ||
        item.destino.cp.toString().includes( searchLowerCase ) ||
        item.paquete.tipo.toLowerCase().includes( searchLowerCase ) ||
        item.paquete.peso.toString().includes( searchLowerCase ) ||
        item.proveedor.toLowerCase().includes( searchLowerCase ) ||
        item.servicio_tipo_aux.toLowerCase().includes( searchLowerCase ) ||
        item.guia.toLowerCase().includes( searchLowerCase ) ||
        item.estado.toLowerCase().includes( searchLowerCase ) /*||
        item.total.toString().includes( searchLowerCase ) */
      );
      return filteredListado.slice(page, page + 5);    
    }if( model == 'GuiaAdmin' ){
      const filteredListado = listado.filter( item =>
        item.id.toString().includes( searchLowerCase ) ||
        item.created_at.toLowerCase().includes( searchLowerCase ) ||
        item.usuario.email.toLowerCase().includes( searchLowerCase ) ||
        item.remitente.nombre.toLowerCase().includes( searchLowerCase ) ||
        item.remitente.apellido.toLowerCase().includes( searchLowerCase ) ||
        item.remitente.cp.toString().includes( searchLowerCase ) ||
        item.destino.nombre.toLowerCase().includes( searchLowerCase ) ||
        item.destino.apellido.toLowerCase().includes( searchLowerCase ) ||
        item.destino.cp.toString().includes( searchLowerCase ) ||
        item.paquete.tipo.toLowerCase().includes( searchLowerCase ) ||
        item.paquete.peso.toString().includes( searchLowerCase ) ||
        item.proveedor.toLowerCase().includes( searchLowerCase ) ||
        item.servicio_tipo_aux.toLowerCase().includes( searchLowerCase ) ||
        item.guia.toLowerCase().includes( searchLowerCase ) ||
        item.estado.toLowerCase().includes( searchLowerCase ) /*||
        item.total.toString().includes( searchLowerCase ) */
      );
      return filteredListado.slice(page, page + 5);    
    }else if( model == 'Movimiento' ){
      const filteredListado = listado.filter( item =>
        item.created_at.toLowerCase().includes( searchLowerCase ) ||
        item.usuario.email.toLowerCase().includes( searchLowerCase ) ||
        item.total.toString().includes( searchLowerCase ) ||
        item.tipo.toLowerCase().includes( searchLowerCase ) ||
        item.api_tipo_pago.toLowerCase().includes( searchLowerCase ) 
      );
      return filteredListado.slice(page, page + 5);    
    }else if( model == 'Sobrepeso' ){
      const filteredListado = listado.filter( item =>
        item.usuario.email.toLowerCase().includes( searchLowerCase ) ||
        item.guia.remitente.nombre.toLowerCase().includes( searchLowerCase ) ||
        item.guia.remitente.apellido.toLowerCase().includes( searchLowerCase ) ||
        item.guia.remitente.cp.toString().includes( searchLowerCase ) ||
        item.guia.destino.nombre.toLowerCase().includes( searchLowerCase ) ||
        item.guia.destino.apellido.toLowerCase().includes( searchLowerCase ) ||
        item.guia.destino.cp.toString().includes( searchLowerCase ) ||
        item.guia.paquete.tipo.toLowerCase().includes( searchLowerCase ) ||
        item.guia.paquete.peso.toString().includes( searchLowerCase ) ||
        item.guia.proveedor.toLowerCase().includes( searchLowerCase ) ||
        item.guia.servicio_tipo_aux.toLowerCase().includes( searchLowerCase ) ||
        item.guia.guia.toLowerCase().includes( searchLowerCase ) ||
        item.guia.estado.toLowerCase().includes( searchLowerCase ) ||
        //item.guia.total.toString().includes( searchLowerCase ) || 
        item.estado.toLowerCase().includes( searchLowerCase ) ||
        //item.total.toString().includes( searchLowerCase ) ||
        item.observaciones.toLowerCase().includes( searchLowerCase )
      );
      return filteredListado.slice(page, page + 5);    
    }else if( model == 'User' ){
      const filteredListado = listado.filter( item =>
        item.id.toString().includes( searchLowerCase ) ||
        item.created_at.toLowerCase().includes( searchLowerCase ) ||
        item.saldo.toString().includes( searchLowerCase ) ||
        item.rfc?.toLowerCase().includes( searchLowerCase ) ||
        item.email.toLowerCase().includes( searchLowerCase ) 
      );
      return filteredListado.slice(page, page + 5);    
    }else if( model == 'Subuser' ){
      const filteredListado = listado.filter( item =>
        //item.id.toString().includes( searchLowerCase ) ||
        item.created_at.toLowerCase().includes( searchLowerCase ) ||
        //item.saldo.toString().includes( searchLowerCase ) ||
        item.rfc?.toLowerCase().includes( searchLowerCase ) ||
        item.email.toLowerCase().includes( searchLowerCase ) ||
        item.nombre?.toLowerCase().includes( searchLowerCase ) 
      );
      return filteredListado.slice(page, page + 5);    
    }else if( model == 'MovimientoAdmin' ){
      const filteredListado = listado.filter( item =>
        item.created_at.toLowerCase().includes( searchLowerCase ) ||
        item.total.toString().includes( searchLowerCase ) ||
        item.tipo.toLowerCase().includes( searchLowerCase ) ||
        item.api_tipo_pago.toLowerCase().includes( searchLowerCase ) ||
        item.usuario.email.toLowerCase().includes( searchLowerCase ) ||
        //item.usuario.telefono.toString().includes( searchLowerCase ) ||
        item.usuario.rfc.toLowerCase().includes( searchLowerCase ) ||
        item.usuario.business_name.toLowerCase().includes( searchLowerCase ) ||
        item.facturado.toLowerCase().includes( searchLowerCase )
      );
      return filteredListado.slice(page, page + 5);    
    }else if( model == 'SaldoApi' ){
      const filteredListado = listado.filter( item =>
        item.created_at.toLowerCase().includes( searchLowerCase ) ||
        item.api.api_proveedor.toLowerCase().includes( searchLowerCase ) ||
        item.saldo.toString().includes( searchLowerCase ) 
      );
      return filteredListado.slice(page, page + 5);    
    }else if( model == 'SaldoUser' ){
      const filteredListado = listado.filter( item =>
        item.created_at.toLowerCase().includes( searchLowerCase ) ||
        item.api_tipo_pago.toLowerCase().includes( searchLowerCase ) ||
        item.usuario.email.toLowerCase().includes( searchLowerCase ) ||
        item.total.toString().includes( searchLowerCase ) 
      );
      return filteredListado.slice(page, page + 5);    
    }else if( model == 'PaquetePrepagado' ){
      const filteredListado = listado.filter( item =>
        item.api_proveedor.toLowerCase().includes( searchLowerCase ) ||
        item.usuario.email.toLowerCase().includes( searchLowerCase ) ||
        item.tipo.toLowerCase().includes( searchLowerCase ) ||
        item.peso.toString().includes( searchLowerCase ) ||
        item.proveedor.toLowerCase().includes( searchLowerCase ) ||
        item.servicio_tipo_aux.toLowerCase().includes( searchLowerCase )
      );
      return filteredListado.slice(page, page + 5);    
    }else if( model == 'PaqueteriaServicio' ){
      const filteredListado = listado.filter( item =>
        item.api_proveedor.toLowerCase().includes( searchLowerCase ) ||
        item.nombre_transportista.toLowerCase().includes( searchLowerCase ) ||
        item.tipo_servicio.toLowerCase().includes( searchLowerCase ) ||
        (item.nombre_mostrar ?? '').toLowerCase().includes( searchLowerCase ) 
      );
      return filteredListado.slice(page, page + 5);    
    }else if( model == 'Aviso' ){
      const filteredListado = listado.filter( item =>
        item.titulo.toLowerCase().includes( searchLowerCase ) 
      );
      return filteredListado.slice(page, page + 5);    
    }else{
      return listado.slice(page, page + 5);
    }
    
    
  }

}
