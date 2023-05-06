import { useState, useEffect } from "react";
import { useQuery } from "react-query";

let Emoji = {
  Cow: "🐄",
  CowFace: "🐮",
  Shit: "💩",
};

function Title() {
  return (
    <div className="flex flex-col items-center text-2xl ">
      <div className="text-4xl md:text-5xl">
        <span id="cowBase" className="invisible">
          {Emoji.Cow}
        </span>
        {Emoji.Shit}
      </div>
      <div className="uppercase">Bingo</div>
    </div>
  );
}

function* getAllIdsFromDimensions(dimensions) {
  for (let y = 0; y < dimensions[0]; ++y) {
    for (let x = 0; x < dimensions[1]; ++x) {
      yield { x, y };
    }
  }
}

class GridMetadata {
  constructor(x, y) {
    this.cord = { x, y };
    this.claim = undefined;
  }

  idForSquare() {
    return `square(${this.cord.x}, ${this.cord.y})`;
  }
}

function GridSquare({ metadata, onClick = () => true }) {
  return (
    <div
      id={metadata.idForSquare()}
      className="bg-green-200 aspect-square w-full min-h-[3rem] md:min-h-[3.5rem] lg:min-h-[4rem] border border-green-300"
      onClick={onClick}
    >
      {metadata.claim ? metadata.claim : ""}
    </div>
  );
}

function Grid({ dimension, metadata = [], onSelect = (cord) => true }) {
  let makeClickCallback = (m) => {
    return () => {
      onSelect(m);
    };
  };
  if (dimension[0] * dimension[1] != metadata.length) {
    return <>Error</>;
  }

  return (
    <div
      style={{ "grid-template-columns": `repeat(${dimension[1]}, auto)` }}
      className={`grid`}
    >
      {metadata.map((m) => {
        return (
          <GridSquare
            key={m.idForSquare()}
            metadata={m}
            onClick={makeClickCallback(m)}
          />
        );
      })}
    </div>
  );
}

function handleActions(order, setOrder, setCurrent, actions = []) {
  let actionsToDo = actions.filter((v) => v.order === order);
  if (actionsToDo.length == 0) {
    return () => {};
  }
  let actionToDo = actionsToDo[0];
  let timeout = setTimeout(() => {
    console.log(
      `executing order ${order} to go to ${actionToDo.x}, ${actionToDo.y}`
    );
    setCurrent(new GridMetadata(actionToDo.x, actionToDo.y).idForSquare());
    setOrder(order + 1);
    handleActions(order + 1, setOrder, actions);
  }, actionToDo.time * 1000);

  return () => {
    clearTimeout(timeout);
  };
}

function moveCowToId(id) {
  let here;
  if (id) {
    here = document.getElementById(id);
  } else {
    here = document.getElementById("cowBase");
  }
  if (here) {
    let cow = document.getElementById("cow");
    let boundedBox = here.getBoundingClientRect();
    let marginLeft = cow.style.marginLeft || "0px";
    marginLeft = marginLeft.substr(0, marginLeft.length - 2);
    if (boundedBox.x > marginLeft) {
      cow.classList.add("-scale-x-100");
    } else {
      cow.classList.remove("-scale-x-100");
    }
    cow.style.marginTop = boundedBox.y + "px";
    cow.style.marginLeft = boundedBox.x + "px";
  }
}

function generateActions(number, dimensions) {
  let actions = [];
  for (let i = 0; i < number; ++i) {
    actions.push({
      x: Math.floor(Math.random() * dimensions[0]),
      y: Math.floor(Math.random() * dimensions[1]),
      order: i,
      time: 5,
    });
  }
  return actions;
}

let actions = generateActions(50, [8,8]);

function App() {
  console.log(actions);
  let [dimension, setDimension] = useState([8, 8]);
  let [current, setCurrent] = useState("");
  let [order, setOrder] = useState(0);

  let metadata = [...getAllIdsFromDimensions(dimension)].map((cord) => {
    return new GridMetadata(cord.x, cord.y);
  });

  useEffect(() => {
    moveCowToId(current);

    let callback = () => {
      moveCowToId(current);
    };
    window.addEventListener("resize", callback);
    window.addEventListener("scroll", callback);
    return () => {
      window.removeEventListener("resize", callback);
      window.addEventListener("scroll", callback);
    };
  }, [current, dimension]);

  useEffect(() => {
    return handleActions(order, setOrder, setCurrent, actions);
  }, [order]);

  return (
    <>
      <div
        id="cow"
        className="text-4xl md:text-5xl absolute -mt-20 ml-30 transition-all duration-[3000ms] -scale-x-100"
      >
        {Emoji.Cow}
      </div>
      <div
        className={`flex flex-col
                    h-full overflow-scroll
                    bg-neutral-100
                    sans text-neutral-800`}
      >
        <aside className="my-8">
          <Title />
        </aside>
        <main className="m-auto">
          <Grid
            dimension={dimension}
            metadata={metadata}
            onSelect={(m) => {
              // setDimension([dimension[0], dimension[1] + 1]);
              setCurrent(m.idForSquare());
            }}
          />
        </main>
      </div>
    </>
  );
}

export default App;
