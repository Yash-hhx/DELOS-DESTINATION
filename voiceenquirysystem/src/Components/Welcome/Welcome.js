import React,{Component} from 'react';
import tachyons from 'tachyons';
import './Welcome.css';
import {Calendar} from 'primereact/calendar';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import {AutoComplete} from 'primereact/autocomplete';
import App from '../VoiceResolver/App';

const def_state = {'to': {'value':'','label':'','link':''}}

class Welcome extends Component
{

	constructor(props)
	{
        super(props);
        
        let today = new Date();
        let month = today.getMonth();
        let year = today.getFullYear();
        let prevMonth = month === 0 ? 11 : month - 1;
        let prevYear = prevMonth === 11 ? year - 1 : year;
        let nextMonth = month === 11 ? 0 : month + 1;
        let nextYear = nextMonth === 0 ? year + 1 : year;

        let minDate = new Date();
        minDate.setMonth(prevMonth+1);
        minDate.setFullYear(prevYear);

        let maxDate = new Date();
        maxDate.setMonth(nextMonth);
        maxDate.setFullYear(year);

        this.state = {
            minDate: minDate,
            maxDate: maxDate,
            onwarddate: '',
            fromSelect: '',
            toSelect: '',
            countriesData: [],
            Stops: [],
            filteredFrom: [],
            filteredTo: [],
        };
        this.filterFromPlace = this.filterFromPlace.bind(this);
        this.filterToPlace = this.filterToPlace.bind(this);
    }
    
    speak = (xyz) => {
      // Check if speaking
      console.log(this.state);
      const synth = window.speechSynthesis;
      if (synth.speaking) {
        console.error('Already speaking...');
        return;
      }
      // Get speak text
      const speakText = new SpeechSynthesisUtterance(xyz);
      // Speak end
      speakText.onend = e => {
        console.log('Done speaking...');
      };
      // Speak error
      speakText.onerror = e => {
        console.error('Something went wrong');
      };
      // Speak
      synth.speak(speakText);
    }

    // Add a handler to parse and set date from voice input
    handleVoiceDate = (text) => {
      console.log('Voice recognized date:', text);
      let parsedDate = null;

      // Try dd/mm/yyyy
      const dmY = text.match(/(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{4})/);
      if (dmY) {
        parsedDate = new Date(`${dmY[3]}-${dmY[2].padStart(2, '0')}-${dmY[1].padStart(2, '0')}`);
      } else {
        // Try Date.parse
        const longDate = Date.parse(text);
        if (!isNaN(longDate)) {
          parsedDate = new Date(longDate);
        }
      }

      // Final check: only set if valid
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        console.log('Setting onwarddate to:', parsedDate);
        this.setState({ onwarddate: parsedDate });
      } else {
        alert('Could not recognize a valid date from voice input. Please try again.');
        this.setState({ onwarddate: null }); // Clear the field if invalid
      }
    }

    componentDidMount() {
        fetch('http://localhost:3001/BusStops').then(res=> res.json())
        .then(data => {
            const stops = JSON.parse(data);
            const extraStops = ['Ghaziabad', 'Delhi', 'Noida', 'Meerut'];
            const mergedStops = Array.from(new Set([...(stops || []), ...extraStops]));
            this.setState({Stops: mergedStops});
        })
        .catch((err)=>{console.log(err);})
        console.log(this.state.minDate);
    }

    filterFromPlace(event) {
        setTimeout(() => {
            
            var results = this.state.Stops.filter((place) => {
                return place.toLowerCase().startsWith(event.query.toLowerCase());
            });
            
            this.setState({ filteredFrom: results });
            
        }, 250);
        console.log(this.state);
    }

    startVoice = () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-IN';

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("You said:", transcript);

    this.sendToBackend(transcript);
  };
};

