/**
 * Data Loader - Gestor de Datos Dinámicos
 * Carga y genera datos de equipos de fútbol con nombres reales
 */

// Mapeo de equipos con jugadores reales
const TEAMS_DATA = {
    'Manchester United': {
        id: 66,
        apiId: 66,
        league: 'English Premier League',
        fallbackPlayers: ['Bruno Fernandes', 'Harry Maguire', 'Aaron Wan-Bissaka', 'Luke Shaw', 'David de Gea']
    },
    'Manchester City': {
        id: 67,
        apiId: 67,
        league: 'English Premier League',
        fallbackPlayers: ['Erling Haaland', 'Kevin De Bruyne', 'Rodri', 'Manuel Akanji', 'Ederson']
    },
    'Liverpool': {
        id: 64,
        apiId: 64,
        league: 'English Premier League',
        fallbackPlayers: ['Mohamed Salah', 'Virgil van Dijk', 'Alisson', 'Luis Diaz', 'Andy Robertson']
    },
    'Arsenal': {
        id: 57,
        apiId: 57,
        league: 'English Premier League',
        fallbackPlayers: ['Bukayo Saka', 'Martin Odegaard', 'Gabriel Jesus', 'William Saliba', 'Aaron Ramsdale']
    },
    'Chelsea': {
        id: 61,
        apiId: 61,
        league: 'English Premier League',
        fallbackPlayers: ['Kai Havertz', 'Mason Mount', 'Reece James', 'Thiago Silva', 'Kepa Arrizabalaga']
    },
    'Real Madrid': {
        id: 86,
        apiId: 86,
        league: 'Spanish La Liga',
        fallbackPlayers: ['Karim Benzema', 'Vinicius Jr', 'Luka Modric', 'Toni Kroos', 'Eder Militao']
    },
    'Barcelona': {
        id: 81,
        apiId: 81,
        league: 'Spanish La Liga',
        fallbackPlayers: ['Robert Lewandowski', 'Gavi', 'Pedri', 'Jules Kounde', 'Ousmane Dembele']
    },
    'Paris Saint-Germain': {
        id: 80,
        apiId: 80,
        league: 'French Ligue 1',
        fallbackPlayers: ['Kylian Mbappe', 'Neymar', 'Marco Verratti', 'Presnel Kimpembe', 'Achraf Hakimi']
    },
    'Bayern Munich': {
        id: 9,
        apiId: 9,
        league: 'German Bundesliga',
        fallbackPlayers: ['Jamal Musiala', 'Serge Gnabry', 'Leroy Sane', 'Joshua Kimmich', 'Manuel Neuer']
    },
    'Juventus': {
        id: 109,
        apiId: 109,
        league: 'Italian Serie A',
        fallbackPlayers: ['Dusan Vlahovic', 'Juan Cuadrado', 'Paulo Dybala', 'Leonardo Bonucci', 'Wojciech Szczesny']
    }
};

/**
 * Cargar datos de un equipo específico
 * Genera estadísticas dinámicas con nombres reales de jugadores
 */
async function cargarEquipoDesdeAPI(teamName) {
    const teamData = TEAMS_DATA[teamName];
    
    if (!teamData) {
        mostrarErrorEnPagina(`Equipo no disponible: ${teamName}`);
        return null;
    }

    try {
        mostrarCargando(true);
        
        // Simular delay de carga (para realismo)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generar datos con nombres reales del equipo
        const jugadoresGenerados = teamData.fallbackPlayers.map((nombre, index) => 
            generarDatosJugador(nombre, index)
        );
        
        jugadores = jugadoresGenerados;
        mostrarCargando(false);
        limpiarResultados();
        
        console.log('✅ Equipo cargado:', teamName);
        console.log('Jugadores:', jugadoresGenerados.map(j => j.nombre).join(', '));
        
        return true;
        
    } catch (error) {
        console.error('❌ Error cargando datos:', error.message);
        mostrarErrorEnPagina('Error al cargar datos del equipo');
        mostrarCargando(false);
        return false;
    }
}

/**
 * Generar datos realistas para un jugador
 * Varía estadísticas según posición estimada
 */
function generarDatosJugador(nombre, index) {
    // Distribuir posiciones: primeros 3 delanteros, siguientes 5 mediocampistas, resto defensas
    const esDelantero = index < 3;
    const esMedio = index >= 3 && index < 8;
    const esDefensa = index >= 8;
    
    // Generar goles según posición
    const goles = esDelantero ? 
        Math.floor(Math.random() * 35) + 5 :   // Delanteros: 5-40 goles
        esMedio ? 
        Math.floor(Math.random() * 15) :       // Mediocampistas: 0-15 goles
        Math.floor(Math.random() * 4);         // Defensas: 0-4 goles
    
    // Generar asistencias según posición
    const asistencias = esMedio ? 
        Math.floor(Math.random() * 20) :       // Mediocampistas: 0-20 asistencias
        esDelantero ? 
        Math.floor(Math.random() * 12) :       // Delanteros: 0-12 asistencias
        Math.floor(Math.random() * 8);         // Defensas: 0-8 asistencias
    
    return {
        id: index + 1,
        nombre: nombre,
        goles: goles,
        asistencias: asistencias,
        minutos: Math.floor(Math.random() * 1800) + 1200,  // 1200-3000 minutos
        tarjetas: Math.floor(Math.random() * 4),            // 0-4 tarjetas
        posicion: esDelantero ? 'Delantero' : esMedio ? 'Mediocampista' : 'Defensa'
    };
}

/**
 * Cargar y mostrar el selector de equipos
 */
function cargarSelectorEquipos() {
    const select = document.getElementById('teamSelect');
    select.innerHTML = '<option value="">-- Selecciona un equipo --</option>';
    
    // Agregar cada equipo al selector
    Object.keys(TEAMS_DATA).forEach(teamName => {
        const option = document.createElement('option');
        option.value = teamName;
        option.textContent = teamName;
        select.appendChild(option);
    });

    // Manejar cambios de equipo
    select.addEventListener('change', async (e) => {
        if (e.target.value) {
            await cargarEquipoDesdeAPI(e.target.value);
        }
    });
}

/**
 * Mostrar/ocultar indicador de carga
 */
function mostrarCargando(mostrar) {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.style.display = mostrar ? 'inline' : 'none';
    }
}

/**
 * Mostrar mensaje de error en la página
 */
function mostrarErrorEnPagina(mensaje) {
    const output = document.getElementById('output');
    if (output) {
        output.innerHTML = `
            <div style="color: #e74c3c; padding: 15px; border-radius: 8px; background: rgba(231, 76, 60, 0.1);">
                <strong>Error:</strong> ${mensaje}
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarSelectorEquipos);
