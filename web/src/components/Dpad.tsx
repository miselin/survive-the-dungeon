type DpadProps = {
  onMove: (dx: number, dy: number) => void;
};

export function Dpad(props: DpadProps) {
  return (
    <div className="dpad" id="dpad">
      <button
        data-move="up"
        type="button"
        onClick={() => {
          props.onMove(0, -1);
        }}
      >
        &#9650;
      </button>
      <div className="dpad-middle">
        <button
          data-move="left"
          type="button"
          onClick={() => {
            props.onMove(-1, 0);
          }}
        >
          &#9664;
        </button>
        <button
          data-move="down"
          type="button"
          onClick={() => {
            props.onMove(0, 1);
          }}
        >
          &#9660;
        </button>
        <button
          data-move="right"
          type="button"
          onClick={() => {
            props.onMove(1, 0);
          }}
        >
          &#9654;
        </button>
      </div>
    </div>
  );
}
