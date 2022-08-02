
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
    const workoutContainer = document.querySelector(".workouts");
    const reloadBtn = document.querySelector(".reload");
    const errorPopup = document.querySelector(".error");
        
        
    const form           =   document.querySelector(".form");
    const inputType      =   form.querySelector(".form__input--type");
    const inputDistance  =   form.querySelector(".form__input--distance");
    const inputDuration  =   form.querySelector(".form__input--duration");
    const inputCadence   =   form.querySelector(".form__input--cadence");
    const inputElevation =   form.querySelector(".form__input--elevation");



//! App Class
class App{
     #map;
     #mapEvent;
     #mapZoom = 15;

     #workouts = [];
     #workout;
     #deletedElem;
     #deletedID;

     

    constructor(){
        //! Getting Local Storage (if exist)
        this._getLocalStorage();
        //! Getting The Position And Loading the Map
        this._getPosition();

        //! Adding EventListeners   
        form.addEventListener('submit', this._newWorkout.bind(this));
        //! Change Toggle Elevation
        inputType.addEventListener('change', this._toggleElevationInput.bind(this));
        //! Move When Clicking On List Element
        workoutContainer.addEventListener("click", this._movePopup.bind(this));
        //! Delete From List
        workoutContainer.addEventListener("click", this._deleteWorkoutList.bind(this));
        //! Reload Button
        reloadBtn.addEventListener("click",this._reset);



      

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
            .tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',{
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
            .addTo(this.#map);


        //? Adding The Event click To The Map
        this.#map.on("click",this._showForm.bind(this));

         //! Load Saved Data At Local Storage (if exist)
         this._loadSavedData();

    }
    _loadSavedData(){
        if(this.#workouts)
        this.#workouts.forEach(workout => {
            this._renderWorkoutMarker(workout);
            this._renderWorkoutList(workout);
        });
    }
    _errorLoading(){
        alert("Couldn't Load The Map.");
    }
    _showForm(mpevent){
            this.#mapEvent = mpevent;
            form.classList.remove("form--hidden");
            
            inputDistance.focus();
    }
    _toggleElevationInput(){
        inputCadence.closest('.form__row').classList.toggle("form__row--hidden");
        inputElevation.closest('.form__row').classList.toggle("form__row--hidden");
    }
    _hideForm(){
        // Empty inputs
     inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value ='';

     if(!form.classList.contains("form--hidden"))
        form.classList.add('form--hidden');

    //  setTimeout(() => (this.#form.style.display = 'grid'), 1000);
 }
    _newWorkout(e){
        e.preventDefault()

        //? Validators
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const positives = (...inputs) => inputs.every(inp => inp > 0);
        
        //? Get data from form
        const type = inputType.value;

        
        const distance = 1 * inputDistance.value;
        const duration = 1 * inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng;
        const coordinate = [lat, lng];
        
        
        
        //? If workout running, create running object
        if(type === 'running'){
            const cadence = 1 * inputCadence.value;
            //? Check if data is valid
            if(!validInputs(distance,duration,cadence) || !positives(distance,duration,cadence)){
              this._createErrorPopup("Invalid Inputs","Valid Input are Whole Positive Numbers.");
              return;
            } 
            //? Add new object to workout array
             this.#workout = new Running(distance,duration,coordinate,cadence);
        }
        
        //? If workout cycling, create cycling object
        if(type === 'cycling'){
            const elevation = 1 * inputElevation.value;
            //? Check if data is valid
            if(!validInputs(distance,duration,elevation) || !positives(distance,duration)) {
                this._createErrorPopup("Invalid Inputs", "Valid Input are Whole Positive Numbers.");
               return;
            }
            //? Add new object to workout array
             this.#workout = new Cycling(distance,duration,coordinate,elevation);
        }

        //? Add new Workout to Workouts
        this.#workouts.push(this.#workout);
        
        //? Render workout on map as marker
        this._renderWorkoutMarker(this.#workout);

        //? Render workout on list
        this._renderWorkoutList(this.#workout);
        
        //! Hide form and clear inputs
        this._hideForm();

        //! Setting The Local Storage
        this._setLocalStorage();
      
    }

    _renderWorkoutMarker(workout){
        L.marker(workout.coords).addTo(this.#map)
         .bindPopup( 
             L.popup({
            maxWidth: 250,
            maxHeight: 60,
            minWidth: 100,
            autoClose: false,
            autoPan: true,
            closeOnClick: false,
            closeOnEscaoeKey: false,
            closeButton: false,
            className: `${workout.type}-popup`
        }))
         .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️ ' : '🚴‍♀️ '}${workout.description}`)
         .openPopup()
    }

    _renderWorkoutList(workout){
         let element = `
         <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <button class="delete">
            <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path d="M135.2 17.69C140.6 6.848 151.7 0 163.8 0H284.2C296.3 0 307.4 6.848 312.8 17.69L320 32H416C433.7 32 448 46.33 448 64C448 81.67 433.7 96 416 96H32C14.33 96 0 81.67 0 64C0 46.33 14.33 32 32 32H128L135.2 17.69zM394.8 466.1C393.2 492.3 372.3 512 346.9 512H101.1C75.75 512 54.77 492.3 53.19 466.1L31.1 128H416L394.8 466.1z"/>
            </svg>
          </button>
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

         form.insertAdjacentHTML('afterend', element);
    }
    _renderErrorPopup(title,desc) {
        let errorPopup = `
        <div class="error show">
         <ul class="flex space-x-3 w-full items-center justify-start">
            <li>
            <svg class="w-7 h-auto fill-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M459.1 52.39L504.8 69.22C509 70.78 512 75.12 512 79.67C512 84.15 508.1
            88.38 504.8 89.83L459.1 106.7L442.6 152.5C441.1 156.9 436.7 160 432.1 160C427.5
            160 423.2 156.9 421.7 152.5L404.9 106.7L359.2 89.83C355 88.38 352 84.15 352 
            79.67C351.1 75.12 354.1 70.78 359.2 69.22L405.2 52.39L421.7 6.548C423.6 2.623
            427.8 0 432.1 0C436.5 0 440.7 2.623 442.6 6.548L459.1 52.39zM406.6 185.4C419.1
            197.9 419.1 218.1 406.6 230.6L403.8 233.5C411.7 255.5 416 279.3 416 303.1C416 
            418.9 322.9 512 208 512C93.12 512 0 418.9 0 303.1C0 189.1 93.12 95.1 208 
            95.1C232.7 95.1 256.5 100.3 278.5 108.2L281.4 105.4C293.9 92.88 314.1 92.88
            326.6 105.4L406.6 185.4zM207.1 192C216.8 192 223.1 184.8 223.1 176C223.1 
            167.2 216.8 160 207.1 160H199.1C124.9 160 63.1 220.9 63.1 296V304C63.1 312.8 
            71.16 320 79.1 320C88.84 320 95.1 312.8 95.1 304V296C95.1 238.6 142.6 192 199.1 
            192H207.1z"/></svg>
            </li>
            <li class="basis-9/12 flex flex-col">
            <span class="font-black text-sm text-red-500">${title}</span>
            <span class="font-light text-xs text-slate-300">${desc}</span>
            </li>
            <li id="close-error" class="basis-3/12 text-right pr-2 text-md cursor-pointer transition-colors text-slate-200 hover:text-slate-400">
                close
            </li>
         </ul>
        </div>
        `;
        document.querySelector(".body").insertAdjacentHTML("afterbegin",errorPopup);
    }
    _createErrorPopup(title,desc){
        this._renderErrorPopup(title,desc);
        const closeBtn = document.getElementById("close-error");
        closeBtn.onclick = () => {
            const popupError = document.querySelector(".error");
            popupError.classList.remove("show");
        }
    }
    _deleteWorkoutList(e){
        const workoutEl = e.target.closest(".workout");
        if(!workoutEl) return;
        if(this.#deletedElem){
            const oldDeletebtn = this.#deletedElem.querySelector(".delete");
            oldDeletebtn.classList.remove("show");
        }

        this.#deletedElem = workoutEl;
        const newDeletebtn = workoutEl.querySelector(".delete");
        newDeletebtn.classList.toggle("show");

        //! Event Listener On Click On Delete Button
        newDeletebtn.onclick = () => {
            
            this.#deletedID = this.#deletedElem.getAttribute("data-id");

            //! Delete Element From workouts List 
            this.#deletedElem.remove();
            //! Delete Element Markup From workouts Map
            let workouts = this.#workouts.filter((workout)=>{ return workout.id !== this.#deletedID})
            this.#workouts = workouts;

            //! Delete Element From LocalStorage
            this._setLocalStorage();

            //! Reload Page
            location.reload()
        }
        
    }
    _movePopup(e) {
        const workoutEl = e.target.closest(".workout");
        if(!workoutEl) return;
        

        const workout = this.#workouts.find(worKout => worKout.id === workoutEl.dataset.id);
        if(workout)
        {
            this.#map.setView(workout.coords, this.#mapZoom, {
                animate : true,
                pan : {
                    duration : 1,
                },
            });
            if(workout.click)
            workout.click();
        }
    }
    _setLocalStorage(){
        localStorage.setItem("workouts",JSON.stringify(this.#workouts));
    }
    _getLocalStorage(){
        let data = localStorage.getItem("workouts");
        let workouts = JSON.parse(data);
        if(workouts)
        this.#workouts = workouts;
    }
    _reset(){
        localStorage.removeItem("workouts");
        location.reload();
    }
   
}


class Workout{
    date = new Date()
    id = (Date.now() + '').slice(-10);
    #clicks = 0;


    constructor(distance, duration, coords){
        this.distance = distance;  //? In Km
        this.duration = duration;  //? In Min
        this.coords = coords;       //? [lat , lon]
    }
    _description(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
    click(){
        this.#clicks++;
    }
   


}
class Running extends Workout{

    constructor(distance, duration, coords, cadence){
        super(distance, duration, coords);
        this.cadence = cadence;
        this.type = "running";
        this.pace = this.get_pace();
        this.description = this._description();
    }

    get_pace(){
        return (this.duration / this.distance); //? min/Km
    }
    set_pace(){
        this.pace = (this.duration / this.distance); 
    }

}
class Cycling extends Workout{

    constructor(distance, duration, coords, elevationGain){
        super(distance, duration, coords);
        this.elevationGain = elevationGain;
        this.type = "cycling";
        this.speed = this.get_speed();
        this.description = this._description();
    }
   
    get_speed(){ 
        return (this.distance / (this.duration / 60)); //? Km/h
    }
    set_speed(){
        this.speed = (this.distance / (this.duration / 60));
    }
}

//! Start The App
const app = new App();



