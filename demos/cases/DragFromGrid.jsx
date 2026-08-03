import { useMemo, useRef, useState } from 'react';
import { locateID } from '@svar-ui/lib-dom';
import { Grid } from '../../src';
import { getData } from '../data';

import './DragFromGrid.css';

export default function DragFromGrid() {
  const { allData, countries } = useMemo(() => getData(), []);

  const columns = useMemo(
    () => [
      { id: 'id', width: 50, header: 'ID' },
      { id: 'firstName', header: 'First Name', width: 150 },
      { id: 'lastName', header: 'Last Name', width: 150 },
      { id: 'country', options: countries, header: 'Country', width: 120 },
      { id: 'email', header: 'Email', flexgrow: 1 },
    ],
    [countries],
  );

  const data = useMemo(() => allData.slice(0, 12), [allData]);
  const countryById = useMemo(
    () => Object.fromEntries(countries.map((c) => [c.id, c])),
    [countries],
  );

  const api = useRef(null);
  const [droppedCards, setDroppedCards] = useState([]);
  const [boxActive, setBoxActive] = useState(false);

  function onGridDragStart(ev) {
    const id = locateID(ev, 'data-id');
    if (id == null) return;

    const row = api.current.getRow(id);
    ev.dataTransfer.setData('application/json', JSON.stringify(row));
    ev.dataTransfer.effectAllowed = 'copy';
  }

  function onBoxDragOver(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'copy';
    setBoxActive(true);
  }

  function onBoxDragLeave(ev) {
    if (!ev.currentTarget.contains(ev.relatedTarget)) setBoxActive(false);
  }

  function onBoxDrop(ev) {
    ev.preventDefault();
    setBoxActive(false);

    const raw = ev.dataTransfer.getData('application/json');
    if (!raw) return;

    // copy - source row stays in the grid
    const row = JSON.parse(raw);
    setDroppedCards((cards) => [...cards, row]);
  }

  return (
    <div className="demo wx-aacXcaXF">
      <div className="grid-box wx-aacXcaXF" onDragStart={onGridDragStart}>
        <Grid ref={api} data={data} columns={columns} draggableRows />
      </div>

      <div
        className={`drop-box wx-aacXcaXF ${boxActive ? 'active' : ''}`}
        onDragOver={onBoxDragOver}
        onDragLeave={onBoxDragLeave}
        onDrop={onBoxDrop}
      >
        <h4 className="wx-aacXcaXF">Dropped here</h4>
        {droppedCards.length === 0 ? (
          <p className="empty wx-aacXcaXF">
            Drag a row from the grid and drop it here.
          </p>
        ) : (
          droppedCards.map((card, i) => (
            <div className="card wx-aacXcaXF" key={i}>
              <div className="card-name wx-aacXcaXF">
                {card.firstName} {card.lastName}
              </div>
              <div className="card-meta wx-aacXcaXF">
                <span className="wx-aacXcaXF">
                  {countryById[card.country]?.flag}
                </span>
                <span className="wx-aacXcaXF">
                  {countryById[card.country]?.label}
                </span>
              </div>
              <div className="card-email wx-aacXcaXF">{card.email}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
