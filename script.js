document.addEventListener("DOMContentLoaded", function () {
    const dateElement = document.getElementById('date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.innerText = new Date().toLocaleDateString('es-ES', options);

    const weatherTranslations = {
        "Sunny": "Soleado",
        "Partly cloudy": "Nublado",
        "Cloudy": "Nublado",
        "Overcast": "Cubierto",
        "Rain": "Lluvia",
        "Light rain": "Lluvia ligera",
        "Heavy rain": "Lluvia fuerte",
        "Thunderstorm": "Tormenta eléctrica",
        "Snow": "Nieve",
        "Mist": "Niebla",
        "Clear": "Despejado"
    };

    const weatherIcons = {
        "Soleado": "https://cdn.lordicon.com/ktsahwvc.json",
        "Nublado": "https://cdn.lordicon.com/ggehlmqa.json",
        "Cubierto": "https://cdn.lordicon.com/ggehlmqa.json",
        "Lluvia": "https://cdn.lordicon.com/cznlxcyj.json",
        "Lluvia ligera": "https://cdn.lordicon.com/cznlxcyj.json",
        "Lluvia fuerte": "https://cdn.lordicon.com/cznlxcyj.json",
        "Tormenta eléctrica": "https://cdn.lordicon.com/vyqvtrtg.json",
        "Nieve": "https://cdn.lordicon.com/zyrpryrd.json",
        "Niebla": "https://cdn.lordicon.com/mwplmlwn.json",
        "Despejado": "https://cdn.lordicon.com/ktsahwvc.json"
    };

    let forecastData = [];
    const greetingTextElement = document.querySelector('.header-text h1');
    let greetingMessage = getGreeting() + " 🤗";
    typeWriterEffect(greetingTextElement, greetingMessage);

    function getGreeting() {
        const currentHour = new Date().getHours();
        if (currentHour < 12) {
            return "Buenos días";
        } else if (currentHour < 18) {
            return "Buenas tardes";
        } else {
            return "Buenas noches";
        }
    }

    function typeWriterEffect(element, text, delay = 100) {
        let index = 0;
        function write() {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                index++;
                setTimeout(write, delay);
            }
        }
        element.innerHTML = ''; // Clear previous text
        write();
    }

    fetch('https://wttr.in/Mendoza?format=j1')
        .then(response => response.json())
        .then(data => {
            const currentCondition = data.current_condition[0];
            const temperature = currentCondition.temp_C + "°C";
            let weatherDesc = currentCondition.weatherDesc[0].value;
            weatherDesc = weatherTranslations[weatherDesc] || weatherDesc;
            const windSpeed = currentCondition.windspeedKmph + " km/h";
            const humidity = currentCondition.humidity + "%";

            document.querySelector('.temperature span').innerText = temperature;
            document.querySelector('.temperature p').innerText = weatherDesc;
            document.querySelector('.detail-item:nth-child(1) span:nth-child(2)').innerText = windSpeed;
            document.querySelector('.detail-item:nth-child(2) span:nth-child(2)').innerText = humidity;

            const forecastDays = data.weather;
            const forecastElements = document.querySelectorAll('.forecast-item');
            const today = new Date();
            const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

            forecastDays.slice(0, 3).forEach((day, index) => {
                const forecastDate = new Date(today);
                forecastDate.setDate(today.getDate() + index + 1);
                const dayName = dayNames[forecastDate.getDay()];
                const avgTemp = `${day.avgtempC}°C`;
                const weatherCondition = day.hourly[4].weatherDesc[0].value;
                const translatedCondition = weatherTranslations[weatherCondition] || weatherCondition;
                const weatherIconSrc = weatherIcons[translatedCondition] || "https://cdn.lordicon.com/ggehlmqa.json";

                const forecastContainer = forecastElements[index];
                forecastContainer.querySelector('lord-icon').setAttribute('src', weatherIconSrc);
                forecastContainer.querySelector('div span:nth-child(1)').innerText = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                forecastContainer.querySelector('div span:nth-child(2)').innerText = `Temp ➟ ${avgTemp}`;

                forecastData.push({
                    day: dayName,
                    avgTemp: avgTemp,
                    humidity: day.hourly[4].humidity + "%"
                });
            });

            aiButton.addEventListener('click', () => {
                mainContainer.style.transform = 'translateY(-50px)';
                aiCircle.classList.add('active');
                overlay.classList.add('active');
                speakWeatherData(temperature, weatherDesc, windSpeed, humidity);
            });

            triggerParticleEffect(weatherDesc); // Trigger particle effect based on weather
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });

    const aiButton = document.getElementById('aiButton');
    const mainContainer = document.getElementById('mainContainer');
    const aiCircle = document.getElementById('aiCircle');
    const overlay = document.getElementById('overlay');
    let currentUtterance = null;

    aiButton.addEventListener('click', () => {
        aiButton.classList.add('pulse'); // Add pulse animation
        setTimeout(() => aiButton.classList.remove('pulse'), 1000); // Remove after 1s
    });

    function adjustVoiceForWeather(utterance, weatherDesc) {
        if (weatherDesc.includes("Soleado")) {
            utterance.pitch = 1.5;
            utterance.rate = 1.1;
        } else if (weatherDesc.includes("Lluvia") || weatherDesc.includes("Tormenta")) {
            utterance.pitch = 0.9;
            utterance.rate = 0.9;
        } else {
            utterance.pitch = 1.0;
            utterance.rate = 1.0;
        }
    }

    function getHumorPhraseForWeather(weatherDesc) {
        const phrases = {
            "Soleado": "¡Hace un sol radiante! No olvides tus gafas de sol, a menos que quieras brillar más que el sol mismo.",
            "Parcialmente Nublado": "Parece que las nubes están indecisas. ¿Sol o sombra? ¡Tú decides!",
            "Nublado": "Un día nublado es perfecto para reflexionar o para una buena siesta.",
            "Cubierto": "El cielo está tan cubierto que parece que alguien puso una gran manta sobre él.",
            "Lluvia": "¡Lluvia, lluvia, no me mojes! O mejor, saca tu paraguas y disfruta del frescor.",
            "Lluvia ligera": "Una llovizna para mantenerte fresco. O para dejarte empapado lentamente, tú decides.",
            "Lluvia fuerte": "¡Prepárate para mojarte! No olvides tu impermeable.",
            "Tormenta eléctrica": "Con esta tormenta, los rayos quieren hacer un espectáculo de luces gratis.",
            "Nieve": "Nieve... ¿quizá una buena excusa para una pelea de bolas de nieve?",
            "Niebla": "Con esta niebla, parece que estamos en una película de misterio."
        };
        return phrases[weatherDesc] || "El clima siempre tiene una sorpresa bajo la manga, ¡disfruta el día!";
    }

    function playSoundEffect(weatherDesc) {
        let audio = new Audio();
        if (weatherDesc.includes("Lluvia")) {
            audio.src = 'https://freesound.org/data/previews/415/415209_5121236-lq.mp3';
        } else if (weatherDesc.includes("Tormenta")) {
            audio.src = 'https://freesound.org/data/previews/457/457131_5121236-lq.mp3';
        } else if (weatherDesc.includes("Soleado")) {
            audio.src = 'https://freesound.org/data/previews/348/348490_5121236-lq.mp3';
        }
        audio.play();
    }

    function speakWeatherData(temperature, weatherDesc, windSpeed, humidity) {
        const greeting = getGreeting();
        let message = `${greeting}. La temperatura actual es de ${temperature}, el clima está ${weatherDesc}. El viento sopla a ${windSpeed}, y la humedad es del ${humidity}. `;

        if (forecastData.length > 0) {
            message += "El pronóstico para los próximos tres días es: ";
            forecastData.forEach(forecast => {
                message += `El ${forecast.day} tendrá una temperatura promedio de ${forecast.avgTemp} con una humedad del ${forecast.humidity}. `;
            });
        }

        message += " " + getHumorPhraseForWeather(weatherDesc);

        currentUtterance = new SpeechSynthesisUtterance(message);
        currentUtterance.lang = 'es-ES';

        adjustVoiceForWeather(currentUtterance, weatherDesc);

        playSoundEffect(weatherDesc);

        currentUtterance.onend = function () {
            mainContainer.style.transform = 'translateY(0)';
            aiCircle.classList.remove('active');
            overlay.classList.remove('active');
        };

        window.speechSynthesis.speak(currentUtterance);
    }

    overlay.addEventListener('click', () => {
        if (currentUtterance && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        mainContainer.style.transform = 'translateY(0)';
        aiCircle.classList.remove('active');
        overlay.classList.remove('active');
    });

    function triggerParticleEffect(weatherDesc) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: {
                    type: weatherDesc.includes("Lluvia") ? "circle" : "star",
                    stroke: { width: 0, color: "#000000" },
                    polygon: { nb_sides: 5 }
                },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: { enable: false },
                move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    grab: { distance: 400, line_linked: { opacity: 1 } },
                    bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
                    repulse: { distance: 100, duration: 0.4 },
                    push: { particles_nb: 4 },
                    remove: { particles_nb: 2 }
                }
            },
            retina_detect: true
        });
    }
});
