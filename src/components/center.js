import React, { Component } from 'react';
import Button from 'muicss/lib/react/button';

export default class Center extends Component {
	render(){
		return (
	    <Button variant="raised" color="primary" onClick={this.props.onClick}>
				<i className="fa fa-location-arrow" aria-hidden="true"></i> <span>¿Donde puedo ayudar?</span>
			</Button>
		)
	}
}