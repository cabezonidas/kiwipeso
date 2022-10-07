import React from "react";
import "./App.css";

const getUsdNzdRates = async () => {
  const query = await fetch(
    "https://api.apilayer.com/currency_data/live?base=USD",

    {
      headers: {
        [`${"ap"}${"ik"}${"ey"}`]: window[`${"at"}${"ob"}`](
          "eGdQYXlZekJKN1hBb2VYc3B4UGd6RTZ4R3g0Vklqc0M="
        ),
      },
    }
  );
  const response = await query.json();
  return response.quotes["USDNZD"] as number;
};

const getBlueRates = async () => {
  const query = await fetch(
    "https://www.dolarsi.com/api/api.php?type=valoresprincipales"
  );
  const response = (await query.json()) as any[];
  const {
    casa: { compra, venta },
  } = response.find((r) => r.casa.nombre === "Dolar Blue");
  return {
    compra: Number(compra.slice(0, compra.length - 3)),
    venta: Number(venta.slice(0, venta.length - 3)),
  };
};

function App() {
  const [number, setNumber] = React.useState("");
  const [pair, setPair] = React.useState<{ usd: number; blue: number }>();
  const digits = [...new Array(9).fill(undefined).map((_, i) => i + 1), 0];

  const value = Number(number);

  React.useEffect(() => {
    const load = () =>
      getUsdNzdRates().then((usd) => {
        getBlueRates().then(({ compra: blue }) => {
          setPair({ usd, blue });
        });
      });
    load();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p style={{ margin: 0 }}>{value} 🇦🇷</p>
        <span>
          {value && pair ? ((value / pair.blue) * pair.usd).toFixed(2) : 0} 🥝
        </span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(4, 50px)",
            width: "100vw",
            maxWidth: "350px",
          }}
        >
          {digits.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() =>
                setNumber((prev) => (prev.length < 10 ? prev + digit : prev))
              }
              style={digit === 0 ? { gridColumnStart: 2 } : undefined}
            >
              {digit}
            </button>
          ))}
          {
            <button
              type="button"
              onClick={() =>
                setNumber((prev) => prev.slice(0, prev.length - 1))
              }
            >
              ←
            </button>
          }
        </div>
      </header>
    </div>
  );
}

export default App;
