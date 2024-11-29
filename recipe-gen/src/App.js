import React, { useEffect, useRef, useState } from "react";
import './App.css';

const CardReceta = ({ onSubmit }) => {
  const [ingredientes, setIngredientes] = useState("");
  const [tipoComida, setTipoComida] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [tiempoCocina, setTiempoCocina] = useState("");
  const [complejidad, setComplejidad] = useState("");

  const handleSubmit = () => {
    const dataReceta = {
      ingredientes,
      tipoComida,
      cuisine,
      tiempoCocina,
      complejidad,
    };
    onSubmit(dataReceta);
  };

  return (
    <div className='w-[400px] border rounded-lg overflow-hidden shadow-lg'>
      <div className='px-6 py-4'>
        <div className='font-bold text-xl mb-2'>Generador de recetas</div>
        <div className='mb-4'>
          <label
            className='block text-gray-700 text-sm font-bold mb-2'
            htmlFor='ingredientes'
          >
            Ingredientes
          </label>
          <input
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            id='ingredientes'
            type='text'
            placeholder='Ingrese sus ingredientes'
            value={ingredientes}
            onChange={(e) => setIngredientes(e.target.value)}
          />
        </div>
        <div className='mb-4'>
          <label
            className='block text-gray-700 text-sm font-bold mb-2'
            htmlFor='tipoComida'
          >
            Tipo de comida
          </label>
          <select
            className='block appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight'
            id='tipoComida'
            value={tipoComida}
            onChange={(e) => setTipoComida(e.target.value)}
          >
            <option value="Desayuno">Desayuno</option>
            <option value="Almuerzo">almuerzo</option>
            <option value="Snack">Snack</option>
            <option value="Cena">Cena</option>
          </select>
        </div>
        <div className='mb-4'>
          <label
            className='block text-gray-700 text-sm font-bold mb-2'
            htmlFor='cuisine'
          >
            Cuisine
          </label>
          <input
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight'
            id='cuisine'
            type='text'
            placeholder='Ejemplo: Argentina, Mexicana'
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
          />
        </div>
        <div className='mb-4'>
          <label
            className='block text-gray-700 text-sm font-bold mb-2'
            htmlFor='tiempoCocina'
          >
            Tiempo de cocinado
          </label>
          <select
            className='block appearance-none w-full bg-white border border-gray-400'
            id='tiempoCocina'
            value={tiempoCocina}
            onChange={(e) => setTiempoCocina(e.target.value)}
          >
            <option value="Menos de 30 minutos">Menos de 30 minutos</option>
            <option value="30 a 60 minutos">30 a 60 minutos</option>
            <option value="Mas de una hora">Más de una hora</option>
          </select>
        </div>
        <div className='mb-4'>
          <label
            className='block text-gray-700 text-sm font-bold mb-2'
            htmlFor='complejidad'
          >
            Complejidad
          </label>
          <select
            className='block appearance-none w-full bg-white border border-gray-400'
            id='complejidad'
            value={complejidad}
            onChange={(e) => setComplejidad(e.target.value)}
          >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>
        <div className="px-6 py-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleSubmit}
          >
            Generar receta
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [dataReceta, setDataReceta] = useState(null);
  const [textoReceta, setTextoReceta] = useState("");

  let eventSourceRef = useRef(null)

  useEffect(() => {
    closeEventStream(); // Close any existing connection
  }, []);

  useEffect(()=>{
    if(dataReceta) {
      closeEventStream();
      inicializarEventStream();
    }
  }, [dataReceta]);

  const inicializarEventStream = () => {
    const inputsReceta = {... dataReceta};

    const queryParams = new URLSearchParams(inputsReceta).toString();
    const url = `http://localhost:3001/recetaStream?${queryParams}`;
    eventSourceRef.current = new EventSource(url);

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      if(data.action === "close") {
        closeEventStream();
      } else if(data.action === 'chunk') {
        setTextoReceta((prev) => prev + data.chunk);
      }
    };
    eventSourceRef.current.onerror = () => {
      eventSourceRef.current.close();
    };
  };

  const closeEventStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };
  
  async function onSubmit(data) {
    setTextoReceta('')
    setDataReceta(data);
  }

  return (
    <div className="App">
      <div className='flex flex-row h-full my-4 gap-2 justify-center'>
        <CardReceta onSubmit={onSubmit} />
        <div className='w-[400px] h-[565px] text-xs text-gray-600 p-4 border rounded-lg shadow-xl whitespace-pre-line overflow-y-auto'>
          {textoReceta}
        </div>
      </div>
    </div>
  );
}

export default App;
