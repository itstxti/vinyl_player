const clientId = 'f3ec1489467f4c9a9b6abf85838edc37';
const clientSecret = '7d07842759b74b8abf093e3c016b125d';

const vinylBox = document.getElementById('vinylBox');
const vinyl = document.getElementById('vinyl');
const audioPlayer = document.getElementById('audioPlayer');
const vinylLabel = document.getElementById('vinylLabel');
const playlistUrlInput = document.getElementById('playlistUrl');
const loadPlaylistButton = document.getElementById('loadPlaylistButton');
const loadPlaylistIcon = loadPlaylistButton.querySelector('i');

let emptyPlayer = true;
let currentSongIndex = 0;
let songs = [];
let token = '';




async function getAccessToken() {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    });

    const data = await response.json();
    token = data.access_token;
}

async function fetchSongsFromPlaylist(playlistUrl) {
    const playlistId = playlistUrl.split('/').slice(-1)[0].split('?')[0];
    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        songs = data.items.map(item => {
            const song = item.track;
            return {
                title: song.name,
                artist: song.artists[0].name, // Añadimos el nombre del primer artista
                audioSrc: song.preview_url,
                coverSrc: song.album.images[0].url,
                vinylCenterColor: '#d81b1b',
                vinylLabel: song.album.name,
                background: '#f9b7b7'
            };
        }).filter(song => song.audioSrc);

        if (songs.length > 0) {
            updateVinylInfo();
            emptyPlayer = false;
            playSong(0);
        } else {
            console.error('No hay canciones disponibles con vista previa en esta playlist.');
        }
    } catch (error) {
        console.error('Error al obtener canciones de la playlist:', error);
    }
}

function updateVinylInfo() {
    const currentSong = songs[currentSongIndex];
    vinylBox.style.backgroundImage = `url(${currentSong.coverSrc})`;
    vinylLabel.textContent = currentSong.vinylLabel;
    //vinylLabel.style.setProperty('--vinyl-center-color', currentSong.vinylCenterColor);
    //vinyl.style.backgroundColor = currentSong.background;
    changeBackgroundColor(currentSong.coverSrc);
    // Actualizar el título de la canción actual
    document.getElementById('currentSongTitle').textContent = `Playing: ${currentSong.title} by ${currentSong.artist}`;

}

let isButtonDisabled = false; // Variable para controlar si el botón está deshabilitado
let previousPlaylistUrl = ''; // Variable para almacenar el URL anterior

loadPlaylistButton.addEventListener('click', async (event) => {
if (isButtonDisabled) return; // Si el botón está deshabilitado, no hacer nada

// Obtener el URL y eliminar espacios en blanco
const playlistUrl = playlistUrlInput.value.trim();

// Cambiar la visibilidad del input
if (!playlistUrlInput.classList.contains('visible')) {
playlistUrlInput.classList.add('visible');
loadPlaylistIcon.classList.replace('fa-arrow-circle-down', 'fa-arrow-circle-up');
} else {
playlistUrlInput.classList.remove('visible');
loadPlaylistIcon.classList.replace('fa-arrow-circle-up', 'fa-arrow-circle-down');

// Verificar si el URL ha cambiado
if (playlistUrl && playlistUrl !== previousPlaylistUrl) {
    previousPlaylistUrl = playlistUrl; // Actualizar el URL anterior
    isButtonDisabled = true; // Deshabilitar el botón temporalmente

    await getAccessToken();
    await fetchSongsFromPlaylist(playlistUrl);

    // Temporizador para habilitar el botón nuevamente después de 1.5 segundos (1500 ms)
    setTimeout(() => {
        isButtonDisabled = false; // Rehabilitar el botón
    }, 1600);
} else if (playlistUrl === previousPlaylistUrl) {
    console.log("No se ha cambiado el URL de la lista de reproducción.");
}

// Ocultar el input al final
playlistUrlInput.classList.remove('visible');
loadPlaylistIcon.classList.replace('fa-arrow-circle-up', 'fa-arrow-circle-down');
}
});



playlistUrlInput.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        const playlistUrl = playlistUrlInput.value;
        if (playlistUrl) {
            await getAccessToken();
            await fetchSongsFromPlaylist(playlistUrl);

            playlistUrlInput.classList.remove('visible');
            loadPlaylistIcon.classList.replace('fa-arrow-circle-up', 'fa-arrow-circle-down');
        }
    }
});

function animateVinylAndSleeve(callback) {
    vinyl.classList.remove('active');
    vinylBox.classList.remove('active');
    setTimeout(() => {
        callback(); // Llama al callback después de la animación
    }, 1500); // Duración de la animación
}

function playSong(index) {
    if (index < 0 || index >= songs.length) return;

    // Actualizar la información del vinilo
    animateVinylAndSleeve(() => {
        updateVinylInfo(); // Actualiza la información después de la animación
        vinyl.classList.add('active');
        vinylBox.classList.add('active');

        playIcon.classList.add('fa-pause');
        playIcon.classList.remove('fa-play');
        // Reproduce la canción
        audioPlayer.src = songs[index].audioSrc;
        audioPlayer.play();
    });
}



