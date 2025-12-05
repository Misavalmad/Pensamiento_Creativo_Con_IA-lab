// ============================================
// SISTEMA DE ANALISIS DEPORTIVO - VERSION ALTERNATIVA
// ============================================

/**
 * DATOS DE EJEMPLO: Estadisticas de jugadores de futbol
 */
let jugadores = [
    { id: 1, nombre: 'Messi', goles: 25, asistencias: 15, minutos: 2700, tarjetas: 2 },
    { id: 2, nombre: 'Ronaldo', goles: 30, asistencias: 8, minutos: 2900, tarjetas: 1 },
    { id: 3, nombre: 'Neymar', goles: 18, asistencias: 20, minutos: 2300, tarjetas: 5 },
    { id: 4, nombre: 'Mbappe', goles: 22, asistencias: 12, minutos: 2800, tarjetas: 0 },
    { id: 5, nombre: 'Lewandowski', goles: 35, asistencias: 5, minutos: 3000, tarjetas: 3 },
    { id: 6, nombre: 'De Bruyne', goles: 10, asistencias: 25, minutos: 2600, tarjetas: 2 }
];

/**
 * FUNCIONES PRINCIPALES (Fase 2)
 */

function transformarArray(array, transformador) {
    const resultado = [];
    for (let i = 0; i < array.length; i++) {
        resultado.push(transformador(array[i], i, array));
    }
    return resultado;
}

function filtrarRecursivo(array, criterio, indice = 0, acumulado = []) {
    if (indice >= array.length) {
        return acumulado;
    }
    if (criterio(array[indice], indice, array)) {
        acumulado.push(array[indice]);
    }
    return filtrarRecursivo(array, criterio, indice + 1, acumulado);
}

function reducirManual(array, reductor, valorInicial) {
    let acumulador = valorInicial;
    for (let i = 0; i < array.length; i++) {
        acumulador = reductor(acumulador, array[i], i, array);
    }
    return acumulador;
}

function* generadorEstadisticas(array) {
    for (const jugador of array) {
        const eficiencia = calcularEficiencia(jugador);
        yield {
            ...jugador,
            eficiencia,
            categoria: clasificarJugador(eficiencia)
        };
    }
}

function componerFunciones(...funciones) {
    return function(valorInicial) {
        let resultado = valorInicial;
        for (let i = funciones.length - 1; i >= 0; i--) {
            resultado = funciones[i](resultado);
        }
        return resultado;
    };
}

/**
 * FUNCIONES AUXILIARES
 */

function calcularEficiencia(jugador) {
    if (!jugador.minutos || jugador.minutos === 0) return 0;
    return (jugador.goles * 90) / jugador.minutos;
}

function clasificarJugador(eficiencia) {
    if (eficiencia > 1.0) return 'Elite';
    if (eficiencia > 0.7) return 'Alto';
    if (eficiencia > 0.4) return 'Medio';
    return 'Bajo';
}

function conMinimoGoles(minimo) {
    return function(jugador) {
        return jugador.goles >= minimo;
    };
}

function aFormatoReporte(jugador) {
    return {
        jugador: jugador.nombre,
        goles: jugador.goles,
        asistencias: jugador.asistencias,
        eficiencia: calcularEficiencia(jugador).toFixed(2),
        aporteTotal: jugador.goles + jugador.asistencias
    };
}

/**
 * FUNCIONES OPTIMIZADAS (Fase 3)
 */

function procesarConCallback(coleccion, callback, contexto = null) {
    if (!Array.isArray(coleccion)) {
        throw new Error('La coleccion debe ser un array');
    }
    if (typeof callback !== 'function') {
        throw new Error('El callback debe ser una funcion');
    }
    const resultado = new Array(coleccion.length);
    for (let i = 0; i < coleccion.length; i++) {
        resultado[i] = contexto 
            ? callback.call(contexto, coleccion[i], i, coleccion)
            : callback(coleccion[i], i, coleccion);
    }
    return resultado;
}

function filtrarIterativo(coleccion, criterio) {
    const resultado = [];
    let i = 0;
    while (i < coleccion.length) {
        if (criterio(coleccion[i], i, coleccion)) {
            resultado[resultado.length] = coleccion[i];
        }
        i++;
    }
    return resultado;
}

function analizarRendimiento(jugadores) {
    return reducirManual(jugadores, (estadisticas, jugador) => {
        const eficiencia = calcularEficiencia(jugador);
        
        estadisticas.totalGoles += jugador.goles;
        estadisticas.totalAsistencias += jugador.asistencias;
        estadisticas.jugadoresPorCategoria[clasificarJugador(eficiencia)]++;
        
        if (eficiencia > estadisticas.maxEficiencia.valor) {
            estadisticas.maxEficiencia = { jugador: jugador.nombre, valor: eficiencia };
        }
        
        return estadisticas;
    }, {
        totalGoles: 0,
        totalAsistencias: 0,
        jugadoresPorCategoria: { 'Elite': 0, 'Alto': 0, 'Medio': 0, 'Bajo': 0 },
        maxEficiencia: { jugador: '', valor: 0 }
    });
}

/**
 * FUNCIONES PARA LA INTERFAZ
 */

