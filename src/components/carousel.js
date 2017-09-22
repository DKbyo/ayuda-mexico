import React, { Component } from 'react';
import Button from 'muicss/lib/react/button';
import Slider from 'react-slick';
import Panel from 'muicss/lib/react/panel';
import $ from "jquery";
export default class Carousel extends Component {
	constructor(props){
		super(props);
		this.state= {
			data:null
		}
	}
	componentDidMount(){
		 setTimeout(() => { window.dispatchEvent(new Event('resize')) }, 1000);
	}

	render(){
		const{data} = this.state;
		var settings = {
      dots: true,
    };


		return data ?(
			<div className="wrap-options" style={{width:window.visualViewport.width-300}}>
				{data.map((e)=>(
					<Panel className="inline-panel" onClick={this.select.bind(this,e)}>
	      		<div dangerouslySetInnerHTML={ {"__html":e.getTitle()}}>	      		
	      		</div>
	      	</Panel>
				))}
      </div>
		):null
	}
	setData(data){
		this.setState({
			data:data
		})
	}
	select(marker) {
		this.props.onChange(marker);
	}
}