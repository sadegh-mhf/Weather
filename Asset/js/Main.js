const cities = 'Asset/city list/city.list.json';
const baseUrl = "api.openweathermap.org/data/2.5";
const apiKey = "bc227ee9a486c48342e4060be03829b7";

const directions = {
    1: 'N',
    2: 'NNE',
    3: 'NE',
    4: 'ENE',
    5: 'E',
    6: 'ESE',
    7: 'SE',
    8: 'SSE',
    9: 'S',
    10: 'SSW',
    11: 'SW',
    12: 'WSW',
    13: 'W',
    14: 'WNW',
    15: 'NW',
    16: 'NNW',
    17: 'N',
}
const suggestion = document.getElementsByClassName('search__suggestion')[0]

window.onload = (event) => {
    event.preventDefault();
}

function getCurrent(cityId) {
    return fetch(`https://${baseUrl}/weather?id=${cityId}&appid=${apiKey}&units=metric`)
        .then(async response => await response.json())
        .catch(error => error);
}

function getFiveDays(cityId) {
    return fetch(`https://${baseUrl}/forecast?id=${cityId}&appid=${apiKey}&units=metric`)
        .then(async response => await response.json())
        // .then(response => response)
        .catch(error => error);
}

const debounced = _.debounce(searchCities, 700)

function handleInputChange() {
    debounced()
}


async function searchCities(e) {
    const searchInput = document.getElementsByClassName('search__input')[0]
    const result = await getCities(searchInput.value)
    toggleSuggestion(searchInput.value.length)
    if (result.length) {
        loadSuggestions(result);
        recentSearch(result);
    } else {
        const emptyElement = `<div class = "empty__message"><span>${searchInput.value} is not founded ... </span><span>Please search another city</span>`
        suggestion.innerHTML = emptyElement
    }
}

function getCities(city) {
    return fetch(cities)
        .then(response => response.json())
        .then(data => {
            return data.filter((item) => item.name.toLowerCase().includes(city.toLowerCase()))
        })
        .catch(error => error);
}

function handleInputBlur() {
    setTimeout(() => toggleSuggestion(false), 100)
}

function handleInputFocus() {
    const recentCities = JSON.parse(localStorage.getItem('recent_search'));
    if (recentCities && recentCities.length) {
        loadSuggestions(recentCities);
        toggleSuggestion(true)
    }
}

async function selectCity(city) {
    const searchInput = document.getElementsByClassName('search__input')[0]
    searchInput.value = city.name;
    const currentWeather = await getCurrent(city.id)
    const fiveDayWeather = await getFiveDays(city.id)
    updateWeatherInfo(currentWeather)
    updateFiveDayInfo(fiveDayWeather)
}

function loadSuggestions(cities) {

    const items = document.getElementsByClassName('search__items')[0];
    items && items.remove();
    const ul = document.createElement('ul');
    ul.classList.add('search__items');
    cities.forEach(city => {
        const element = document.createElement('li');
        element.classList.add('search__item');
        element.onclick = () => selectCity(city);
        element.innerText = city.name;
        ul.appendChild(element);
    })
    suggestion.appendChild(ul)

}

function toggleSuggestion(isShow) {
    isShow ?
        suggestion.classList.add('search__suggestion--active') :
        suggestion.classList.remove('search__suggestion--active');
    !isShow && (() => {
        suggestion.innerHTML = '';
    })();
}

function recentSearch(cities) {
    let data = cities.slice(0, 4);
    data = JSON.stringify(data)
    localStorage.setItem('recent_search', data)
}


function updateWeatherInfo(weatherResp) {
    const cityName = document.querySelector('.city-temperature__title');
    const dayTime = document.querySelector('.city-temperature__current-day');
    const temperature = document.querySelector('.totalInfo__current-temp');
    const weatherIcon = document.querySelector('.weather-shape__icon');
    const weatherDesc = document.querySelector('.weather-shape__description');
    const humidity = document.querySelector('.humidity');
    const wind = document.querySelector('.wind');
    const pressure = document.querySelector('.pressure');
    weatherIcon.src = 'http://openweathermap.org/img/wn/10d@2x.png'

    cityName.innerHTML = `${weatherResp.name}, ${weatherResp.sys.country}`;
    temperature.innerHTML = `${Math.round(weatherResp.main.temp)} °C`;
    weatherDesc.innerHTML = `${weatherResp.weather[0].description}`;
    weatherIcon.src = `http://openweathermap.org/img/wn/${weatherResp.weather[0].icon}@4x.png`
    dayTime.innerHTML = moment(weatherResp.dt, 'X').format('dddd');
    humidity.innerHTML = `${weatherResp.main.humidity} %`;
    pressure.innerHTML = `${weatherResp.main.pressure} hPa`;
    const deg = Math.round(weatherResp.wind.deg / 22.5) + 1
    wind.innerHTML = `${directions[deg]}, ${weatherResp.wind.speed} m/s`;
}

function updateFiveDayInfo(response) {
    const daysArray = response.list
    const FutureDays = daysArray.filter((item, index) => (index % 8) === 0)
    for (let i = 1; i < FutureDays.length; i++) {
        const cardIcon = document.getElementById(`day${i}-icon`)
        const cardDate = document.getElementById(`day${i}-date`)
        const cardTemp = document.getElementById(`day${i}-temp`)
        cardIcon.src = `http://openweathermap.org/img/wn/${FutureDays[i].weather[0].icon}@4x.png`;
        cardDate.innerHTML = moment(`${FutureDays[i].dt}`, 'X').format('dddd');
        cardTemp.innerHTML = `${Math.round(FutureDays[i].main.temp)} °C`;
    }
}