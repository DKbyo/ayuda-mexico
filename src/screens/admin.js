/* global firebase*/
import React, { Component } from 'react';
import Panel from 'muicss/lib/react/panel';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';
import {Table, Column, Cell,} from 'fixed-data-table';
import Option from 'muicss/lib/react/option';
import Select from 'muicss/lib/react/select';

const TextCell = ({rowIndex, data, col,col2,onClick,selected, ...props}) => (
	col2?(
  <Cell  onClick={()=> onClick(data.getObjectAt(rowIndex),rowIndex)} {...props}>
    {data.getObjectAt(rowIndex)[col][col2]}
  </Cell>
  ):(
 	<Cell  onClick={()=> onClick(data.getObjectAt(rowIndex),rowIndex)}  {...props}>
    {data.getObjectAt(rowIndex)[col]}
  </Cell>
  )
);

class DataListWrapper {
  constructor( data) {
    this._data = data;
  }

  getSize() {
    return this._data.length;
  }

  getObjectAt(index) {
    return this._data[index];
  }
}

export default class Admin extends Component {
	constructor(props){
		super(props);
		this.state= {
			username:"",
			password:"",
			loggedIn:false,
			data:null,
			dataApproved:null,
			selected:null,
			index:-1,
			view:"pending"
		};
	}
	render() {
		const{username,password,loggedIn,data,dataApproved,selected,index,view} = this.state;
		return (
			<div className="full">
				{!loggedIn?(
				<Panel className="login-panel">
		     	<Input value={username} onChange={this.onChange.bind(this,"username")} invalid={username.trim()==""}  label="Usuario" floatingLabel={true} />	
		     	<Input value={password} onChange={this.onChange.bind(this,"password")} type="password" invalid={password.trim()==""}  label="Password" floatingLabel={true} />	
		     	<Button onClick={this.login} variant="raised" color="primary">Entrar</Button>
	      </Panel>
	      ):(
	      <Panel className="grid">
	      	<div>
	      		<Select name="input" onChange={this.onChangeView.bind(this,"view")} value={view} label="Ver" defaultValue="tools" >
	            <Option value="pending" label="Pendientes" />
	            <Option value="approved" label="Aprobados" />
	            <Option value="discarted" label="Descartados" />
          	</Select>
	      	</div>
	      	{(data && (view == "pending" || view=="discarted"))?(
		      	<Table       
		      	 rowsCount={data.getSize()}
		      	 height={500}
		      	 headerHeight={50}
		      	 width={720}
		      	 rowHeight={50}>
		      	 <Column
		      	    header={<Cell>¿Donde?</Cell>}
	            cell={<TextCell onClick={this.select}  data={data} col="where" col2="name"  />}
	            fixed={true}
	            width={170}
	          	/>
		      	   <Column
		      	    header={<Cell>¿Que?</Cell>}
	            cell={<TextCell onClick={this.select}   data={data} col="what" />}
	            fixed={true}
	            width={400}
	          	/>
	          	<Column
		      	    header={<Cell>Prioridad</Cell>}
	            cell={<TextCell onClick={this.select}   data={data} col="priority" />}
	            fixed={true}
	            width={80}
	          	/>
	          	<Column
		      	    header={<Cell>Tipo</Cell>}
	            cell={<TextCell onClick={this.select}   data={data} col="type" />}
	            fixed={true}
	            width={70}
	          	/>
		      	</Table>
	      	):null}
	      	{(dataApproved && (view == "approved"))?(
		      	<Table       
		      	 rowsCount={dataApproved.getSize()}
		      	 height={500}
		      	 headerHeight={50}
		      	 width={720}
		      	 rowHeight={50}>
		      	 <Column
		      	    header={<Cell>¿Donde?</Cell>}
	            cell={<TextCell onClick={this.select}  data={dataApproved} col="where" col2="name"  />}
	            fixed={true}
	            width={170}
	          	/>
		      	   <Column
		      	    header={<Cell>¿Que?</Cell>}
	            cell={<TextCell onClick={this.select}   data={dataApproved} col="what" />}
	            fixed={true}
	            width={400}
	          	/>
	          	<Column
		      	    header={<Cell>Prioridad</Cell>}
	            cell={<TextCell onClick={this.select}   data={dataApproved} col="priority" />}
	            fixed={true}
	            width={80}
	          	/>
	          	<Column
		      	    header={<Cell>Tipo</Cell>}
	            cell={<TextCell onClick={this.select}   data={dataApproved} col="type" />}
	            fixed={true}
	            width={70}
	          	/>
		      	</Table>
	      	):null}
	      </Panel>
	      )}
	      {selected?(
	      	<Panel style={{width:"calc(100% - 720px)",border:0}}>
	      		<h1> {selected.where.name}</h1>
	      		<h3> {selected.what}</h3>
	      		<h3>Tipo {selected.type}</h3>
	      		<h3>Prioridad {selected.priority}</h3>
	      		<div>
			      	<iframe 
							  frameBorder="0" style={{width:"100%",border:0,height:200}}
							  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCbmKgUhdSIch4LlwMXQnMkOq4PpY_9omU
							    &q=${selected.where.lat},${selected.where.lng}`}>
							</iframe>
						</div>
						{view=="pending" || view=="discarted"?(
							<div>
								<Button  onClick={this.discard} variant="raised" >Descartar</Button>
								<Button onClick={this.approve} variant="raised" color="primary">Aprobar</Button>
							</div>
						):null}
						{view=="approved"?(
							<div>
								<Button  onClick={this.discardApproved} variant="raised" >Descartar</Button>
							</div>
						):null}
					</Panel>
				):null}
      </div>
		)
	}
	 onChange(key,ev) {
  	let newState={success:false};
  	newState[key] = ev.target.value
  	this.setState(newState);
  }
  onChangeView(key,ev) {
  	let newState={success:false};
  	newState[key] = ev.target.value
  	this.setState(newState);
  	this.showData(ev.target.value);
  }
  approve=()=>{
  	const{selected} = this.state;
		firebase.database().ref(`alerts/${selected.key}`).update({
			approve:true,
			pending:false
		});
		firebase.database().ref(`approved/${selected.key}`).set(selected);

		this.setState({
  		selected: null
  	});
  };
  discardApproved=()=>{
  	const{selected} = this.state;
  	firebase.database().ref(`alerts/${selected.key}`).update({
			approve:false
		});
		firebase.database().ref(`approved/${selected.key}`).set(null);
		this.setState({
  		selected: null
  	});
  };
  discard=()=>{
  	const{selected} = this.state;
		firebase.database().ref(`alerts/${selected.key}`).update({
			approve:false,
			pending:false
		});
		this.setState({
  		selected: null
  	});
  };
  select=(value,index)=>{
  	this.setState({
  		selected: value
  	});
  };
  login=() =>{
  	const{username,password} = this.state;
  	firebase.auth().signInWithEmailAndPassword(username, password)
  	.then(()=>{
  		this.showData("pending")
  	})
  	.catch((error) =>{
  		console.log(error);
		  alert("Error con el usuario/contraseña");
		});
  };
  showData=(view)=>{
  	this.setState({
			loggedIn:true
  	});
  	if(view == "pending" || view == "discarted"){
	  	firebase.database().ref("alerts").orderByChild("created").on('value',(snapshot)=>{
	  		let map = snapshot.val();
	  		let keys= Object.keys(map);
	  		let values = keys.map((k)=> {
	  			let estatus = map[k].pending?"Pendiente": "";
	  			estatus = estatus==""&& map[k].approve? "Aprobado":"";
	  			return Object.assign({},map[k],{key:k,status:estatus} ) 
	  		});
	  		if(view =="pending"){
	  			values = values.filter( (v)=> v.pending);
	  		}else if(view =="discarted"){
	  			values = values.filter( (v)=> v.approve===false);
	  		}
	  		this.setState({
	  			 data:  new DataListWrapper(values )	
	  			});
	  	});
  	}else if(view=="approved"){
  		firebase.database().ref("approved").orderByChild("created").on('value',(snapshot)=>{
	  		let map = snapshot.val();
	  		let keys= Object.keys(map);
	  		let values = keys.map((k)=> Object.assign({},map[k],{key:k} ) );
	  		this.setState({
	  			 dataApproved:  new DataListWrapper(values )	
	  			});
	  	});
  	}
  };
}