function mostrarResultadosEnPagina() {
    const output = document.getElementById('output');
    if (!output) return;
    
    // 1. Transformar datos
    const jugadoresTransformados = transformarArray(jugadores, aFormatoReporte);
    
    // 2. Filtrar recursivamente
    const goleadores = filtrarRecursivo(jugadores, conMinimoGoles(20));
    
    // 3. Analisis completo
    const analisis = analizarRendimiento(jugadores);
    
    // 4. Uso del generador
    let generadorHTML = '';
    const generador = generadorEstadisticas(jugadores);
    for (const jugadorConStats of generador) {
        generadorHTML += `<div>${jugadorConStats.nombre}: ${jugadorConStats.categoria} (${jugadorConStats.eficiencia.toFixed(2)})</div>`;
    }
    
    // 5. Pipeline de procesamiento
    const jugadoresFiltrados = filtrarIterativo(jugadores, j => j.tarjetas < 3);
    const resultadoPipeline = procesarConCallback(jugadoresFiltrados, aFormatoReporte);
    
    // 6. Top 3 jugadores
    const jugadoresOrdenados = [...jugadores].sort((a, b) => 
        calcularEficiencia(b) - calcularEficiencia(a)
    );
    const top3 = jugadoresOrdenados.slice(0, 3).map(j => ({
        nombre: j.nombre,
        eficiencia: calcularEficiencia(j).toFixed(2)
    }));
    
    // Construir HTML
    output.innerHTML = `
        <div class='resultado-seccion'>
            <h4>1. Jugadores Transformados:</h4>
            <pre>${JSON.stringify(jugadoresTransformados, null, 2)}</pre>
        </div>
        
        <div class='resultado-seccion'>
            <h4>2. Goleadores (20+ goles):</h4>
            <p>${goleadores.map(j => j.nombre).join(', ')}</p>
        </div>
        
        <div class='resultado-seccion'>
            <h4>3. Analisis del Equipo:</h4>
            <ul>
                <li>Total goles: ${analisis.totalGoles}</li>
                <li>Total asistencias: ${analisis.totalAsistencias}</li>
                <li>Jugador mas eficiente: ${analisis.maxEficiencia.jugador} (${analisis.maxEficiencia.valor.toFixed(2)})</li>
                <li>Distribucion por categoria: ${JSON.stringify(analisis.jugadoresPorCategoria)}</li>
            </ul>
        </div>
        
        <div class='resultado-seccion'>
            <h4>4. Categoria por Jugador (Generador):</h4>
            ${generadorHTML}
        </div>
        
        <div class='resultado-seccion'>
            <h4>5. Jugadores Disciplinados (menos de 3 tarjetas):</h4>
            <pre>${JSON.stringify(resultadoPipeline, null, 2)}</pre>
        </div>
        
        <div class='resultado-seccion'>
            <h4>6. Top 3 Mas Eficientes:</h4>
            <ul>
                ${top3.map(j => `<li>${j.nombre}: ${j.eficiencia}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // Tambien mostrar en consola
    console.log('=== RESULTADOS DEL ANALISIS ===');
    console.log('Jugadores transformados:', jugadoresTransformados);
    console.log('Goleadores:', goleadores);
    console.log('Analisis completo:', analisis);
    console.log('Top 3:', top3);
}

function ejecutarPruebas() {
    console.log('=== EJECUTANDO PRUEBAS UNITARIAS ===');
    
    const pruebas = [];
    
    // Prueba 1: Transformacion
    const transformados = transformarArray([{goles: 2}], j => j.goles * 2);
    pruebas.push({nombre: 'Transformacion', resultado: transformados[0] === 4});
    
    // Prueba 2: Filtro recursivo
    const filtrados = filtrarRecursivo([{goles: 5}, {goles: 1}], j => j.goles > 2);
    pruebas.push({nombre: 'Filtro recursivo', resultado: filtrados.length === 1});
    
    // Prueba 3: Reduccion manual
    const suma = reducirManual([1, 2, 3], (acc, val) => acc + val, 0);
    pruebas.push({nombre: 'Reduccion manual', resultado: suma === 6});
    
    // Prueba 4: Composicion
    const dobleYSuma = componerFunciones(
        x => x * 2,
        x => x + 1
    )(3);
    pruebas.push({nombre: 'Composicion', resultado: dobleYSuma === 7});
    
    // Mostrar resultados
    console.table(pruebas);
    
    // Actualizar interfaz si hay elemento para pruebas
    const pruebasElement = document.getElementById('pruebas');
    if (pruebasElement) {
        pruebasElement.innerHTML = `
            <h4>Resultado de Pruebas:</h4>
            <ul>
                ${pruebas.map(p => `
                    <li>${p.nombre}: ${p.resultado ? '✅ PASO' : '❌ FALLO'}</li>
                `).join('')}
            </ul>
        `;
    }
}

/**
 * INICIALIZACION
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de analisis deportivo cargado.');
    console.log('Haz clic en "Ejecutar Demostracion" para ver los resultados.');
    
    // Crear botones adicionales si no existen
    const controls = document.querySelector('.controls');
    if (controls && !document.getElementById('btnPruebas')) {
        const btnPruebas = document.createElement('button');
        btnPruebas.id = 'btnPruebas';
        btnPruebas.textContent = 'Ejecutar Pruebas';
        btnPruebas.onclick = ejecutarPruebas;
        controls.appendChild(btnPruebas);
        
        const btnExportar = document.createElement('button');
        btnExportar.textContent = 'Exportar Datos';
        btnExportar.onclick = function() {
            const datos = {
                jugadores: jugadores,
                analisis: analizarRendimiento(jugadores),
                fecha: new Date().toLocaleString()
            };
            const blob = new Blob([JSON.stringify(datos, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'analisis-jugadores.json';
            a.click();
            URL.revokeObjectURL(url);
        };
        controls.appendChild(btnExportar);
    }
});