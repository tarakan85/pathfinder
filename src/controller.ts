import Graph, { Coords } from "./graph";
import Pathfinder, { Vertex } from "./pathfinder";
import View, { cellElems, SearchModes } from "./view";
import { delay } from "./utils";

class Controller {
  constructor(
    private readonly graph: Graph,
    private readonly pf: Pathfinder,
    private readonly view: View
  ) {
    this.view.renderCellElem(cellElems.startPoint, this.pf.startPoint);
    this.view.renderCellElem(cellElems.endPoint, this.pf.endPoint);
    this.view.setSearchMode(SearchModes.PREAPARING);

    this.initEvents();
  }

  private initEvents() {
    this.view.onAddObstacle((coords: Coords) => {
      this.graph.addObstacle(coords);
    });

    this.view.onRemoveObstacle((coords: Coords) => {
      this.graph.removeObstacle(coords);
    });

    this.graph.onObstacleChange((coords: Coords[]) => {
      this.view.renderCellElem(cellElems.obstacle, coords);
    });

    this.pf.onFringeChange((vertex: Vertex[]) => {
      this.view.renderCellElem(cellElems.fringe, vertex.map(v => v.coords));
    });

    this.pf.onClosedChange((vertex: Vertex[]) => {
      this.view.renderCellElem(cellElems.closed, vertex.map(v => v.coords));
    });

    this.pf.onHeadChange((vertex: Vertex | null) => {
      this.view.renderCellElem(cellElems.head, vertex ? vertex.coords : null);
    });

    this.view.onMoveStartPoint((coords: Coords) => {
      this.pf.startPoint = coords;
    });

    this.view.onMoveEndPoint((coords: Coords) => {
      this.pf.endPoint = coords;
    });

    this.pf.onStartPointChange((coords: Coords) => {
      this.view.renderCellElem(cellElems.startPoint, coords);
    });

    this.pf.onEndPointChange((coords: Coords) => {
      this.view.renderCellElem(cellElems.endPoint, coords);
    });

    this.pf.onSuccess(async (coords: Coords[]) => {
      if (!coords.length) {
        this.view.renderCellElem(cellElems.path, null);
      } else {
        let i = 1;
        for (const _ of coords) {
          await delay(33);
          this.view.renderCellElem(cellElems.path, coords.slice(0, i));
          i++;
        }
        this.view.setSearchMode(SearchModes.WAITING_FOR_NEW);
      }
    });

    this.pf.onFail(() => {
      this.view.showFailMsg();
      this.view.renderCellElem(cellElems.path, null);
      this.view.setSearchMode(SearchModes.WAITING_FOR_NEW);
    });

    this.view.onSearchStart(async () => {
      this.view.blockEvents();
      this.view.setSearchMode(SearchModes.IN_PROGRESS);

      for (const _ of this.pf.findPath()) {
        await delay(33);
      }
    });

    this.view.onNewSearch(() => {
      this.graph.clear();
      this.pf.clear();
      this.view.unblockEvents();
      this.view.setSearchMode(SearchModes.PREAPARING);
    });
  }
}

export default Controller;