document.getElementById('pauseButton').addEventListener('click', () => {
    const playIcon = document.getElementById('playIcon');
    if (emptyPlayer) return;

    if (audioPlayer.paused) {
        audioPlayer.play();
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
        vinyl.classList.add('active');
        vinylBox.classList.add('active');


    } else {
        audioPlayer.pause();
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
        vinyl.classList.remove('active');
        vinylBox.classList.remove('active');


    }
});

document.getElementById('prevSongButton').addEventListener('click', () => {
    if (currentSongIndex > 0) {
        currentSongIndex--;
        playSong(currentSongIndex);
    }
});

document.getElementById('nextSongButton').addEventListener('click', () => {
    if (currentSongIndex < songs.length - 1) {
        currentSongIndex++;
        playSong(currentSongIndex);
    }
});

audioPlayer.addEventListener('ended', () => {
    if (currentSongIndex < songs.length - 1) {
        currentSongIndex++;
        playSong(currentSongIndex);
    }
});

function changeVolume(value) {
    // Aquí se podría integrar el código para ajustar el volumen del audio
    document.getElementById("volumeDisplay").textContent = value + "%";
}

function changeBackgroundColor(imageUrl) {
    console.log("Cambiando color de fondo con la imagen:", imageUrl);
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Permitir acceso a datos cross-origin
    img.src = imageUrl;

    img.onload = function () {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);

        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const length = data.length;
        let r = 0, g = 0, b = 0;

        for (let i = 0; i < length; i += 4) {
            r += data[i];     // Red
            g += data[i + 1]; // Green
            b += data[i + 2]; // Blue
        }

        // Calcular el promedio de los colores
        r = Math.floor(r / (length / 4));
        g = Math.floor(g / (length / 4));
        b = Math.floor(b / (length / 4));

        // Convertir a tonos pastel
        const pastelFactor = 0.5; // Ajusta este valor para cambiar la claridad de los tonos pastel
        r = Math.floor((r + 255) * pastelFactor);
        g = Math.floor((g + 255) * pastelFactor);
        b = Math.floor((b + 255) * pastelFactor);

        document.body.style.background = `rgb(${r}, ${g}, ${b})`;
        console.log(`Color de fondo establecido a: rgb(${r}, ${g}, ${b})`);
    };

    img.onerror = function () {
        console.error("Error al cargar la imagen: " + imageUrl);
    };
}

function toggleSettings() {
    const settingsPanel = document.getElementById("settings-panel");
    settingsPanel.style.display = settingsPanel.style.display === "none" || settingsPanel.style.display === "" ? "block" : "none";
}

function closeSettings() {
    document.getElementById("settings-panel").style.display = "none";
}



function saveSettings() {
    changeFont();
    changeVolume();
    closeSettings();
}

function changeFont() {
    const selectedFont = document.getElementById("fontSelect").value;
    document.body.style.fontFamily = selectedFont; // Cambiar la fuente del cuerpo
    document.getElementById("fontSelect").style.fontFamily = selectedFont; // Cambiar la fuente del select
    document.getElementById("saveSettingsButton").style.fontFamily = selectedFont; // Cambiar la fuente del botón
    document.getElementById("playlistUrl").style.fontFamily = selectedFont; // Cambiar la fuente del input

    // Guardar la fuente seleccionada en almacenamiento local
    localStorage.setItem("selectedFont", selectedFont);
}

// Referencia al elemento de audio
const audioElement = document.getElementById("audioPlayer");

function changeVolume(value) {
    const volume = parseFloat(value) / 100; // Convertir de 0-100 a 0-1
    if (!isNaN(volume) && volume >= 0 && volume <= 1) {  // Verifica que el volumen sea válido
        audioElement.volume = volume;
        console.log("Volumen cambiado a: " + (volume * 100) + "%");
        localStorage.setItem("volume", volume);
    } else {
        console.warn("El valor de volumen es inválido:", value);
    }
}

// Al cargar la página, recuperar y aplicar el volumen guardado
window.onload = function () {
    const savedVolume = parseFloat(localStorage.getItem("volume"));
    if (!isNaN(savedVolume) && savedVolume >= 0 && savedVolume <= 1) {  // Verifica que savedVolume sea válido
        audioElement.volume = savedVolume;
        document.getElementById("volumeControl").value = savedVolume * 100; // Convierte de 0-1 a 0-100 para el control de rango
    }
    const savedFont = localStorage.getItem("selectedFont");
    if (savedFont) {
        // Aplicar la fuente guardada al body
        document.body.style.fontFamily = savedFont;
        document.getElementById("fontSelect").style.fontFamily = savedFont; // Cambiar la fuente del select
        document.getElementById("saveSettingsButton").style.fontFamily = savedFont; // Cambiar la fuente del botón
        document.getElementById("fontSelect").value = savedFont;
        document.getElementById("playlistUrl").style.fontFamily = savedFont; // Cambiar la fuente del input

    }
}