
//! Custom Icon
const myIcon = L.icon({
      iconUrl: '',
      iconSize: [],
      iconAnchor: [],
      popupAnchor: [],
      shadowUrl: '',
      shadowSize: [],
      shadowAnchor: []
})



//? Form Stuff
        const form = document.querySelector(".form");
        const inputType = form.querySelector(".form__input--type");
        const inputDistance = form.querySelector(".form__input--distance");
        const inputDuration = form.querySelector(".form__input--duration");
        const inputCadence = form.querySelector(".form__input--cadence");
      
        const workoutContainer = document.querySelector(".workouts");


//! App Class
console.log(form);
class App{
     #map;
     #mapEvent;
     #mapZoom = 15;
     #workouts = [];
    constructor(){
        //! Getting The Position And Loading the Map
        this._getPosition();
        //! Adding EventListeners   
        form.addEventListener('submit', this._newWorkout.bind(this));
        //! Change Toggle Elevation
        inputType.addEventListener('change', this._toggleElevationInput.bind(this));

   }

    _getPosition(){
        if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(
        //? At Success
        this._loadMap.bind(this),
        //? At Failure
        this._errorLoading
        )
    }
    _loadMap(position){
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        const coords = [latitude, longitude];

        this.#map = L.map('map').setView(coords, this.#mapZoom);
           L
            .tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
            .addTo(this.#map);

             //? Adding The Event click To The Map
        this.#map.on("click",this._showForm.bind(this));
        this.#workouts.forEach(workout => {
            this._renderWorkoutMarker(workout);
        });
    }
    _errorLoading(){
        alert("Could'nt Load The Map !");
    }
    _showForm(mapEvent){
            this.#mapEvent = mapEvent;
            form.classList.remove("hidden");
            inputDistance.focus();
    }
    _toggleElevationInput(){
        inputCadence.closest('.form__row').classList.toggle("form__row--hidden");
        inputElevation.closest('.form__row').classList.toggle("form__row--hidden");
    }
    _hideForm(){
        // Empty inputs
     inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value ='';
     form.style.display = 'none';
     form.classList.add('hidden');
     setTimeout(() => (form.style.display = 'grid'), 1000);
 }
    _newWorkout(e){
        e.preventDefault();
        console.log("Submit the form")
        //? Validators
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const positives = (...inputs) => inputs.every(inp => inp > 0);
        
        //? Get data from form
        const type = inputType.value;

        let workout;
        const distance = 1 * inputDistance.value;
        const duration = 1 * inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng;
        const coordinate = [lat, lng];
        
        
        
        //? If workout running, create running object
        if(type === 'running'){
            const cadence = 1 * inputCadence.value;
            //? Check if data is valid
            if(!validInputs(distance,duration,cadence) || !positives(distance,duration,cadence)) return alert("Invalid Inputs..");
            //? Add new object to workout array
             workout = new Running(distance,duration,coordinate,cadence);
        }
        
        //? If workout cycling, create cycling object
        if(type === 'cycling'){
            const elevation = 1 * inputElevation.value;
            //? Check if data is valid
            if(!validInputs(distance,duration,elevation) || !positives(distance,duration)) return alert("Invalid Inputs..");
            //? Add new object to workout array
             workout = new Cycling(distance,duration,coordinate,elevation);
        }

        //? Add new Workout to Workouts
        this.#workouts.push(workout);
        
        //? Render workout on map as marker
        this._renderWorkoutMarker(workout);

        //? Render workout on list
        this._renderWorkoutList(workout);
        
        //! Hide form and clear inputs
        this._hideForm();
      
    }

    _renderWorkoutMarker(workout){
        const capitalize = (string) => {
            return string.charAt(0).toUpperCase() + string.slice(1);
      }

        L.marker(workout.coords).addTo(this.#map)
         .bindPopup( 
             L.popup({
            maxWidth: 200,
            maxHeight: 60,
            minWidth: 100,
            autoClose: false,
            autoPan: true,
            closeOnClick: false,
            closeOnEscaoeKey: false,
            closeButton: false,
            className: `${workout.type}-popup`
        }))
         .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️ ' : '🚴‍♀️ '}${capitalize(workout.type)} on ${workout.date.toString().slice(4,10)}`)
         .openPopup()
        
    }

    _renderWorkoutList(workout){
        const capitalize = (string) => {
            return string.charAt(0).toUpperCase() + string.slice(1);
      }

         let element = `
         <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>

          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.type === 'running' ? workout.pace.toFixed(1) : workout.speed.toFixed(1) }</span>
            <span class="workout__unit">${workout.type === 'running' ? 'mkm' : 'km/h'}</span>
          </div>
          
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🦶🏼': '⛰' }</span>
            <span class="workout__value">${workout.type === 'running' ? workout.cadence.toFixed(1) : workout.elevationGain.toFixed(1)}</span>
            <span class="workout__unit">${workout.type === 'running' ? 'spm' : 'm'}</span>
          </div>
        </li>
         `;
         workoutContainer.innerHTML += element;
    }
   
}


class Workout{
    date = new Date()
    id = (Date.now() + '').slice(-10);

    constructor(distance, duration, coords){
        this.distance = distance;  //? In Km
        this.duration = duration;  //? In Min
        this.coords = coords;      //? [lat , lon]
    }
    get description(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }


}
class Running extends Workout{

    constructor(distance, duration, coords, cadence){
        super(distance, duration, coords);
        this.cadence = cadence;
        this.type = "running";
    }

    get pace(){
        return (this.duration / this.distance); //? min/Km
    }

}
class Cycling extends Workout{

    constructor(distance, duration, coords, elevationGain){
        super(distance, duration, coords);
        this.elevationGain = elevationGain;
        this.type = "cycling";
    }
   
    get speed(){
        return (this.distance / (this.duration / 60)); //? Km/h
    }
}

//! Start The App
const app = new App();

const inputElevation = form.querySelector(".form__input--elevation");

