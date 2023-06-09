/*
Alternativamente:
Se puede subir una base de datos local del archivo db.json, se debe tener instalado NodeJs y json-server
Ejecutar: json-server --watch db.json --port 4000
*/


let cliente = {
    mesa: '',
    hora:'',
    pedido: []
}

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente')
btnGuardarCliente.addEventListener('click', guardarCliente)


function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    // Validar datos
    if ([ mesa, hora ].some( campo => campo === '')){

        // Verificar alerta
        const existeAlerta = document.querySelector('.invalid-feedback');

        if (!existeAlerta){
            const alerta = document.createElement('P');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);
            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }
        return; 
    }

    // Asignar datos de formulario a cliente
    cliente = {...cliente, mesa, hora}

    // Ocultar modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    // Mostrar secciones
    mostrarSecciones();

    // Obtener platillos de la API
    obtenerPlatillos();


}

function mostrarSecciones(){
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach( seccion => seccion.classList.remove('d-none'));
}

function obtenerPlatillos(){
    const url = 'https://64382121c1565cdd4d66ebc4.mockapi.io/api/v1/platillos';
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(platos => mostrarPlatillos(platos))
        .catch( error => console.log(error))
}

function mostrarPlatillos(platos){
    const contenido = document.querySelector('#platillos .contenido');

    platos.forEach(plato => {
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        const nombre = document.createElement('DIV');
        nombre.classList.add('col-4');
        nombre.textContent = plato.nombre;

        const precio = document.createElement('DIV');
        precio.classList.add('col-3', 'fw-bold');
        precio.textContent = `$ ${plato.precio}` ;

        const categoria = document.createElement('DIV');
        categoria.classList.add('col-3');
        categoria.textContent = categorias[ plato.categoria ];

        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.id = `producto-${plato.id}`;
        inputCantidad.value = 0;
        inputCantidad.classList.add('form-control');

        // Funcion que detecta la cantidad y el platillo que se esta agregando
        inputCantidad.onchange = function() {
            const cantidad = parseInt( inputCantidad.value );
            agregarPlatillo({...plato, cantidad})
        };

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-2');
        agregar.appendChild(inputCantidad)

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        contenido.appendChild(row);
    });
}

