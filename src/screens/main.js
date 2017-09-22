/*global google, firebase*/
import React, { Component } from 'react';
import Input from 'muicss/lib/react/input';
import Option from 'muicss/lib/react/option';
import Select from 'muicss/lib/react/select';
import Textarea from 'muicss/lib/react/textarea';
import Button from 'muicss/lib/react/button';
import moment from 'moment';
import request from 'superagent';
import ReactDOM from 'react-dom';
import CenterButton from '../components/center';
import Carousel from '../components/carousel';
moment.locale('es');



const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
});

function getDistanceInKm(location1,location2) {
  let lat1 = location2.lat || location1.lat() ;
  let lon1 = location1.lng || location1.lng();
  let lat2 = location2.lat;
  let lon2 = location2.lng;

  const R = 6371; // Radius of the earth in km
  let dLat = deg2rad(lat2-lat1);  // deg2rad below
  let dLon = deg2rad(lon2-lon1); 
  let a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  let d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

export default class Main extends Component {
	constructor(props){
		super(props);
		this.state= {
			view:"map",
			active:false,
			where:null,
			what:"",
			priority:"medium",
			success:false,
      type:"tools"
		};
		this.markers= [];
    this.legacyMarkers = [];

    window.directions =(lat,lng) =>{
      var directionsService = new google.maps.DirectionsService;
      this.placeService.nearbySearch({
        location: this.userPosition,
        name:"tienda",
        radius: getDistanceInKm({lat:lat,lng:lng},this.userPosition)*1000
      }, (tiendas)=>{
        console.log("tiendas",tiendas);
        let directionsRequest = {
          origin: this.userPosition,
          destination: {lat:lat,lng:lng},
          travelMode: 'WALKING',
          
          optimizeWaypoints: true,
        }
        if(tiendas.length>0){

          directionsRequest.waypoints=[{location:tiendas[0].geometry.location}]
        }
        directionsService.route(directionsRequest, (response, status)=> {
          if (status === 'OK') {
            this.directionsDisplay.setDirections(response);
            this.directionsDisplay.setMap(this.map);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      });


    }
    navigator.geolocation.getCurrentPosition((position)=> {
        var pos = //{lat: 19.4326018, lng: -99.1353936};
        {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.userPosition = pos;
    })
	}

	componentDidMount(){
		this.refs.where.controlEl.placeholder=" ";
  	let autocomplete = new google.maps.places.Autocomplete(this.refs.where.controlEl);
  	autocomplete.addListener('place_changed', ()=> {
  		let place = autocomplete.getPlace();
  		this.setState({
  			where:{
  				lat: place.geometry.location.lat(),
  				lng: place.geometry.location.lng(),
  				name: place.formatted_address
  			}
  		})
  	});
  	this.map = new google.maps.Map(this.refs.map, {
      center: {lat: 19.4326018, lng: -99.1353936},
      zoom: 12,
      mapTypeControl:false
    });
    let center = document.createElement('div');
    ReactDOM.render(<CenterButton onClick={this.whereCanIHelp}/>, center);
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(center);
    
    let carousel = document.createElement('div');
    
    this.internalCarousel =  ReactDOM.render(<Carousel onChange={this.selectMaker}/>, carousel);
    this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(carousel);
    this.placeService = new google.maps.places.PlacesService(this.map);

    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(this.map)
    this.loadAlerts();
    this.loadLegacy();
	}
	componentDidUpdate(){
		if(this.map){
  		google.maps.event.trigger(this.map, 'resize')
  	}
	}

  render() {
  	const {active,what,where,priority,success,view,type} = this.state;
  	const classActive = active ? "active":"";

    return (
      <div className="full">
      	
    		<div ref="map" className={`map ${classActive} ${view=="map"?"visible":"hidden"}` }>

    		</div>
    
    		<iframe key={view} className={`map ${classActive} ${view!="map"?"visible":"hidden"}`} src={view}></iframe>
    	
	      <div className={`toolbar ${classActive}`}>
	      	<button className="btn-toolbar" onClick={this.showAdd}>
	      		<i className="fa fa-plus" aria-hidden="true"></i> <span>Solicitar ayuda</span>
	      	</button>
	      		<button className="btn-toolbar" onClick={this.showMap}>
	      		<i className="fa fa-map" aria-hidden="true"></i> <span>Feed oficial </span>
	      	</button>
	      	<button className="btn-toolbar" onClick={this.showBuildingMap}>
	      		<i className="fa fa-building" aria-hidden="true"></i><span>Feed no oficial</span>
	      	</button>
	      	<button className="btn-toolbar" onClick={this.showGoogleChaos}>
	      		<i className="fa fa-compass" aria-hidden="true"></i><span>Google Crisis</span>
	      	</button>
	      	<button className="btn-toolbar" onClick={this.showGoogleFinder}>
	      		<i className="fa fa-google" aria-hidden="true"></i><span>Google Finder</span>
	      	</button>
	      	<button className="btn-toolbar" onClick={this.showFacebookFinder}>
	      		<i className="fa fa-facebook" aria-hidden="true"></i><span>Facebook Safety Check</span>
	      	</button>
	      </div>
	      <div className={`sideWindow ${classActive}`}>
	      	<button className="btn-inside-toolbar" onClick={this.close}>
	      		<i className="fa fa-times" aria-hidden="true"></i>
	      	</button>
	      	<Input ref="where" invalid={where==null}  label="¿En donde?" floatingLabel={true} />	
	      	{where?(
		      	<iframe
						  width="320"
						  height="320"
						  frameBorder="0" style={{border:0}}
						  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCbmKgUhdSIch4LlwMXQnMkOq4PpY_9omU
						    &q=${where.lat},${where.lng}`}>
						</iframe>
					):null}
	      	<Textarea value={what} invalid={what.trim()==""} onChange={this.onChange.bind(this,"what")} rows="3" label="¿Que se necesita?" floatingLabel={true} />
          
          <Select name="input" onChange={this.onChange.bind(this,"type")} value={type} label="¿Que categoria?" defaultValue="tools" >
            <Option value="work" label="Mano de obra" />
            <Option value="food" label="Alimentos" />
            <Option value="medicine" label="Medicinas" />
            <Option value="tools" label="Herramientas" />
            <Option value="other" label="Otros" />
          </Select>

					<Select name="input" onChange={this.onChange.bind(this,"priority")} value={priority} label="¿Que tan importante?" defaultValue="medium" >
	          <Option value="high" label="Mucho" />
	          <Option value="medium" label="Regular" />
	          <Option value="low" label="Poco" />
	        </Select>
	        
	        {what.trim()=="" || where ==null?(
	       		<div className="mui--text-danger">Por favor llene todos los campos</div>
	        ):null}
	      	<Button disabled={what.trim()=="" || where ==null} onClick={this.save} variant="raised" color="primary">Guardar</Button>


	      </div>
      </div>
    );
  }
  onChange(key,ev) {
  	let newState={success:false};
  	newState[key] = ev.target.value
  	this.setState(newState);
  }
  selectMaker=(marker)=>{
    this.map.panTo(marker.getPosition());
    google.maps.event.trigger(marker, 'click');
  };
  whereCanIHelp=()=>{
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position)=> {
        var pos = //{lat: 19.4326018, lng: -99.1353936};
        {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.userPosition = pos;
        this.map.panTo(pos);
        if(!this.markerLocation){
          this.markerLocation =new google.maps.Marker({
            position: pos,
            map: this.map,
            title: "Mi posición",
            icon:{
              url: "/location.png",
              scaledSize:  new google.maps.Size(30, 30)
            }
          });

        }
        this.map.setZoom(14);
        let nearMarkers1 = this.markers.filter((marker)=>
          getDistanceInKm(marker.getPosition(),pos) < 10
        );

        let nearMarkers2 =  this.legacyMarkers.filter((marker)=>
          getDistanceInKm(marker.getPosition(),pos) < 10
        );
        this.internalCarousel.setData(nearMarkers1.concat(nearMarkers2));
      }, ()=> {
        alert("Por favor activa tu geolocalizacion")
      });
    } else {
      // Browser doesn't support Geolocation
      alert("Por favor activa tu geolocalizacion")
    }
  };
  close=()=>{
  	this.setState({
  		active:false
  	})
  };
  showAdd= () =>{
  	this.setState({
  		active:true
  	})
  };
  showMap=() =>{
  	this.setState({
  		active:false,
  		view:"map"
  	})
  };
  showBuildingMap=() =>{
  	this.setState({
  		active:false,
  		view:"https://www.google.com/maps/d/embed?mid=13B_gbt3e5RWk_6xQoQ15xxhGOFs"
  	})
  };
  showGoogleChaos=() =>{
  	this.setState({
  		active:false,
  		view:"https://google.org/crisismap/google.com/puebla-mexico-earthquake-es?hl=es-MX&llbox=19.6098%2C19.1908%2C-98.6678%2C-99.6058&t=ROADMAP&layers=3%2C1%2C31%2C32%2C6%2C7%2C49%2C15%2C11%2C2&embedded=true"
  	})
  };
  showGoogleFinder=() =>{
  	this.setState({
  		active:false,
  		view:"https://google.org/personfinder/2017-puebla-mexico-earthquake"
  	})
  };
  showFacebookFinder=() =>{

  	window.open("https://www.facebook.com/safetycheck/rabosa-puebla-mexico-earthquake-sep19-2017/");
  };
  save =() =>{
  	 const{what,where,priority,type} = this.state;
  	 if(what.trim()=="" || where ==null ){
  	 		return;
  	 }
  	 let key = firebase.database().ref('alerts/').push().key;
  	 firebase.database().ref(`alerts/${key}`).set({
  	 	what,
  	 	where,
  	 	priority,
      type,
  	 	pending:true,
  	 	created: new Date().getTime()
  	 });
  	 this.setState({
  	 	what:"",
  	 	where:null,
  	 	priority:"medium",
  	 	success:true,
      type:"tools"
  	 })
  	 alert("Se guardo con exito la información");
  };
  loadAlerts =() =>{
  	firebase.database().ref("approved").orderByChild("created").on('value',(snapshot)=>{
  		let map = snapshot.val();
  		let keys= Object.keys(map);
  		let values = keys.map((k)=> Object.assign({},map[k],{key:k} ));
  		this.markers.forEach((m)=>{
  			m.setMap(null);
  		});
  		this.markers= [];
  		values.forEach((m)=>{
        var latlng = m.where.lat +","+m.where.lng;
  			var infowindow = new google.maps.InfoWindow({
          content: "<div class='directions' onClick='directions("+latlng+")'><i class='fa fa-road' aria-hidden='true'></i>Como llegar</div>"+ m.what+ "<br/>"+m.where.name+"<br/>"+m.priority+"<br/>"+ moment(m.created).fromNow()
        });
        let imageURL="/caution.png";
        if(m.type){
          imageURL = "/icons/"+m.type;
          switch(m.priority){
            case "high":
              imageURL+="_3.png"
            break;
            case "medium":
              imageURL+="_2.png"
            break;
            case "low":
              imageURL+="_1.png"
            break;
          }
        }
  			var marker = new google.maps.Marker({
          position: m.where,
          map: this.map,
          title:m.what+ "<br/>"+m.where.name+"<br/>"+m.priority+"<br/>"+ moment(m.created).fromNow(),
          icon:{
            url:imageURL,
            scaledSize:  new google.maps.Size(20, 20)
          }
        });
        marker.addListener('click', ()=> {
          infowindow.open(this.map, marker);
          this.directionsDisplay.setMap(null);
        });
        google.maps.event.addListener(infowindow, 'closeclick', ()=>{
          this.directionsDisplay.setMap(null);
         });
        this.markers.push(marker);
  		})
  	});
  };
  loadLegacy= ()=>{
  	let map = this.map;
  	request.get('/data.json')
  	.then((json)=>{
  		json.body.forEach((e)=>{
        let coordinates = e.point.coordinates.split(",");

        var latlng = coordinates[1]+","+coordinates[0];
  			let infowindow = new google.maps.InfoWindow({
          content: "<div class='directions' onClick='directions("+latlng+")'><i class='fa fa-road' aria-hidden='true'></i>Como llegar</div>"+e.name +"<br/>"+e.description
        });
  			let marker = new google.maps.Marker({
          position: {lat:Number(coordinates[1]),lng:Number(coordinates[0])},
          map: map,
          title: e.name +"<br/>"+e.description,
          icon:{
            url:"/caution.png",
            scaledSize:  new google.maps.Size(20, 20)
          }
        });
        marker.addListener('click', ()=> {
          infowindow.open(this.map, marker);
          this.directionsDisplay.setMap(null);
        });
        google.maps.event.addListener(infowindow, 'closeclick', ()=>{
          this.directionsDisplay.setMap(null);
         });
        this.legacyMarkers.push(marker);
  		});
  	})
  };
}

