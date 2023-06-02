let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

const categorias = {
    1: 'Comidas',
    2: 'Bebidas',
    3: 'Postres'
};


const guardarClienteBtn = document.querySelector('#guardar-cliente');
guardarClienteBtn.addEventListener('click', guardarCliente);


function guardarCliente(){
    const mesaInput = document.querySelector('#mesa');
    const horaInput = document.querySelector('#hora');

    if(mesaInput.value === '' || horaInput.value === ''){
        mostrarAlerta('Por favor complete los campos');
        return;
    }

    cliente.mesa = mesaInput.value;
    cliente.hora = horaInput.value;

    //Cerrar modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();


    mostrarSecciones();   
}

function mostrarSecciones() {
    const platillos = document.querySelector('#platillos');
    platillos.classList.remove('d-none');

    const resumen = document.querySelector('#resumen');
    resumen.classList.remove('d-none');

    consultarAPI();
}


function consultarAPI() {
    fetch('http://localhost:4000/platillos')
        .then(resultado => {
            return resultado.json();
        })
        .then(datos => {
            mostrarPlatillos(datos);
        })
        .catch(error => {
            console.log(error);
        })
}

function mostrarPlatillos(platillosArray){
    const contenedorPlatillos = document.querySelector('#platillos .contenido');

    platillosArray.forEach(platillo => {
        const {nombre, precio, categoria, id} = platillo;

        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top', 'border-bottom');

        const nombrePlato = document.createElement('DIV');
        nombrePlato.classList.add('col-md-4');
        nombrePlato.textContent = nombre;

        const precioPlato = document.createElement('DIV');
        precioPlato.classList.add('col-md-3', 'fw-bold');
        precioPlato.textContent = `$${precio}`;

        const categoriaPlato = document.createElement('DIV');
        categoriaPlato.classList.add('col-md-3');
        categoriaPlato.textContent = categorias[categoria];

        const cantidadInput = document.createElement('input');
        cantidadInput.type = 'number';
        cantidadInput.min = 0;
        cantidadInput.value = 0;
        cantidadInput.id = `producto-${id}`;
        cantidadInput.classList.add('form-control');

        //agregar el gasto por cada change en el input
        cantidadInput.onchange = function() {
            const cantidad = parseInt(cantidadInput.value);
            agregarPlatillo({...platillo, cantidad}); //paso el platillo y la cantidad como objeto, pero no el objeto original porque los separa, sino solo una copia para que no actue como obj aparte y me traiga un solo objeto con los datos del platillo y la cantidad en un solo obj
        }

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(cantidadInput);

        row.appendChild(nombrePlato);
        row.appendChild(precioPlato);
        row.appendChild(categoriaPlato);
        row.appendChild(agregar);

        contenedorPlatillos.appendChild(row);
    });
}

function agregarPlatillo(platillo) {
    //obtengo el arreglo actual de pedidos
    let {pedido} = cliente;

    if(platillo.cantidad > 0){
        //se fija si ya estaba en el array, y si ya estaba update a cantidad
        if(pedido.some(plato => plato.id === platillo.id)){
            //si ya estaba en el array, update cantidad
            const pedidoActualizado = pedido.map(articulo => {
                if(articulo.id === platillo.id){
                    articulo.cantidad = platillo.cantidad;
                }
                //que retorne el articulo ya actualizado
                return articulo;
            });
            //asignar el array actualizado
            cliente.pedido = [...pedidoActualizado];

        }else{
            //si no existía, lo pusheo al array normalmente
            cliente.pedido = [...pedido, platillo]; //convierto el array original a lo que tenia el pedido pero agregandole el platillo nuevo
        }
    }else{
        //si la cantidad es 0, eliminar el producto que cumpla con la condicion
        const resultado = cliente.pedido.filter(articulo => articulo.id !== platillo.id);
        cliente.pedido = [...resultado];
    }

    //mostrar mensaje de agregar pedidos cuando esté vacio
    if(cliente.pedido.length){
        //mostrar el resumen de pedidos en el HTML
        mostrarResumen();
    }else{
        limpiarHTML();
        consumosVacios();
    }

}

function mostrarResumen(){
    limpiarHTML();

    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'bg-white', 'p-3', 'rounded');

    const mesa = document.createElement('P');
    mesa.classList.add('fw-bold');
    mesa.textContent = 'Mesa: ';

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.classList.add('fw-normal');
    mesaSpan.textContent = cliente.mesa;

    const hora = document.createElement('P');
    hora.classList.add('fw-bold');
    hora.textContent = 'Hora: ';

    const horaSpan = document.createElement('SPAN');
    horaSpan.classList.add('fw-normal');
    horaSpan.textContent = cliente.hora;

    const tituloSeccion = document.createElement('H3');
    tituloSeccion.classList.add('text-center', 'my-4');
    tituloSeccion.textContent = 'Consumido';

    //Iterar en el array de pedidos. . . 
    const ul = document.createElement('UL');
    ul.classList.add('list-group');

    cliente.pedido.forEach(articulo => {
        const li = document.createElement('LI');
        li.classList.add('list-group-item', 'mb-3', 'border');

        const nombreArticulo = document.createElement('H3');
        nombreArticulo.textContent = articulo.nombre;

        const cantidad = document.createElement('P');
        cantidad.textContent = 'Cantidad: ';

        const cantidadSpan = document.createElement('SPAN');
        cantidadSpan.textContent = articulo.cantidad;

        const precio = document.createElement('P');
        precio.textContent = 'Precio: ';

        const precioSpan = document.createElement('SPAN');
        precioSpan.textContent = `$${articulo.precio}`;

        const subTotal = document.createElement('P');
        subTotal.textContent = 'Subtotal: ';

        const subtTotalSpan = document.createElement('SPAN');
        subtTotalSpan.textContent = `$${articulo.precio * articulo.cantidad}`;

        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.id = articulo.id;
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del pedido';

        btnEliminar.onclick = function(e){
            const idBoton = parseInt(e.target.id);
            eliminarConsumo(idBoton);
        }

        //agregar a elementos padres
        cantidad.appendChild(cantidadSpan);
        precio.appendChild(precioSpan);
        subTotal.appendChild(subtTotalSpan);

        //agregar al li
        li.appendChild(nombreArticulo);
        li.appendChild(cantidad);
        li.appendChild(precio);
        li.appendChild(subTotal);
        li.appendChild(btnEliminar);

        ul.appendChild(li);
    })


    //Agregar . . .
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    resumen.appendChild(tituloSeccion);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    
    resumen.appendChild(ul);

    contenido.appendChild(resumen);

    //mostrar columna de propinas
    seccionPropina();
}

