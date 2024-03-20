import axios from "axios";

const apiKey = "a1e158a3830aabee38887ec3dff794688cfd522b";

const getUFForYear = (year) =>{
    return axios.get(`https://api.cmfchile.cl/api-sbifv3/recursos_api/uf/${year}?apikey=${apiKey}&formato=json`);
};

export {getUFForYear};