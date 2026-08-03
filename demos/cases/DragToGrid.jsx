import { useCallback, useMemo, useRef, useState } from 'react';
import { locateID } from '@svar-ui/lib-dom';
import { Grid } from '../../src';
import { getData } from '../data';

import './DragToGrid.css';

export default function DragToGrid() {
  const { countries } = useMemo(() => getData(), []);

  // columns shown in the grid (country renders its label via options)
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

  // start with a couple of rows so there is something to drop onto
  const data = useMemo(
    () => [
      {
        id: 1,
        firstName: 'Ernest',
        lastName: 'Schuppe',
        country: 6,
        email: 'Leora13@yahoo.com',
      },
      {
        id: 2,
        firstName: 'Janis',
        lastName: 'Vandervort',
        country: 4,
        email: 'Mose_Gerhold51@yahoo.com',
      },
      {
        id: 3,
        firstName: 'Makenzie',
        lastName: 'Bode',
        country: 3,
        email: 'Frieda.Sauer61@gmail.com',
      },
    ],
    [],
  );

  // cards available to drag into the grid (no id - assigned on add)
  const cards = useMemo(
    () => [
      {
        firstName: 'Aurelie',
        lastName: 'Fadel',
        country: 5,
        email: 'Aurelie.Fadel@gmail.com',
      },
      {
        firstName: 'Marcus',
        lastName: 'Konopelski',
        country: 1,
        email: 'Marcus_K@yahoo.com',
      },
      {
        firstName: 'Dorthy',
        lastName: 'Hyatt',
        country: 3,
        email: 'Dorthy.Hyatt@hotmail.com',
      },
      {
        firstName: 'Lukas',
        lastName: 'Brakus',
        country: 4,
        email: 'Lukas.Brakus@gmail.com',
      },
    ],
    [],
  );

  const countryById = useMemo(
    () => Object.fromEntries(countries.map((c) => [c.id, c])),
    [countries],
  );

  const api = useRef(null);
  const [dropTargetId, setDropTargetId] = useState(null);

  const rowStyle = useCallback(
    (row) => (row.id === dropTargetId ? 'wx-drop-target' : ''),
    [dropTargetId],
  );

  function onCardDragStart(ev, card) {
    ev.dataTransfer.setData('application/json', JSON.stringify(card));
    ev.dataTransfer.effectAllowed = 'copy';
  }

  function onGridDragOver(ev) {
    // allow drop
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'copy';

    setDropTargetId(locateID(ev, 'data-id'));
  }

  function onGridDragLeave(ev) {
    // only clear when the cursor actually leaves the wrapper
    if (!ev.currentTarget.contains(ev.relatedTarget)) setDropTargetId(null);
  }

  function onGridDrop(ev) {
    ev.preventDefault();

    const raw = ev.dataTransfer.getData('application/json');
    if (!raw) return;
    const row = JSON.parse(raw);

    api.current.exec(
      'add-row',
      dropTargetId != null ? { row, after: dropTargetId } : { row },
    );

    setDropTargetId(null);
  }

  return (
    <div className="demo wx-aacaEdXY">
      <div className="cards wx-aacaEdXY">
        <h4 className="wx-aacaEdXY">Contacts</h4>
        <p className="hint wx-aacaEdXY">
          Drag a card onto the grid to add it as a row.
        </p>
        {cards.map((card) => (
          <div
            key={card.email}
            className="card wx-aacaEdXY"
            draggable="true"
            onDragStart={(ev) => onCardDragStart(ev, card)}
            role="listitem"
          >
            <div className="card-name wx-aacaEdXY">
              {card.firstName} {card.lastName}
            </div>
            <div className="card-meta wx-aacaEdXY">
              <span className="wx-aacaEdXY">
                {countryById[card.country]?.flag}
              </span>
              <span className="wx-aacaEdXY">
                {countryById[card.country]?.label}
              </span>
            </div>
            <div className="card-email wx-aacaEdXY">{card.email}</div>
          </div>
        ))}
      </div>

      <div
        className="grid-box wx-aacaEdXY"
        onDragOver={onGridDragOver}
        onDragLeave={onGridDragLeave}
        onDrop={onGridDrop}
      >
        <Grid ref={api} data={data} columns={columns} rowStyle={rowStyle} />
      </div>
    </div>
  );
}