sendToBackend = (text) => {
  fetch("http://localhost:3001/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  })
  .then(res => res.json())
  .then(data => {
    console.log(data);
    this.speak(data.response || "No result found");
  })
  .catch(err => console.log(err));
};

    filterToPlace(event) {
        setTimeout(() => {
            
            var results = this.state.Stops.filter((place) => {
                return place.toLowerCase().startsWith(event.query.toLowerCase());
            });
            var results= results.filter((r)=>{return r.toLowerCase()!=this.state.fromSelect.toLowerCase()}) 
            
            this.setState({ filteredTo: results });
        }, 250);
    }
    
    speak = (msg) => {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(msg);
  synth.speak(utter);
};


	handleRegister = (event) => {
  event.preventDefault();

  const fromSelect = this.state.fromSelect ? this.state.fromSelect.trim() : '';
  const toSelect = this.state.toSelect ? this.state.toSelect.trim() : '';

  if (!fromSelect || !toSelect) {
    alert('Please choose both source and destination.');
    return;
  }

  this.props.SetTravelDate(this.state.onwarddate);

  fetch('http://localhost:3001/CheckRoute', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromSelect,
      toSelect
    })
  })
    .then(res => res.json())
    .then(data => {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      this.setState({ response: parsed });

      if (parsed.error === '') {

        this.props.setPlaces(fromSelect, toSelect);
        this.props.Reset();

        if (this.props.sbus === true) {
          this.props.SetRouteIds(parsed.response);
          this.props.onRouteChange('search');
        } else {
          this.props.onRouteChange('locate');
        }
      } else {
        alert("No such route exists");
      }
    })
    .catch(err => console.log(err));
};


    handleChange1 = (selectedOption) => {
      this.setState(def_state);
      this.setState({from:selectedOption},() => {
      document.getElementById('from').value=this.state.from.label;
      document.getElementById('to').value=this.state.to.label;
      })  };

    handleChange2 = (selectedOption) => {
      this.setState({to: selectedOption},() => {
      document.getElementById('to').value=this.state.to.label; 
        }) }

	render()
	{

return (
    

    <div className='formwarp pa2 shadow-2 center'>      

    <button onClick={this.startVoice}>
  🎤 Speak
</button>  

    <form>
    		<div className='wraap pa2 center'>
            <div className="form-group col-md-10">
              <label htmlFor="onwarddate">Pick a Date: </label>
              <Calendar 
                dateFormat="dd/mm/yy" 
                value={this.state.onwarddate} 
                minDate={this.state.minDate}
                maxDate={this.state.maxDate}
                onChange={(e) => this.setState({onwarddate: e.value})} 
                showIcon={true} />
              {/* Hidden textarea for voice date input */}
              <textarea id="onwarddate-voice" style={{display: 'none'}} />
              <App id="onwarddate-voice" onVoiceInput={this.handleVoiceDate}/>
            </div>

    			{/**/} 
    			 <div className="form-group col-md-10">
    			 	     <label htmlFor="from">Source Place:</label>
 
                                  <AutoComplete style={{background:"#000000"}}
                                                value={this.state.fromSelect} 
                                                suggestions={this.state.filteredFrom} 
                                                completeMethod={this.filterFromPlace}                                    
                                                size={30}
                                                placeholder="From Place" 
                                                minLength={1} 
                                                onChange={(e) => this.setState({fromSelect: e.value})} />
    			 </div>
                    <App id={1} onVoiceInput={(text) => this.setState({fromSelect: text})}/>


    			  <div className="form-group col-md-10">
    			      	 <label htmlFor="to">Destination</label>
    						
                           <AutoComplete style={{background:"#000000"}}
                                                value={this.state.toSelect} 
                                                suggestions={this.state.filteredTo} 
                                                completeMethod={this.filterToPlace}                                    
                                                size={30}
                                                placeholder="To Place" 
                                                minLength={1} 
                                                onChange={(e) => this.setState({toSelect: e.value})} />

    			  </div>
                    <App id={2} onVoiceInput={(text) => this.setState({toSelect: text})}/>


    			  <div className="form-group col-md-10">
    			  
    			  <button
  type="button"
  style={{marginLeft:'20px'}}
  onClick={this.handleRegister}
  className="btn btn-primary"
>
  Search Buses
</button>
    			  
    			  
    			  </div>

    		</div>
    </form>
    </div>


			);
	}
}

export default Welcome;