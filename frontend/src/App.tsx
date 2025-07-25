import { useState, useEffect } from "react";

interface DataItem {
  name: string;
  id: number;
}

// Wrap the code in a functional component
const App = () => {
  const [data, setData] = useState<DataItem[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/data')
      .then(res => res.json())
      .then((apiData: DataItem[]) => setData(apiData));
  }, []);

  return (
    <div>
      <h1>Data</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li> 
        ))}
      </ul>
    </div>
  );
}

// Export the component
export default App;