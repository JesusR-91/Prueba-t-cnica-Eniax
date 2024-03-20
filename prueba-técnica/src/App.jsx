import { useState, useEffect } from 'react'
import {getUFForYear} from "./services/api.services";

import './App.css'
import { Card, CardGroup, FormControl, FormLabel } from 'react-bootstrap';
import { BeatLoader } from 'react-spinners';

function App() {
  //STATES
  const[year, setYear] = useState();
  const[uFforYear, setUFforYear] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reload, setReload] = useState(true);
  const [monthsPositives, setMonthsPositives] = useState();
  const [monthsNegatives, setMonthsNegatives] = useState();
  const [monthsEqual, setMonthsEqual] = useState();
  
  //VARIABLES
  // const navigate = useNavigate();

  //FUNCIONES

  const getData = async () =>{
    try {
      //Llamada al servicio
      const response = await getUFForYear(year);

      //Establecemos la data de la llamada
      const data = response.data;

      //Dado que lo que nos llega es un objeto, establecemos el valor del Estado ufForYear como los valores del mismo, siendo el array que buscamos.
      setUFforYear(Object.values(data.UFs));

      //Cambiamos el valor de isLoading para que una vez obtengamos la data pase del spinner a mostrar los datos.
      setIsLoading(false);
      setReload(!reload)
      
    } catch (error) {
      console.log(error);
    }
  };

  //Función para establecer el mes
  const handleMonths = () =>{

    //Establecer un array con el valor cada día 1 del mes
    let arrayFirstDaysOfEachMonth = []
    
    uFforYear.forEach((of) => {

      //Damos formato a la fecha
      const date = new Date(of.Fecha);

      //Sacamos el mes
      const month = date.getMonth() + 1; // Sumamos 1 porque los meses en Javascript empiezan contando por 0
    
      if (date.getDate() === 1) {
        //Comprobamos si el mes no está incluido en el array que hemos creado para incluir solo los valores a principio de mes
        if (!arrayFirstDaysOfEachMonth[month]) {
          arrayFirstDaysOfEachMonth.push(of);
        } 
      }
    })

    //Variables para cada condición establecida (meses al alza, baja y sin varianza)
    let positives = [];
    let negatives = [];
    let equals = [];
    
    for (let i = 0; i < arrayFirstDaysOfEachMonth.length; i++) {

      //Por facilitar el caso, consideraremos el primer mes del año como mes sin varianza
      if (i == 0){
        equals.push(arrayFirstDaysOfEachMonth[i]);
      } else {
        const current = arrayFirstDaysOfEachMonth[i];
        const previous = arrayFirstDaysOfEachMonth[i - 1];
  
        if (current.Valor > previous.Valor) {
          //Establecemos una pareja dentro del objeto para que nos sea más fácil ordenarlos
          current.difference = parseFloat(current.Valor) - parseFloat(previous.Valor);
          positives.push(current);
        } else if (current.Valor < previous.Valor) {
          current.difference =parseFloat(previous.Valor) - parseFloat(current.Valor);
          negatives.push(current);
        } else {
          equals.push(current);
        }
      }
    }
    //Ordenamos las arrays para que cumplan las condiciones:
    positives.sort((a, b) => {
      if(a.difference > b.difference){
        return -1;
      } else if(a.difference < b.difference){
        return 1;
      }else {
        return 0;
      }
    })
    negatives.sort((a, b) =>{
      if(a.difference > b.difference){
        return 1;
      } else if(a.difference < b.difference){
        return -1;
      }else {
        return 0;
      }
    })
    //Orden alfabético del mes para los que no varía
    equals.sort((a,b) =>{
      let currentMonth = new Date(a.Fecha).toLocaleString('es-ES', { month: 'long' });
      let nextMonth = new Date(b.Fecha).toLocaleString('es-ES', { month: 'long' });

      if(currentMonth > nextMonth){
        return 1;
      } else if (currentMonth < nextMonth){
        return -1;
      } else {
        return 0;
      }
    })

    //Establecer States
    setMonthsPositives(positives);
    setMonthsNegatives(negatives);
    setMonthsEqual(equals);
  }

  //Función para establecer el año
  const handleYear = (event) => {
    setYear(event.target.value);
    //Para forzar que se recargue la página cada vez que modifiquemos el valor del input
    setReload(!reload);
  }

  // Usamos el useEffect para controlar las llamadas asincronas y que no generen un problema a la hora de cargar la página por primera vez.
  // Para recargar la página cuando se cumplan ciertas condiciones, hemos establecido el estado de reload (que cambiará de valor, por ejemplo, con cuando se introduce el año, lo que fuerza a que se recargue la página y actualicen los datos)
  useEffect(() => {
    getData();
    handleMonths();
    
  }, [reload]);

  return (
    <CardGroup className='mainContainer'>
      <div>
        <h2>Base de datos de los valores de la Unidad de Fomento (Chile)</h2>
        <FormLabel>Introduce el año del que deseas realizar la búsqueda: </FormLabel>
        <FormControl className='input' type="text" values={year} onChange={handleYear}  placeholder="Formato: 2024"/>
      </div>
      <CardGroup className='secondContainer'>
        <CardGroup className='container'> 
          <div>
            <h3>Valores de UF (por días) para el año: {year}</h3>
          </div>
          {
            !isLoading ? 

            uFforYear.map((uf, index) => {
              return (
                <Card key={index} className='card'>
                    <p><b>Fecha:</b> {uf.Fecha}</p>
                    <p><b>Valor:</b>  {uf.Valor}</p>
                </Card>
              );
            }) : (<BeatLoader className='loader' color='#36d7b7'/>)
          }       
        </CardGroup>
        <br/>

        {/* VARIANZA AL ALZA */}
        <CardGroup className='container'> 
          <div>
            <h3>Meses de varianza al alza para el año: {year} (ordenados por aumento de valor)</h3>
          </div>
          {

            !isLoading ? 
              monthsPositives.map((uf, index) => {
                return (
                  <Card key={index} className='card'>
                      <p><b>Fecha:</b> {uf.Fecha}</p>
                      <p><b>Valor:</b>  {uf.Valor}</p>
                      <p><b>Diferencia:</b> {uf.difference}</p>
                  </Card>
              )}) 
            : (<BeatLoader className='loader' color="#36d7b7" />)
          }       
        </CardGroup>
        <br/>

        {/* VARIANZA A LA BAJA */}
        <CardGroup className='container'> 
          <div>
            <h3>Meses de varianza a la baja para el año: {year} (ordenados por descenso de valor)</h3>
          </div>
          {
            !isLoading ? 

            monthsNegatives.map((uf, index) => {

              return (
                <Card key={index} className='card'>
                    <p><b>Fecha:</b> {uf.Fecha}</p>
                    <p><b>Valor:</b>  {uf.Valor}</p>
                    <p><b>Diferencia:</b> {uf.difference}</p>
                </Card>
              );
            }): (<BeatLoader className='loader' color="#36d7b7" />)
          }       
        </CardGroup>
        <br/>

        {/* NO VARIANZA */}
        <CardGroup className='container'> 
          <div>
            <h3>Meses donde el valor no varío: {year} (ordenados alfabéticamente por nombre del mes)</h3>
          </div>
          {
            !isLoading ? 

            monthsEqual.map((uf, index) => {

              return (
                <Card key={index} className='card'>
                    <p><b>Fecha:</b> {uf.Fecha}</p>
                    <p><b>Valor:</b>  {uf.Valor}</p>
                </Card>
              );
            }): (<BeatLoader className='loader' color="#36d7b7" />)
          }         
        </CardGroup>
        <br/>

        {/* MENOR Y MAYOR VALOR DEL AÑO */}
        <CardGroup className='container'> 
          
          <h3>Días de menor y mayor valor del año {year}</h3>
          
          {
            !isLoading ? (
              <div>

                <Card>
                  <p><b>Valor más bajo:</b> {uFforYear.reduce((min, uf) => uf.Valor < min ? uf.Valor : min, uFforYear[0].Valor)}</p>
                  <p><b>Fecha:</b> {uFforYear.find(uf => uf.Valor === uFforYear.reduce((min, uf) => uf.Valor < min ? uf.Valor : min, uFforYear[0].Valor)).Fecha}</p>

                </Card>
                <br />
                <Card>
                  <p><b>Valor más alto:</b> {uFforYear.reduce((max, uf) => uf.Valor > max ? uf.Valor : max, uFforYear[0].Valor)}</p>
                  <p><b>Fecha:</b> {uFforYear.find(uf => uf.Valor === uFforYear.reduce((max, uf) => uf.Valor > max ? uf.Valor : max, uFforYear[0].Valor)).Fecha}</p>                
                </Card>
              </div>
            ) : (<BeatLoader className='loader' color="#36d7b7" />)
          }       
        </CardGroup>
      </CardGroup>
    </CardGroup>
  );

}

export default App
