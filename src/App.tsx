import React from "react";
import "./App.css";

const getUsdNzdRates = async (): Promise<NZD> => {
  const query = await fetch(
    `https://fxmarketapi.com/apilive?api_key=${window[`${"at"}${"ob"}`](
      "UGNBbHJNbTNCbnEwakRHVFhfeUI="
    )}&currency=USDNZD,NZDUSD`
  );
  const response = await query.json();
  return {
    nzdusd: response.price["USDNZD"] as number,
    usdnzd: response.price["NZDUSD"] as number,
  };
};

const getBlueRates = async (): Promise<BLUE> => {
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

type NZD = { nzdusd: number; usdnzd: number };
type BLUE = { compra: number; venta: number };
type STATE = { usd: NZD; blue: BLUE };

const fetchAgain = async (): Promise<STATE> => {
  const usd = await getUsdNzdRates();
  const blue = await getBlueRates();
  localStorage.setItem(
    "local-value",
    JSON.stringify({ usd, blue, timestamp: new Date().getTime() })
  );
  return { usd, blue };
};
const load = async () => {
  try {
    const { usd, blue, timestamp } = JSON.parse(
      localStorage.getItem("local-value") ?? ""
    ) as { usd: NZD; blue: BLUE; timestamp: number };
    const oneDay = 86400000;
    if (
      new Date().getTime() - timestamp < oneDay &&
      typeof usd.nzdusd === "number" &&
      typeof usd.usdnzd === "number" &&
      typeof blue.compra === "number" &&
      typeof blue.venta === "number"
    ) {
      return { usd, blue };
    }
    // eslint-disable-next-line no-throw-literal
    throw "old-value";
  } catch {
    localStorage.removeItem("local-value");
    return fetchAgain();
  }
};

function App() {
  const [number, setNumber] = React.useState("");
  const [pair, setPair] = React.useState<{
    usd: NZD;
    blue: BLUE;
  }>();
  const digits = [...new Array(9).fill(undefined).map((_, i) => i + 1), 0];

  const value = Number(number);

  React.useEffect(() => {
    load().then((p) => {
      setPair(p);
    });
  }, []);

  const oneKiwi = pair?.blue.compra! * pair?.usd.usdnzd!;

  return (
    <div className="App">
      <header className="App-header">
        <p style={{ margin: 0 }}>{value} 🇦🇷</p>
        <span>
          {value && pair
            ? ((value / pair.blue.venta) * pair.usd.nzdusd).toFixed(2)
            : 0}{" "}
          🥝
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
        <p
          style={{ margin: 0, marginTop: 10, fontSize: "smaller" }}
        >{`1 NZD = ${isNaN(oneKiwi) ? "..." : oneKiwi.toFixed(2)} ARS`}</p>
      </header>
    </div>
  );
}

export default App;