function agregarPlatillo(producto) {

    let { pedido } = cliente;
    // Revisar que la cantidad sea mayor a 0
    if(producto.cantidad > 0 ){

        // Comprueba que el articulo ya existe en el arreglo
        if(pedido.some(articulo => articulo.id === producto.id)){
            // El articulo existe, de actualiza la cantidad
            const pedidoActualizado = pedido.map(articulo => {
                if ( articulo.id === producto.id ){
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });
            // Se asigna nuevo arreglo a cliente.pedido
            cliente.pedido = [... pedidoActualizado];
        }
        else{
            // El articulo no exis,te se agrega el arreglo
            cliente.pedido = [...pedido, producto];
        }
        
    } else{
        // Eliminar elemneto cuando cantidad es igual a cero
        const pedidoActualizado = pedido.filter( articulo => articulo.id !== producto.id )
        cliente.pedido = [... pedidoActualizado];
    }
    // Limpiar HTML
    const contenido = document.querySelector('#resumen .contenido')
    limpiarHTML(contenido);

    if(cliente.pedido.length){
        // Mostrar el resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    
}

function actualizarResumen(){
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-6', 'card', 'py-2', 'px-3', 'shadow');

    // Informacion Mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold')

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    // Informacion Hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold')

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    // Agregar a los elementos padre
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    // Titulo de la seccion
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos Consumidos';
    heading.classList.add('my-4', 'text-center')

    //Iterar sobre el arreglo de contenido
    const grupo = document.createElement('UL');
    let total = 0;
    grupo.classList.add('list-group');

    const {pedido} = cliente;

    pedido.forEach(articulo => {
        const {nombre, cantidad, precio, id} = articulo;
        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreElem = document.createElement('H4');
        nombreElem.classList.add('my-4');
        nombreElem.textContent = nombre;

        // Cantidad articulo
        const cantidadElem = document.createElement('P');
        cantidadElem.classList.add('fw-bold');
        cantidadElem.textContent = 'Cantidad: ';

        const cantidadSpan = document.createElement('SPAN');
        cantidadSpan.textContent = cantidad;
        cantidadSpan.classList.add('fw-normal');

        // Precio Articulo
        const precioElem = document.createElement('P');
        precioElem.classList.add('fw-bold');
        precioElem.textContent = 'Precio: ';

        const precioSpan = document.createElement('SPAN');
        precioSpan.textContent = `$${precio}`;
        precioSpan.classList.add('fw-normal');

        // SubTotal
        const totalElem = document.createElement('P');
        totalElem.classList.add('fw-bold');
        totalElem.textContent = 'SubTotal: ';

        const totalSpan = document.createElement('SPAN');
        totalSpan.textContent = calcularSubTotal(precio, cantidad);
        totalSpan.classList.add('fw-normal');

        // Boton eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger' ,'btn-sm');
        btnEliminar.textContent = 'Eliminar el Pedido';

        // Funcion eliminar pedido
        btnEliminar.onclick = function() {
            eliminarProducto(id);
        }

        
        // Agregar valores a sus contenedores
        cantidadElem.appendChild(cantidadSpan);
        precioElem.appendChild(precioSpan);
        totalElem.appendChild(totalSpan);


        // Agregar elementos al LI
        lista.appendChild(nombreElem);
        lista.appendChild(cantidadElem);
        lista.appendChild(precioElem);
        lista.appendChild(totalElem);
        lista.appendChild(btnEliminar);


        // Agregar lista al grupo principal
        grupo.appendChild(lista)

        
    });


    // Agregar al contenido
    resumen.appendChild(heading);
    resumen.appendChild(hora);
    resumen.appendChild(mesa);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    // Mostrar formulario de Propinas
    formularioPropinas();

}

function limpiarHTML(contenido){
    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubTotal(precio, cantidad){
    return `$ ${precio * cantidad}`
}

function eliminarProducto(id){
    const { pedido } = cliente
    const pedidoActualizado = pedido.filter( articulo => articulo.id !== id )
    cliente.pedido = [...pedidoActualizado];

    console.log(cliente.pedido)

    // Limpiar HTML
    const contenido = document.querySelector('#resumen .contenido')
    limpiarHTML(contenido);

    if(cliente.pedido.length){
        // Mostrar el resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    // El producto se elimino, por lo que se regresa el form a cero
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;


}

function mensajePedidoVacio(){
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido'

    contenido.appendChild(texto);
}

function formularioPropinas(){
    const contenido = document.querySelector('#resumen .contenido');

    const formPropinas = document.createElement('DIV');
    formPropinas.classList.add('col-6', 'formulario');

    const divForm = document.createElement('DIV');
    divForm.classList.add('card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    // Radio Button 0
    const radio0 = document.createElement('INPUT');
    radio0.type = 'radio';
    radio0.name = 'propina';
    radio0.value = "0";
    radio0.classList.add('form-check-input');
    radio0.onclick = ( () => {
        radioOtroInput.disabled = true;
        radioOtroInput.value = '';
        calcularPropina()
    })


    const radio0label = document.createElement('LABEL');
    radio0label.textContent = 'Sin propina';
    radio0label.classList.add('form-check-label');

    const radios0div = document.createElement('DIV');
    radios0div.classList.add('form-check');

    radios0div.appendChild(radio0);
    radios0div.appendChild(radio0label);


    // Radio Button 10%
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = "10";
    radio10.classList.add('form-check-input');
    radio10.onclick = ( () => {
        radioOtroInput.disabled = true;
        radioOtroInput.value = '';
        calcularPropina()
    })


    const radio10label = document.createElement('LABEL');
    radio10label.textContent = '10%';
    radio10label.classList.add('form-check-label');

    const radios10div = document.createElement('DIV');
    radios10div.classList.add('form-check');

    radios10div.appendChild(radio10);
    radios10div.appendChild(radio10label);

    // Radio Button 20%
    const radio20 = document.createElement('INPUT');
    radio20.type = 'radio';
    radio20.name = 'propina';
    radio20.value = "20";
    radio20.classList.add('form-check-input');
    radio20.onclick = ( () => {
        radioOtroInput.disabled = true;
        radioOtroInput.value = '';
        calcularPropina()
    })

    const radio20label = document.createElement('LABEL');
    radio20label.textContent = '20%';
    radio20label.classList.add('form-check-label');

    const radios20div = document.createElement('DIV');
    radios20div.classList.add('form-check');

    radios20div.appendChild(radio20);
    radios20div.appendChild(radio20label);

    // Radio Button Otro

    const radioOtro = document.createElement('INPUT');
    radioOtro.type = 'radio';
    radioOtro.name = 'propina';
    radioOtro.value = "otro";
    radioOtro.classList.add('form-check-input');
    radioOtro.onclick = ( () => {
        if (radioOtro.checked){
            radioOtroInput.disabled = false;
        }
    })

    const radioOtrolabel = document.createElement('LABEL');
    radioOtrolabel.textContent = 'Otro Monto: $';
    radioOtrolabel.classList.add('form-check-label');

    const radiosOtrodiv = document.createElement('DIV');
    radiosOtrodiv.classList.add('form-check','d-flex', 'align-items-center');

    const radioOtroInput = document.createElement('INPUT');
    radioOtroInput.type = 'text';
    radioOtroInput.name = 'propina-cash';
    radioOtroInput.classList.add('form-control', 'w-25', 'form-check-label', 'mx-1' );
    radioOtroInput.disabled = true;
    radioOtroInput.oninput = calcularPropina;


    radiosOtrodiv.appendChild(radioOtro);
    radiosOtrodiv.appendChild(radioOtrolabel);
    radiosOtrodiv.appendChild(radioOtroInput);
    

    // Agregar al DIV principal
    divForm.appendChild(heading);
    divForm.appendChild(radios0div);
    divForm.appendChild(radios10div);
    divForm.appendChild(radios20div);
    divForm.appendChild(radiosOtrodiv);

    // Agregar al formulario
    formPropinas.appendChild(divForm)
    contenido.appendChild(formPropinas);
}

function calcularPropina(){
    const { pedido } = cliente;
    let subtotal = 0
    pedido.forEach( articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    })

    // Seleccionar radio button con la propina del cliente
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    let propina;
    // Verifica si se ingreso otra propina y calcula propina
    if(propinaSeleccionada==='otro'){
        const valorPropina = document.querySelector('[name="propina-cash"]').value;
        propina = parseInt(valorPropina);
    } else{
        propina = ((subtotal * parseInt(propinaSeleccionada))/100);
    }

    // Calcula el total a pagar
    const total = subtotal + propina;

    mostrarTotalHTML(subtotal, total, propina);
}


function mostrarTotalHTML(subtotal, total, propina) {

    const formulario = document.querySelector('.formulario > div');
    

    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar')

    // Subtotal
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-2', 'fw-bold', 'mt-5');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    // Propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-2', 'fw-bold');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;

    // Total
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-2', 'fw-bold');
    totalParrafo.textContent = 'Total a Pagar: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;
    

    subtotalParrafo.appendChild(subtotalSpan);
    propinaParrafo.appendChild(propinaSpan);
    totalParrafo.appendChild(totalSpan);

    // Eliminar el ultimo resultado
    const totalPagarDiv = document.querySelector('.total-pagar')
    if(totalPagarDiv){
        totalPagarDiv.remove();
    }


    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);



    
    formulario.appendChild(divTotales)
}