var fs = require('fs');
var request = require('superagent');
var parseString = require('xml2js').parseString;

request.get('http://www.google.com/maps/d/kml?forcekml=1&mid=13B_gbt3e5RWk_6xQoQ15xxhGOFs&lid=iZ2oOCVl7gg')
  	.then((response)=>{
  		var respuesta = response.text;
  		if(!respuesta.endsWith("</kml>")){
  			respuesta+="></kml>";
  		}
  		console.log(respuesta);
  		parseString(respuesta, {strict:false,normalizeTags:true,explicitArray:false},function (err, result) {
  			console.log(err);
  			fs.writeFileSync("./public/data.json",JSON.stringify(result.kml.document.placemark));
			});
  	});

