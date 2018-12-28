const http = require('http');
http.get('http://dr_nas.fenix-mfg.com:5000/webapi/auth.cgi?api=SYNO.API.Auth&version=3&method=login&account=api&passwd=H1IkYdRLE7nVS5mGPZBQ&session=FileStation&format=sid', (res) => {
	const { statusCode } = res;
	console.log(statusCode);
	res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      console.log(parsedData);
    } catch (e) {
      console.error(e.message);
    }
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});