function seccionPropina() {
    const resumen = document.querySelector('#resumen .contenido');

    const columnaPropina = document.createElement('DIV');
    columnaPropina.classList.add('col-md-6');

    const propinaDiv = document.createElement('DIV');
    propinaDiv.classList.add('formulario', 'bg-white', 'p-3', 'rounded');

    const propinaHeading = document.createElement('H3');
    propinaHeading.classList.add('my-4', 'text-center');
    propinaHeading.textContent = 'Propina';

    //RADIO BUTTONS

    //10%
    const radio10 = document.createElement('INPUT');
    radio10.classList.add('form-check-input');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('LABEL');
    radio10Label.classList.add('form-check-label', 'fw-bold');
    radio10Label.textContent = '10%';

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    //25%
    const radio25 = document.createElement('INPUT');
    radio25.classList.add('form-check-input');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('LABEL');
    radio25Label.classList.add('form-check-label', 'fw-bold');
    radio25Label.textContent = '25%';

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');

    //50%

    const radio50 = document.createElement('INPUT');
    radio50.classList.add('form-check-input');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('LABEL');
    radio50Label.classList.add('form-check-label', 'fw-bold');
    radio50Label.textContent = '50%';

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');

    //appends
    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);



    propinaDiv.appendChild(propinaHeading);
    propinaDiv.appendChild(radio10Div);
    propinaDiv.appendChild(radio25Div);
    propinaDiv.appendChild(radio50Div);

    columnaPropina.appendChild(propinaDiv);

    resumen.appendChild(columnaPropina);
}

function eliminarConsumo(id){
    cliente.pedido = cliente.pedido.filter(articulo => articulo.id !== id);

    if(cliente.pedido.length){
        mostrarResumen();
    }else{
        limpiarHTML();
        consumosVacios();
    }

    //volver a 0 el select de cantidad
    const selectCantidad = document.querySelector(`#producto-${id}`);
    selectCantidad.value = 0;
}

function consumosVacios() {
    const contenedor = document.querySelector('#resumen .contenido');

    const textoVacio = document.createElement('P');
    textoVacio.classList.add('text-center');
    textoVacio.textContent = 'Añade los elementos del pedido';

    contenedor.appendChild(textoVacio);
}


function calcularPropina() {
    const {pedido} = cliente;

    let subtotal = 0; //variable auxiliar para calcular el total a pagar por cada elemento que se encargó en el pedido
    
    //calcular el subtotal sin propina
    pedido.forEach(articulo => {
        subtotal += articulo.precio * articulo.cantidad;
    });
    
    //calcular la propina
    const radioSeleccionado = parseInt(document.querySelector('[name="propina"]:checked').value);

    const propina = (subtotal * radioSeleccionado) / 100;

    //calcular el total con la propina
    const total = subtotal + propina;

    //imprimir los totales
    mostrarTotales(subtotal, propina, total);
}

function mostrarTotales(subtotal, propina, total) {
    const formularioPropina = document.querySelector('.formulario');

    const divTotales = document.createElement('DIV');
    divTotales.classList.add('totales', 'my-4');

    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('mt-3', 'fw-bold', 'fs-4');
    subtotalParrafo.textContent = 'Subtotal: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal')
    subtotalSpan.textContent = `$${subtotal}`;

    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('mt-3', 'fw-bold', 'fs-4');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal')
    propinaSpan.textContent = `$${propina}`;

    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('mt-3', 'fw-bold', 'fs-3');
    totalParrafo.textContent = 'Total a pagar: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    //appends
    subtotalParrafo.appendChild(subtotalSpan);
    propinaParrafo.appendChild(propinaSpan);
    totalParrafo.appendChild(totalSpan);

    //borrar el previo si es que cambia de checkbox
    const totalesDiv = document.querySelector('.totales');
    if(totalesDiv){
        totalesDiv.remove();
    }

    divTotales.appendChild(subtotalParrafo)
    divTotales.appendChild(propinaParrafo)
    divTotales.appendChild(totalParrafo)

    formularioPropina.appendChild(divTotales);
}


function mostrarAlerta(mensaje) {
    const existe = document.querySelector('.alerta');
    if(existe){
        existe.remove();
    }

    const alerta = document.createElement('DIV');
    alerta.className = 'alerta text-center py-2 w-100 fs-5 text-white bg-danger rounded';
    alerta.textContent = mensaje;

    const modalBody = document.querySelector('.modal-body')
    modalBody.appendChild(alerta);

    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

function limpiarHTML() {
    const resumen = document.querySelector('#resumen .contenido');
    while(resumen.firstChild) {
        resumen.removeChild(resumen.firstChild);
    }
}

